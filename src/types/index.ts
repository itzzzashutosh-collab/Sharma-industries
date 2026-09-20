export type Role = 
  | 'OWNER' 
  | 'MANAGER' 
  | 'ACCOUNTANT' 
  | 'SUPERVISOR' 
  | 'OPERATOR' 
  | 'DEALER' 
  | 'VENDOR' 
  | 'CUSTOMER' 
  | 'UNKNOWN';

export interface User {
  lid: string;
  name: string;
  role: Role;
  language: string;
  active: boolean;
  created_at: string;
}

export interface MessageLog {
  id: string;
  lid: string;
  role: Role;
  raw_message: string;
  routed_to: string;
  status: string;
  created_at: string;
}

export interface WebhookPayload {
  from: string;
  body?: {
    text?: string;
  };
}

export interface NormalizedMessage {
  lid: string;
  text: string;
}
