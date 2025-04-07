import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import documentationService, { NoteResponse } from '../services/documentation/documentationService';
import { NoteType, NoteStatus, SupervisionStatus } from '../models/documentation/Note';

// Define the context type
interface DocumentationContextType {
  notes: NoteResponse[];
  templates: any[];
  loading: boolean;
  error: string | null;
  currentNote: NoteResponse | null;
  fetchNotes: (filters?: any) => Promise<void>;
  fetchTemplates: (filters?: any) => Promise<void>;
  getNote: (id: string) => Promise<NoteResponse>;
  createNote: (noteData: any) => Promise<NoteResponse>;
  updateNote: (id: string, noteData: any) => Promise<NoteResponse>;
  saveDraft: (id: string, structuredContent: any) => Promise<NoteResponse>;
  finalizeNote: (id: string, signature: string) => Promise<NoteResponse>;
  submitForSupervision: (id: string, supervisorId: string) => Promise<NoteResponse>;
  approveNote: (id: string, comments?: string) => Promise<NoteResponse>;
  rejectNote: (id: string, comments: string) => Promise<NoteResponse>;
  deleteNote: (id: string) => Promise<void>;
}

// Create the context
const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined);

// Provider component
export const DocumentationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<NoteResponse | null>(null);

  // Fetch notes with optional filters
  const fetchNotes = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentationService.getNotes(filters);
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates with optional filters
  const fetchTemplates = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentationService.getNoteTemplates(filters);
      setTemplates(data);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get a single note by ID
  const getNote = async (id: string): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const note = await documentationService.getNote(id);
      setCurrentNote(note);
      return note;
    } catch (err) {
      setError('Failed to fetch note');
      console.error('Error fetching note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData: any): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const newNote = await documentationService.createNote(noteData);
      setNotes(prevNotes => [...prevNotes, newNote]);
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const updateNote = async (id: string, noteData: any): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.updateNote(id, noteData);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save a note as draft
  const saveDraft = async (id: string, structuredContent: any): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.saveDraft(id, structuredContent);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to save draft');
      console.error('Error saving draft:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Finalize and sign a note
  const finalizeNote = async (id: string, signature: string): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.finalizeNote(id, signature);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to finalize note');
      console.error('Error finalizing note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit a note for supervision
  const submitForSupervision = async (id: string, supervisorId: string): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.submitForSupervision(id, supervisorId);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to submit note for supervision');
      console.error('Error submitting note for supervision:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve a note (for supervisors)
  const approveNote = async (id: string, comments?: string): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.approveNote(id, comments);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to approve note');
      console.error('Error approving note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject a note (for supervisors)
  const rejectNote = async (id: string, comments: string): Promise<NoteResponse> => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await documentationService.rejectNote(id, comments);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to reject note');
      console.error('Error rejecting note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await documentationService.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    notes,
    templates,
    loading,
    error,
    currentNote,
    fetchNotes,
    fetchTemplates,
    getNote,
    createNote,
    updateNote,
    saveDraft,
    finalizeNote,
    submitForSupervision,
    approveNote,
    rejectNote,
    deleteNote
  };

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
};

// Custom hook to use the documentation context
export const useDocumentation = () => {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error('useDocumentation must be used within a DocumentationProvider');
  }
  return context;
};
