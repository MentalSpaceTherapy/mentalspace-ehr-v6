import { api } from '../api';
import secureApi from '../secureApi';
import { encryptionService } from '../encryptionService';
import { auditService } from '../auditService';
import { 
  NoteType, 
  NoteStatus, 
  SupervisionStatus 
} from '../../models/documentation/Note';

// Type for creating/updating a note
export interface NoteRequest {
  clientId: string;
  providerId: string;
  appointmentId?: string;
  noteType: NoteType;
  content?: string;
  structuredContent: any;
  templateId?: string;
  status: NoteStatus;
  supervisorId?: string;
}

// Type for note response
export interface NoteResponse {
  id: string;
  clientId: string;
  providerId: string;
  appointmentId?: string;
  noteType: NoteType;
  content?: string;
  structuredContent: any;
  templateId?: string;
  status: NoteStatus;
  signedBy?: string;
  signedAt?: Date;
  supervisorId?: string;
  supervisionStatus?: SupervisionStatus;
  supervisionDate?: Date;
  supervisionComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Documentation API service with enhanced security
const documentationService = {
  // Get all notes with optional filters
  getNotes: async (filters?: {
    clientId?: string;
    providerId?: string;
    noteType?: NoteType;
    status?: NoteStatus;
    supervisionStatus?: SupervisionStatus;
  }): Promise<NoteResponse[]> => {
    try {
      // Log the action
      auditService.logEvent({
        action: 'FETCH_NOTES',
        description: 'User retrieved notes list',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        metadata: JSON.stringify({ filters })
      });
      
      const response = await secureApi.get('/notes', { params: filters });
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'FETCH_NOTES_ERROR',
        description: `Error retrieving notes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note'
      });
      throw error;
    }
  },

  // Get a single note by ID
  getNote: async (id: string): Promise<NoteResponse> => {
    try {
      auditService.logEvent({
        action: 'FETCH_NOTE',
        description: 'User retrieved a specific note',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id
      });
      
      const response = await secureApi.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'FETCH_NOTE_ERROR',
        description: `Error retrieving note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Create a new note with encryption for sensitive data
  createNote: async (note: NoteRequest): Promise<NoteResponse> => {
    try {
      // Encrypt structured content for sensitive note types
      const sensitiveNoteTypes = [
        NoteType.INTAKE,
        NoteType.PROGRESS,
        NoteType.TREATMENT_PLAN,
        NoteType.DISCHARGE
      ];
      
      let noteToSend = { ...note };
      
      // Encrypt structured content for sensitive note types
      if (sensitiveNoteTypes.includes(note.noteType) && note.structuredContent) {
        // Create a deep copy to avoid modifying the original
        noteToSend = {
          ...note,
          structuredContent: encryptionService.encryptObject(note.structuredContent)
        };
      }
      
      auditService.logEvent({
        action: 'CREATE_NOTE',
        description: `User created a new ${note.noteType} note`,
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        metadata: JSON.stringify({ 
          noteType: note.noteType,
          clientId: note.clientId,
          providerId: note.providerId
        })
      });
      
      const response = await secureApi.post('/notes', noteToSend);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'CREATE_NOTE_ERROR',
        description: `Error creating note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        metadata: JSON.stringify({ 
          noteType: note.noteType,
          clientId: note.clientId
        })
      });
      throw error;
    }
  },

  // Update an existing note
  updateNote: async (id: string, note: Partial<NoteRequest>): Promise<NoteResponse> => {
    try {
      let noteToSend = { ...note };
      
      // Encrypt structured content if present
      if (note.structuredContent) {
        noteToSend = {
          ...note,
          structuredContent: encryptionService.encryptObject(note.structuredContent)
        };
      }
      
      auditService.logEvent({
        action: 'UPDATE_NOTE',
        description: 'User updated a note',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id,
        metadata: JSON.stringify({ 
          noteType: note.noteType,
          status: note.status
        })
      });
      
      const response = await secureApi.put(`/notes/${id}`, noteToSend);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'UPDATE_NOTE_ERROR',
        description: `Error updating note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Save a note as draft with automatic backup
  saveDraft: async (id: string, structuredContent: any): Promise<NoteResponse> => {
    try {
      // Create a local backup of the draft
      const draftKey = `note_draft_${id}`;
      encryptionService.secureStore(draftKey, {
        structuredContent,
        timestamp: new Date().toISOString()
      });
      
      auditService.logEvent({
        action: 'SAVE_DRAFT',
        description: 'User saved a note draft',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id
      });
      
      // Encrypt the structured content before sending
      const encryptedContent = encryptionService.encryptObject(structuredContent);
      
      const response = await secureApi.put(`/notes/${id}/draft`, { 
        structuredContent: encryptedContent 
      });
      
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'SAVE_DRAFT_ERROR',
        description: `Error saving draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      
      // If API call fails, store draft locally for recovery
      const recoveryKey = `note_draft_recovery_${id}`;
      encryptionService.secureStore(recoveryKey, {
        structuredContent,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  },

  // Recover a draft from local storage if available
  recoverDraft: (id: string): any | null => {
    try {
      // Try to recover from regular draft storage
      const draftKey = `note_draft_${id}`;
      let draft = encryptionService.secureRetrieve<{structuredContent: any}>(draftKey);
      
      // If not found, try recovery storage
      if (!draft) {
        const recoveryKey = `note_draft_recovery_${id}`;
        draft = encryptionService.secureRetrieve<{structuredContent: any}>(recoveryKey);
      }
      
      if (draft && draft.structuredContent) {
        auditService.logEvent({
          action: 'RECOVER_DRAFT',
          description: 'User recovered a note draft from local storage',
          module: 'documentation',
          severity: 'info',
          entityType: 'note',
          entityId: id
        });
        
        return draft.structuredContent;
      }
      
      return null;
    } catch (error) {
      auditService.logEvent({
        action: 'RECOVER_DRAFT_ERROR',
        description: `Error recovering draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'warning',
        entityType: 'note',
        entityId: id
      });
      
      return null;
    }
  },

  // Finalize and sign a note with digital signature
  finalizeNote: async (id: string, signature: string): Promise<NoteResponse> => {
    try {
      // Create a hash of the signature for verification
      const signatureHash = encryptionService.hash(signature);
      
      auditService.logEvent({
        action: 'FINALIZE_NOTE',
        description: 'User finalized and signed a note',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id
      });
      
      const response = await secureApi.put(`/notes/${id}/finalize`, { 
        signature: signatureHash,
        timestamp: new Date().toISOString()
      });
      
      // Clear any drafts after successful finalization
      localStorage.removeItem(`note_draft_${id}`);
      localStorage.removeItem(`note_draft_recovery_${id}`);
      
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'FINALIZE_NOTE_ERROR',
        description: `Error finalizing note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Submit a note for supervision
  submitForSupervision: async (id: string, supervisorId: string): Promise<NoteResponse> => {
    try {
      auditService.logEvent({
        action: 'SUBMIT_FOR_SUPERVISION',
        description: 'User submitted a note for supervision',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id,
        metadata: JSON.stringify({ supervisorId })
      });
      
      const response = await secureApi.put(`/notes/${id}/submit-for-supervision`, { supervisorId });
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'SUBMIT_FOR_SUPERVISION_ERROR',
        description: `Error submitting note for supervision: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Approve a note (for supervisors)
  approveNote: async (id: string, comments?: string): Promise<NoteResponse> => {
    try {
      auditService.logEvent({
        action: 'APPROVE_NOTE',
        description: 'Supervisor approved a note',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id
      });
      
      const response = await secureApi.put(`/notes/${id}/approve`, { comments });
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'APPROVE_NOTE_ERROR',
        description: `Error approving note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Reject a note (for supervisors)
  rejectNote: async (id: string, comments: string): Promise<NoteResponse> => {
    try {
      auditService.logEvent({
        action: 'REJECT_NOTE',
        description: 'Supervisor rejected a note',
        module: 'documentation',
        severity: 'info',
        entityType: 'note',
        entityId: id,
        metadata: JSON.stringify({ comments })
      });
      
      const response = await secureApi.put(`/notes/${id}/reject`, { comments });
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'REJECT_NOTE_ERROR',
        description: `Error rejecting note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Delete a note (only drafts can be deleted)
  deleteNote: async (id: string): Promise<void> => {
    try {
      auditService.logEvent({
        action: 'DELETE_NOTE',
        description: 'User deleted a note',
        module: 'documentation',
        severity: 'warning',
        entityType: 'note',
        entityId: id
      });
      
      await secureApi.delete(`/notes/${id}`);
      
      // Clear any drafts
      localStorage.removeItem(`note_draft_${id}`);
      localStorage.removeItem(`note_draft_recovery_${id}`);
    } catch (error) {
      auditService.logEvent({
        action: 'DELETE_NOTE_ERROR',
        description: `Error deleting note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'note',
        entityId: id
      });
      throw error;
    }
  },

  // Get all note templates with optional filters
  getNoteTemplates: async (filters?: {
    templateType?: NoteType;
    isActive?: boolean;
    isGlobal?: boolean;
    createdBy?: string;
  }): Promise<any[]> => {
    try {
      auditService.logEvent({
        action: 'FETCH_TEMPLATES',
        description: 'User retrieved note templates',
        module: 'documentation',
        severity: 'info',
        entityType: 'template'
      });
      
      const response = await secureApi.get('/note-templates', { params: filters });
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'FETCH_TEMPLATES_ERROR',
        description: `Error retrieving templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'template'
      });
      throw error;
    }
  },

  // Get a single note template by ID
  getNoteTemplate: async (id: string): Promise<any> => {
    try {
      auditService.logEvent({
        action: 'FETCH_TEMPLATE',
        description: 'User retrieved a specific note template',
        module: 'documentation',
        severity: 'info',
        entityType: 'template',
        entityId: id
      });
      
      const response = await secureApi.get(`/note-templates/${id}`);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'FETCH_TEMPLATE_ERROR',
        description: `Error retrieving template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'template',
        entityId: id
      });
      throw error;
    }
  },

  // Create a new note template
  createNoteTemplate: async (template: {
    name: string;
    templateType: NoteType;
    content?: string;
    structuredContent: any;
    isGlobal?: boolean;
  }): Promise<any> => {
    try {
      // Encrypt structured content
      const templateToSend = {
        ...template,
        structuredContent: encryptionService.encryptObject(template.structuredContent)
      };
      
      auditService.logEvent({
        action: 'CREATE_TEMPLATE',
        description: `User created a new ${template.templateType} template`,
        module: 'documentation',
        severity: 'info',
        entityType: 'template',
        metadata: JSON.stringify({ 
          templateType: template.templateType,
          name: template.name,
          isGlobal: template.isGlobal
        })
      });
      
      const response = await secureApi.post('/note-templates', templateToSend);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'CREATE_TEMPLATE_ERROR',
        description: `Error creating template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'template'
      });
      throw error;
    }
  },

  // Update an existing note template
  updateNoteTemplate: async (id: string, template: Partial<{
    name: string;
    templateType: NoteType;
    content?: string;
    structuredContent: any;
    isActive: boolean;
    isGlobal: boolean;
  }>): Promise<any> => {
    try {
      let templateToSend = { ...template };
      
      // Encrypt structured content if present
      if (template.structuredContent) {
        templateToSend = {
          ...template,
          structuredContent: encryptionService.encryptObject(template.structuredContent)
        };
      }
      
      auditService.logEvent({
        action: 'UPDATE_TEMPLATE',
        description: 'User updated a note template',
        module: 'documentation',
        severity: 'info',
        entityType: 'template',
        entityId: id
      });
      
      const response = await secureApi.put(`/note-templates/${id}`, templateToSend);
      return response.data;
    } catch (error) {
      auditService.logEvent({
        action: 'UPDATE_TEMPLATE_ERROR',
        description: `Error updating template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'template',
        entityId: id
      });
      throw error;
    }
  },

  // Delete a note template
  deleteNoteTemplate: async (id: string): Promise<void> => {
    try {
      auditService.logEvent({
        action: 'DELETE_TEMPLATE',
        description: 'User deleted a note template',
        module: 'documentation',
        severity: 'warning',
        entityType: 'template',
        entityId: id
      });
      
      await secureApi.delete(`/note-templates/${id}`);
    } catch (error) {
      auditService.logEvent({
        action: 'DELETE_TEMPLATE_ERROR',
        description: `Error deleting template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'documentation',
        severity: 'error',
        entityType: 'template',
        entityId: id
      });
      throw error;
    }
  },
  
  // Check for session timeout and inactivity
  checkSessionActivity: (): boolean => {
    try {
      const lastActivity = localStorage.getItem('lastActivityTimestamp');
      if (!lastActivity) {
        return false;
      }
      
      const lastActivityTime = new Date(lastActivity).getTime();
      const currentTime = new Date().getTime();
      const inactiveTime = currentTime - lastActivityTime;
      
      // Session timeout after 30 minutes of inactivity
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (inactiveTime > sessionTimeout) {
        auditService.logEvent({
          action: 'SESSION_TIMEOUT',
          description: 'User session timed out due to inactivity',
          module: 'documentation',
          severity: 'info'
        });
        
        return false;
      }
      
      // Update last activity timestamp
      localStorage.setItem('lastActivityTimestamp', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error checking session activity:', error);
      return false;
    }
  },
  
  // Record user activity to prevent session timeout
  recordUserActivity: (): void => {
    localStorage.setItem('lastActivityTimestamp', new Date().toISOString());
  }
};

export default documentationService;
