import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'crypto';
import db from '../db.js';
import { logAuditEvent } from '../audit.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import type { OcrFieldResult, PrescriptionAudit, PrescriptionFieldConfidence } from '../../src/types/index.js';

const router = express.Router();
router.use(requireAuth, requireRole('patient', 'pharmacist', 'admin'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OCR_RATE_LIMIT_WINDOW_MS = 60_000;
const OCR_RATE_LIMIT_MAX = 10;
const LOW_CONFIDENCE_THRESHOLD = 0.75;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const ocrBuckets = new Map<string, { count: number; resetAt: number }>();

const OCR_SYSTEM_PROMPT = `You are a CDSCO-compliant prescription OCR extractor for MediWise.
Return JSON only. Never invent a prescription when the image is not a medical Rx.
Reject Aadhaar cards, PAN cards, passports, selfies, blank pages, screenshots of chats, and medicine packaging photos.`;

const OCR_USER_PROMPT = `Analyse this image. If it is a valid medical prescription, extract structured fields.
If it is not a prescription, set isPrescription to false.

Return JSON with this exact shape:
{
  "isPrescription": boolean,
  "rejectionReason": string,
  "scheduleCategory": "Schedule H" | "Schedule H1" | "Schedule X" | "OTC",
  "fields": {
    "doctorName": { "value": string, "confidence": number },
    "doctorRegNo": { "value": string, "confidence": number },
    "hospitalClinic": { "value": string, "confidence": number },
    "prescribedFor": { "value": string, "confidence": number },
    "drugName": { "value": string, "confidence": number },
    "dosage": { "value": string, "confidence": number },
    "durationDays": { "value": string, "confidence": number },
    "frequency": { "value": string, "confidence": number }
  }
}
confidence is 0 to 1. Use empty strings when unknown.`;

interface IncomingOcrField {
  value?: unknown;
  confidence?: unknown;
}

interface IncomingOcrPayload {
  isPrescription?: unknown;
  rejectionReason?: unknown;
  scheduleCategory?: unknown;
  fields?: Record<string, IncomingOcrField>;
}

const NON_RX_HINTS = ['aadhaar', 'aadhar', 'pan card', 'passport', 'id card', 'license', 'blank', 'selfie'];

const checkOcrRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const bucket = ocrBuckets.get(userId);
  if (!bucket || bucket.resetAt <= now) {
    ocrBuckets.set(userId, { count: 1, resetAt: now + OCR_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= OCR_RATE_LIMIT_MAX) {
    return false;
  }
  bucket.count += 1;
  return true;
};

const stripDataUrl = (raw: string): { mimeType: string; base64: string } | null => {
  const match = raw.trim().match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { mimeType: match[1].toLowerCase(), base64: match[2] };
  }
  return null;
};

const estimateBase64Bytes = (base64: string): number => Math.floor((base64.length * 3) / 4);

const toField = (raw: IncomingOcrField | undefined, fallback = ''): OcrFieldResult => {
  const value = typeof raw?.value === 'string' ? raw.value.trim() : fallback;
  const confidence = typeof raw?.confidence === 'number' && Number.isFinite(raw.confidence)
    ? Math.min(1, Math.max(0, raw.confidence))
    : 0;
  return {
    value,
    confidence,
    needsReview: confidence < LOW_CONFIDENCE_THRESHOLD || value.length === 0,
  };
};

const mapSchedule = (value: unknown): PrescriptionAudit['scheduleCategory'] => {
  if (value === 'Schedule H1' || value === 'Schedule X' || value === 'OTC' || value === 'Schedule H') {
    return value;
  }
  return 'Schedule H';
};

const parseJsonPayload = (text: string): IncomingOcrPayload => {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed: unknown = JSON.parse(trimmed);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('OCR payload was not an object');
  }
  return parsed as IncomingOcrPayload;
};

const looksLikeNonPrescription = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return NON_RX_HINTS.some((hint) => lower.includes(hint));
};

const persistAudit = (
  audit: PrescriptionAudit,
  actorId: string,
  needsReview: boolean,
): void => {
  db.prepare(`
    INSERT OR REPLACE INTO prescription_audits
      (rx_id, order_id, file_name, upload_date, doctor_name, doctor_reg_no,
       hospital_clinic, prescribed_for, drug_name, dosage, duration_days, frequency,
       dispense_limit, ocr_verified, needs_pharmacist_review, confidence_json, schedule_category)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    audit.rxId,
    audit.fileName,
    audit.uploadDate,
    audit.doctorName,
    audit.doctorRegNo,
    audit.hospitalClinic,
    audit.prescribedFor,
    audit.drugName ?? '',
    audit.dosage,
    audit.durationDays,
    audit.frequency,
    audit.dispenseLimitQty,
    audit.ocrVerified ? 1 : 0,
    needsReview ? 1 : 0,
    JSON.stringify(audit.fieldConfidence ?? {}),
    audit.scheduleCategory,
  );

  logAuditEvent('PRESCRIPTION_OCR_PARSED', audit.rxId, actorId, {
    fileName: audit.fileName,
    needsPharmacistReview: needsReview,
    ocrVerified: audit.ocrVerified,
  });
};

const buildAuditFromFields = (
  fields: PrescriptionFieldConfidence,
  fileName: string,
  scheduleCategory: PrescriptionAudit['scheduleCategory'],
): { audit: PrescriptionAudit; needsReview: boolean } => {
  const durationParsed = Number.parseInt(fields.durationDays.value, 10);
  const durationDays = Number.isFinite(durationParsed) && durationParsed > 0 ? durationParsed : 30;
  const needsReview = Object.values(fields).some((field) => field.needsReview);
  const audit: PrescriptionAudit = {
    rxId: `RX-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    fileName,
    uploadDate: new Date().toISOString().slice(0, 10),
    doctorName: fields.doctorName.value,
    doctorRegNo: fields.doctorRegNo.value,
    hospitalClinic: fields.hospitalClinic.value,
    prescribedFor: fields.prescribedFor.value,
    drugName: fields.drugName.value,
    dosage: fields.dosage.value,
    durationDays,
    frequency: fields.frequency.value,
    dispenseLimitQty: 30,
    ocrVerified: !needsReview,
    needsPharmacistReview: needsReview,
    fieldConfidence: fields,
    scheduleCategory,
  };
  return { audit, needsReview };
};

/**
 * POST /api/rx/parse
 * Upload an Rx image (base64) → Gemini multimodal → structured PrescriptionAudit fields.
 */
router.post('/parse', async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.sub ?? 'anonymous_user';
  if (!checkOcrRateLimit(userId)) {
    res.status(429).json({ error: 'Prescription OCR rate limit reached (max 10 requests/minute).' });
    return;
  }

  const { imageBase64, fileName, mimeType } = req.body as {
    imageBase64?: string;
    fileName?: string;
    mimeType?: string;
  };

  if (!imageBase64?.trim() || !fileName?.trim()) {
    res.status(400).json({ error: 'imageBase64 and fileName are required.' });
    return;
  }

  const parsedDataUrl = stripDataUrl(imageBase64);
  const resolvedMime = (parsedDataUrl?.mimeType ?? mimeType ?? '').toLowerCase();
  const base64 = parsedDataUrl?.base64 ?? imageBase64.replace(/\s/g, '');

  if (!ALLOWED_MIME_TYPES.has(resolvedMime)) {
    res.status(400).json({ error: 'Only JPEG, PNG, or WebP prescription images are accepted.' });
    return;
  }

  if (estimateBase64Bytes(base64) > MAX_IMAGE_BYTES) {
    res.status(413).json({ error: 'Prescription image exceeds the 5MB size limit.' });
    return;
  }

  if (looksLikeNonPrescription(fileName) && !GEMINI_API_KEY) {
    res.status(422).json({
      error: 'This image does not appear to be a medical prescription. Upload a doctor-issued Rx.',
    });
    return;
  }

  if (!GEMINI_API_KEY) {
    const fields: PrescriptionFieldConfidence = {
      doctorName: { value: 'Dr. Rajesh Iyer', confidence: 0.92, needsReview: false },
      doctorRegNo: { value: 'KMC-48192', confidence: 0.88, needsReview: false },
      hospitalClinic: { value: 'Manipal Heart Institute', confidence: 0.9, needsReview: false },
      prescribedFor: { value: 'Anika Sharma', confidence: 0.86, needsReview: false },
      drugName: { value: 'Atorvastatin Calcium 20 mg', confidence: 0.81, needsReview: false },
      dosage: { value: '20 mg', confidence: 0.84, needsReview: false },
      durationDays: { value: '30', confidence: 0.79, needsReview: false },
      frequency: { value: 'Once daily at bedtime', confidence: 0.8, needsReview: false },
    };
    const { audit, needsReview } = buildAuditFromFields(fields, fileName, 'Schedule H1');
    persistAudit(audit, userId, needsReview);
    res.json({
      data: audit,
      message: 'Dev-mode OCR used because GEMINI_API_KEY is not configured.',
    });
    return;
  }

  try {
    const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: resolvedMime, data: base64 } },
            { text: OCR_USER_PROMPT },
          ],
        },
      ],
      config: {
        systemInstruction: OCR_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const payload = parseJsonPayload(result.text ?? '{}');
    if (payload.isPrescription !== true) {
      res.status(422).json({
        error: typeof payload.rejectionReason === 'string' && payload.rejectionReason.trim()
          ? payload.rejectionReason
          : 'This image is not a valid medical prescription. Upload a doctor-issued Rx.',
      });
      return;
    }

    const incomingFields = payload.fields ?? {};
    const fields: PrescriptionFieldConfidence = {
      doctorName: toField(incomingFields.doctorName),
      doctorRegNo: toField(incomingFields.doctorRegNo),
      hospitalClinic: toField(incomingFields.hospitalClinic),
      prescribedFor: toField(incomingFields.prescribedFor),
      drugName: toField(incomingFields.drugName),
      dosage: toField(incomingFields.dosage),
      durationDays: toField(incomingFields.durationDays),
      frequency: toField(incomingFields.frequency),
    };

    const { audit, needsReview } = buildAuditFromFields(fields, fileName, mapSchedule(payload.scheduleCategory));
    persistAudit(audit, userId, needsReview);
    res.json({ data: audit });
  } catch (error) {
    console.error('[Rx OCR] Gemini parse error:', error);
    res.status(502).json({ error: 'Prescription OCR is temporarily unavailable. Please retry or enter details for pharmacist review.' });
  }
});

export default router;
