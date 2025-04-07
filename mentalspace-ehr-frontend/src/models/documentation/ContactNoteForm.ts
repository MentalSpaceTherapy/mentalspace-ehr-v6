// Form field interfaces for the Contact/Consultation Note
export interface ContactNoteForm {
  // Step 1: Contact Details
  contactDetails: {
    dateTime: string;
    contactType: 'Phone' | 'Email' | 'In-Person' | 'External Consultation';
    participants: string[]; // Array of staff and client IDs
  };
  
  // Step 2: Interaction Summary
  interactionSummary: {
    detailedSummary: string;
  };
  
  // Step 3: Outcome & Next Steps
  outcomeAndNextSteps: {
    outcome: 'Follow-Up Scheduled' | 'No Further Action' | 'Referral Provided' | 'Other';
    outcomeOther?: string;
    nextSteps?: string;
  };
}
