import { Client } from '../Client';
import { Staff } from '../Staff';

export enum NoteType {
  INTAKE = 'INTAKE',
  PROGRESS = 'PROGRESS',
  TREATMENT_PLAN = 'TREATMENT_PLAN',
  DISCHARGE = 'DISCHARGE',
  CANCELLATION = 'CANCELLATION',
  CONTACT = 'CONTACT',
  OTHER = 'OTHER'
}

export enum NoteStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  SIGNED = 'SIGNED',
  LOCKED = 'LOCKED'
}

export enum SupervisionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Note {
  id: string;
  client_id: string;
  client?: Client;
  provider_id: string;
  provider?: Staff;
  appointment_id?: string;
  note_type: NoteType;
  content: any; // JSON structure containing form data
  template_id?: string;
  status: NoteStatus;
  signed_by?: string;
  signer?: Staff;
  signed_at?: Date;
  supervisor_id?: string;
  supervisor?: Staff;
  supervision_status?: SupervisionStatus;
  supervision_date?: Date;
  supervision_comments?: string;
  created_at: Date;
  updated_at: Date;
}
