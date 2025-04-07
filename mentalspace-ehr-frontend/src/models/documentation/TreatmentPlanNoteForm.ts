// Form field interfaces for the Treatment Plan Note
export interface TreatmentPlanNoteForm {
  // Step 1: Basic Client & Diagnosis Information
  basicInfo: {
    clientName: string;
    planCreationDate: string;
    currentDiagnosis: string;
    otherDiagnosis?: string;
  };
  
  // Step 2: Goals
  goals: {
    description: string;
  }[];
  
  // Step 3: Objectives for Each Goal
  objectives: {
    goalIndex: number;
    description: string;
    targetDate: string;
    metrics: string;
  }[];
  
  // Step 4: Interventions
  interventions: {
    objectiveIndex: number;
    description: string;
    frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'As Needed';
  }[];
  
  // Step 5: Sign-Off & Client Involvement
  signOff: {
    clientReviewed: boolean;
    clientSignature?: string;
    clinicianSignature: string;
  };
}
