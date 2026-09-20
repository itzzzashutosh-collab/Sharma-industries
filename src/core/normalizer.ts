import { NormalizedMessage } from '../types';

export function normalizeWebhook(payload: any): NormalizedMessage {
  const lid = payload.from || '';
  const text = payload.body?.text || '';
  
  return {
    lid,
    text
  };
}

export function extractLID(payload: any): string {
  return payload?.from || '';
}

export function extractMessage(payload: any): string {
  return payload?.body?.text || '';
}