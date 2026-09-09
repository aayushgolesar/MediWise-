import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'crypto';
import { logAuditEvent } from '../audit.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { NoorModerationLog } from '../models/NoorModerationLog.js';
import { Medicine } from '../models/Medicine.js';

const router = express.Router();
router.use(requireAuth);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;
const CHAT_RATE_LIMIT_MAX = 20;
const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_CHARS = 12_000;
const MAX_MESSAGE_CHARS = 2_000;

const userChatBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = userChatBuckets.get(userId);
  if (!bucket || bucket.resetAt <= now) {
    userChatBuckets.set(userId, { count: 1, resetAt: now + CHAT_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= CHAT_RATE_LIMIT_MAX) {
    return false;
  }
  bucket.count += 1;
  return true;
}

const NOOR_SYSTEM_PROMPT = `You are Noor, the MediWise 24/7 Rx & Generic Medicine AI Assistant.

IDENTITY & SCOPE:
- You help patients understand generic medicines, bioequivalence, CDSCO drug schedules, and MediWise platform features (escrow payments, order tracking, prescription requirements).
- You are NOT a doctor. You NEVER provide a personal diagnosis, treatment plan, or dosage adjustment.
- You ALWAYS recommend consulting a registered medical practitioner for clinical decisions.

REGULATORY COMPLIANCE (MANDATORY — NON-OVERRIDABLE):
- Schedule H medicines REQUIRE a valid prescription. Never suggest bypassing this requirement.
- Schedule H1 medicines require BOTH a prescription AND pharmacist register entry.
- Schedule X and Narcotic / Psychotropic substances cannot be purchased on this platform without physical in-clinic counter dispensing.
- NEVER advise doubling doses for missed medications — always recommend contacting the prescribing doctor.
- Always remind users that generic medicines under CDSCO approval are bioequivalent to their branded counterparts.

SAFETY GUARDRAILS:
- If a user asks about overdose, drug combination risks, suicidal ideation, or non-prescribed Schedule X narcotics, immediately direct them to emergency services (112) and National Health Tele-helplines.
- Refuse to answer questions outside the scope of medicines, MediWise platform operations, and general health information.

TONE: Professional, warm, concise. Use plain English. Avoid excessive medical jargon.

Statutory Disclaimer: This AI provides general medicine information only. It does not constitute medical advice. Always consult your registered physician for clinical guidance.`;

const CONTROLLED_SCHEDULE_KEYWORDS = [
  'schedule x', 'ketamine', 'methadone', 'morphine', 'fentanyl', 'oxycodone',
  'pethidine', 'buprenorphine', 'alprazolam overdose', 'overdose', 'double dose',
  'suicid', 'emergency', 'lethal dose',
];

interface ChatTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const clampText = (value: string, max: number): string => value.slice(0, max);

const sanitiseHistory = (raw: unknown): ChatTurn[] => {
  if (!Array.isArray(raw)) return [];
  const turns: ChatTurn[] = [];

  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue;
    const candidate = entry as { role?: unknown; parts?: Array<{ text?: unknown }> };
    if (candidate.role !== 'user' && candidate.role !== 'model') continue;
    const firstPart = candidate.parts?.[0];
    if (typeof firstPart?.text !== 'string') continue;
    const text = clampText(firstPart.text.trim(), MAX_MESSAGE_CHARS);
    if (!text) continue;
    turns.push({ role: candidate.role, parts: [{ text }] });
  }

  const windowed = turns.slice(-MAX_HISTORY_TURNS);
  while (windowed.length > 1 && windowed.reduce((sum, turn) => sum + (turn.parts[0]?.text.length ?? 0), 0) > MAX_HISTORY_CHARS) {
    windowed.shift();
  }
  return windowed;
};

const getAboveH1Keywords = async (): Promise<string[]> => {
  const medicines = await Medicine.find({
    $or: [
      { schedule: /Schedule X/i },
      { schedule: /H1/i }
    ]
  }).select('brand_name generic_name').lean();
  
  return medicines.flatMap((m) => [m.brand_name, m.generic_name]).filter(Boolean).map((name) => name.toLowerCase());
};

const detectGuardrail = async (prompt: string, response: string): Promise<{ fired: boolean; risk: 'HIGH' | 'LOW'; matched?: string }> => {
  const haystack = `${prompt}\n${response}`.toLowerCase();
  const keyword = CONTROLLED_SCHEDULE_KEYWORDS.find((item) => haystack.includes(item));
  if (keyword) {
    return { fired: true, risk: 'HIGH', matched: keyword };
  }
  const controlledDrugNames = await getAboveH1Keywords();
  const mentionsControlledDrug = controlledDrugNames.some((name) => haystack.includes(name) && /without (an? )?rx|no prescription|skip (the )?rx/.test(haystack));
  if (mentionsControlledDrug) {
    return { fired: true, risk: 'HIGH', matched: 'schedule_h1_bypass' };
  }
  return { fired: false, risk: 'LOW' };
};

const insertModerationLog = async (
  userId: string,
  patientName: string,
  prompt: string,
  response: string,
  guardrailFired: boolean,
  riskLevel: string,
): Promise<void> => {
  await NoorModerationLog.create({
    _id: randomUUID(),
    session_id: userId,
    patient_name: patientName,
    user_prompt: prompt,
    bot_response: response,
    guardrail_fired: guardrailFired,
    risk_level: riskLevel,
    created_at: new Date().toISOString(),
    reviewed: false,
  });
};

/**
 * POST /api/ai/chat
 * Secure Gemini proxy. Client system prompts are ignored; Noor's CDSCO prompt is always applied.
 */
router.post('/chat', async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.sub || 'anonymous_user';
  const patientName = req.auth?.role === 'patient' ? 'Authenticated Patient' : 'Authenticated User';

  if (!checkChatRateLimit(userId)) {
    res.status(429).json({ error: 'Chat rate limit reached (max 20 requests/minute). Please wait a moment.' });
    return;
  }

  const { message, history } = req.body as { message?: unknown; history?: unknown };
  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const safeMessage = clampText(message.trim(), MAX_MESSAGE_CHARS);
  const chatHistory = sanitiseHistory(history);
  const promptScreen = await detectGuardrail(safeMessage, '');

  if (!GEMINI_API_KEY) {
    const fallbackResponse = promptScreen.fired
      ? `Under CDSCO Drugs & Cosmetics Act regulations, inquiries involving ${promptScreen.matched?.toUpperCase() || 'controlled substances'} or acute safety concerns cannot be processed by AI. Please contact emergency services (112) or your nearest healthcare facility immediately.`
      : `[Dev Mode — No GEMINI_API_KEY] Noor received: "${safeMessage}". Generic medicines are verified bioequivalent by CDSCO. Always consult your doctor for prescription adjustments.`;

    await insertModerationLog(userId, patientName, safeMessage, fallbackResponse, promptScreen.fired, promptScreen.risk);
    res.json({ data: { response: fallbackResponse, guardrailFired: promptScreen.fired } });
    return;
  }

  try {
    const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const chat = genai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: NOOR_SYSTEM_PROMPT },
      history: chatHistory,
    });

    const result = await chat.sendMessage({ message: safeMessage });
    const responseText = result.text ?? 'I could not generate a response. Please try again.';
    const guardrail = await detectGuardrail(safeMessage, responseText);

    await insertModerationLog(userId, patientName, safeMessage, responseText, guardrail.fired, guardrail.risk);
    res.json({ data: { response: responseText, guardrailFired: guardrail.fired } });
  } catch (error) {
    console.error('[Noor AI] Gemini API error:', error);
    res.status(502).json({ error: 'AI service temporarily unavailable. Please try again shortly.' });
  }
});

/**
 * GET /api/ai/moderation
 * Admin moderation queue for NoorModerationView.
 */
router.get('/moderation', requireRole('admin'), async (_req, res, next) => {
  try {
    const logs = await NoorModerationLog.find().sort({ created_at: -1 }).limit(50).lean();
    res.json({ data: logs });
  } catch (error: unknown) { next(error); }
});

/**
 * PUT /api/ai/moderation/:id
 * Approve or redact a logged Noor response.
 */
router.put('/moderation/:id', requireRole('admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id;
    const existing = await NoorModerationLog.findById(id);
    if (!existing) {
      res.status(404).json({ error: 'Log entry not found' });
      return;
    }

    const { action } = req.body as { action?: unknown };
    if (action === 'redact') {
      const redactedText = '[REDACTED BY CLINICAL MODERATOR: Response breached statutory CDSCO guidance standards.]';
      await NoorModerationLog.findByIdAndUpdate(id, {
        bot_response: redactedText,
        reviewed: true,
        risk_level: 'REDACTED',
      });
      await logAuditEvent('NOOR_RESPONSE_MODERATED', id, req.auth?.sub ?? null, { action: 'redact' });
      res.json({ data: { id, bot_response: redactedText, status: 'Redacted', reviewed: true } });
      return;
    }

    await NoorModerationLog.findByIdAndUpdate(id, {
      reviewed: true,
      risk_level: 'LOW',
    });
    await logAuditEvent('NOOR_RESPONSE_MODERATED', id, req.auth?.sub ?? null, { action: 'approve' });
    res.json({ data: { id, status: 'Approved', reviewed: true } });
  } catch (error: unknown) { next(error); }
});

export default router;
