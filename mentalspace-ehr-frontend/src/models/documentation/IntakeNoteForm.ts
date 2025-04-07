// Form field interfaces for the Intake Note
export interface IntakeNoteForm {
  // Step 1: Client Identification & Referral
  clientIdentification: {
    clientName: string;
    dateOfBirth: string;
    referralSource: 'Website' | 'Physician/Referral Office' | 'Advertisement' | 'Social Media' | 'Other';
    otherReferralSource?: string;
  };
  
  // Step 2: Presenting Problem & History of Present Illness
  presentingProblem: {
    problem: string;
    onsetDate: string;
    frequency: 'Daily' | 'Several times a week' | 'Weekly' | 'Monthly';
    severity: 'Mild' | 'Moderate' | 'Severe';
    previousTreatment: boolean;
    treatmentDescription?: string;
    treatmentDuration?: 'Less than 6 months' | '6–12 months' | 'Over 1 year';
  };
  
  // Step 3: Mental Status Examination
  mentalStatusExam: {
    appearance: 'Well-Groomed' | 'Casual' | 'Disheveled' | 'Other';
    appearanceOther?: string;
    behavior: 'Calm/Cooperative' | 'Agitated/Restless' | 'Lethargic/Slowed' | 'Other';
    behaviorOther?: string;
    moodAffect: 'Euthymic (Normal)' | 'Depressed' | 'Anxious' | 'Labile' | 'Other';
    moodAffectOther?: string;
    speech: 'Normal Rate/Volume' | 'Pressured' | 'Slow' | 'Slurred' | 'Other';
    speechOther?: string;
    thoughtProcess: 'Linear/Goal-Directed' | 'Tangential' | 'Flight of Ideas' | 'Other';
    thoughtProcessOther?: string;
    thoughtContent: 'Normal' | 'Delusional' | 'Obsessive' | 'Other';
    thoughtContentOther?: string;
    perceptions: 'None' | 'Auditory Hallucinations' | 'Visual Hallucinations' | 'Other';
    perceptionsOther?: string;
    orientation: 'Fully Oriented' | 'Partially Oriented' | 'Disoriented';
  };
  
  // Step 4: Risk Assessment
  riskAssessment: {
    suicidalIdeation: 'None' | 'Passive' | 'Active without Plan' | 'Active with Plan';
    homicidalIdeation: 'None' | 'Passive' | 'Active without Plan' | 'Active with Plan';
    selfHarmHistory: boolean;
    selfHarmDescription?: string;
    safetyPlan?: string;
  };
  
  // Step 5: Psychosocial & Medical History
  psychosocialMedicalHistory: {
    familyMentalHealthHistory: string[]; // Array of selected options
    otherFamilyHistory?: string;
    substanceUseHistory: 'None' | 'Occasional' | 'Regular' | 'Chronic';
    medicalConditions: string;
    socialSupport: string;
    legalIssues: boolean;
    legalIssuesDescription?: string;
  };
  
  // Step 6: Preliminary Diagnosis & Recommendations
  diagnosisRecommendations: {
    initialDiagnosis: string;
    otherDiagnosis?: string;
    clinicalImpression: string;
    treatmentRecommendations: string;
  };
}
