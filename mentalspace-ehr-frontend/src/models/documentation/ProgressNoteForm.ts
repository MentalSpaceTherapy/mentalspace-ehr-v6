// Form field interfaces for the Progress Note
export interface ProgressNoteForm {
  // Step 1: Session Context
  sessionContext: {
    dateTime: string;
    sessionType: 'Individual' | 'Group' | 'Couples' | 'Family' | 'Intake' | 'Telehealth';
    duration: number; // in minutes
  };
  
  // Step 2: Subjective (S) / Data (D)
  subjective: {
    clientReport: string;
    anxietyRating?: number; // 1-10 scale
    depressionRating?: number; // 1-10 scale
    otherSymptomRatings?: {
      name: string;
      rating: number;
    }[];
  };
  
  // Step 3: Objective (O)
  objective: {
    clinicianObservations: string;
    mseSummary?: string;
  };
  
  // Step 4: Assessment (A)
  assessment: {
    clinicianAssessment: string;
    riskLevel: 'Stable' | 'Elevated' | 'Critical';
  };
  
  // Step 5: Plan (P)
  plan: {
    interventionsUsed: string;
    homeworkAssigned?: string;
    nextSteps: 'Schedule Follow-Up' | 'Referral' | 'No Change' | 'Other';
    nextStepsOther?: string;
  };
}
