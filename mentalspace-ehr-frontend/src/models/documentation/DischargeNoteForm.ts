// Form field interfaces for the Discharge Note
export interface DischargeNoteForm {
  // Step 1: Discharge Context
  dischargeContext: {
    dischargeDate: string;
    reasonForDischarge: 'Treatment Completed' | 'Client Dropout' | 'Referral to Higher Care' | 'Other';
    otherDischargeReason?: string;
  };
  
  // Step 2: Course of Treatment Summary
  treatmentSummary: {
    overviewOfTreatment: string;
    keyInterventionsAndProgress: string;
  };
  
  // Step 3: Final Diagnosis & Current Status
  diagnosisAndStatus: {
    finalDiagnosis: string;
    otherDiagnosis?: string;
    clientCurrentStatus: string;
  };
  
  // Step 4: Aftercare & Referrals
  aftercareAndReferrals: {
    recommendationsForFollowUp: string;
    referralsAndCommunityResources: string;
  };
}
