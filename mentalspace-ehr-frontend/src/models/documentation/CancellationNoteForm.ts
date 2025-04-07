// Form field interfaces for the Cancellation/Missed Appointment Note
export interface CancellationNoteForm {
  // Step 1: Appointment Details
  appointmentDetails: {
    scheduledDateTime: string;
    clientName: string;
    sessionType: string;
  };
  
  // Step 2: Reason for Cancellation/No-Show
  cancellationReason: {
    reason: 'Client Canceled' | 'Provider Canceled' | 'No-Show' | 'Technical Issue' | 'Other';
    otherReason?: string;
  };
  
  // Step 3: Follow-Up Actions
  followUpActions: {
    rescheduled: boolean;
    rescheduleDateTime?: string;
    followUpRequired?: string;
  };
}
