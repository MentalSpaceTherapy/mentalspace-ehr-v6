import { Note, NoteType } from './Note';

export interface NoteTemplate {
  id: string;
  name: string;
  description?: string;
  note_type: NoteType;
  template_data: any; // JSON structure containing template fields
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
