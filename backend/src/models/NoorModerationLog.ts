import mongoose, { Schema } from 'mongoose';

export interface INoorModerationLog {
  _id: string;
  session_id: string;
  patient_name: string;
  user_prompt: string;
  bot_response: string;
  guardrail_fired: boolean;
  risk_level: string;
  created_at: string;
  reviewed: boolean;
}

const NoorModerationLogSchema = new Schema<INoorModerationLog>(
  {
    _id: { type: String, required: true },
    session_id: { type: String, required: true },
    patient_name: { type: String, required: true },
    user_prompt: { type: String, required: true },
    bot_response: { type: String, required: true },
    guardrail_fired: { type: Boolean, default: false },
    risk_level: { type: String, default: 'LOW' },
    created_at: { type: String, default: () => new Date().toISOString() },
    reviewed: { type: Boolean, default: false },
  },
  { _id: false }
);

export const NoorModerationLog = mongoose.model<INoorModerationLog>('NoorModerationLog', NoorModerationLogSchema);
