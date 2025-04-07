// cypress/e2e/workflows/note-completion-billing.cy.ts
// End-to-end test for cross-module workflow:
// Note completion → Billing claim generation

describe('Note Completion to Billing Claim Workflow', () => {
  const clientData = {
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'michael.thompson@example.com'
  };

  const noteData = {
    title: 'Therapy Session',
    content: 'Client reported decreased anxiety symptoms following implementation of CBT techniques.',
    diagnosis: 'F41.1 Generalized Anxiety Disorder',
    treatmentPlan: 'Continue weekly CBT sessions, focusing on exposure exercises.'
  };

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as clinician
      cy.login(users.clinician.email, users.clinician.password);
    });
  });

  it('should complete and sign a note, then verify a billing claim is automatically generated', () => {
    // Step 1: Navigate to documentation module
    cy.visit('/documentation');
    
    // Step 2: Create a new note
    cy.contains('New Note').click();
    
    // Step 3: Search for and select a client
    cy.get('input[name="clientSearch"]').type(clientData.firstName);
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    
    // Step 4: Fill in note details
    cy.get('input[name="title"]').type(noteData.title);
    cy.get('textarea[name="content"]').type(noteData.content);
    cy.get('input[name="diagnosis"]').type(noteData.diagnosis);
    cy.get('textarea[name="treatmentPlan"]').type(noteData.treatmentPlan);
    
    // Step 5: Select CPT code for billing
    cy.get('select[name="cptCode"]').select('90834 - Psychotherapy, 45 minutes');
    
    // Step 6: Save the note
    cy.contains('button', 'Save Draft').click();
    
    // Verify note was saved
    cy.contains('Note saved successfully').should('be.visible');
    
    // Step 7: Sign the note
    cy.contains('button', 'Sign Note').click();
    cy.get('input[name="signature"]').type('Dr. John Doe');
    cy.contains('button', 'Confirm Signature').click();
    
    // Verify note was signed
    cy.contains('Note signed successfully').should('be.visible');
    
    // Step 8: Verify notification about claim generation
    cy.contains('Billing claim has been automatically generated').should('be.visible');
    
    // Step 9: Navigate to billing module
    cy.visit('/billing/claims');
    
    // Step 10: Verify claim exists for the client and service
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).should('be.visible');
    cy.contains('90834').should('be.visible');
    cy.contains('Pending').should('be.visible');
    
    // Step 11: Open the claim details
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    
    // Verify claim details match the note
    cy.contains('90834 - Psychotherapy, 45 minutes').should('be.visible');
    cy.contains('F41.1').should('be.visible');
    cy.contains('Generated from signed note').should('be.visible');
    
    // Step 12: Verify link back to the source note
    cy.contains('View Source Note').click();
    
    // Verify we're taken to the original note
    cy.url().should('include', '/documentation/note/');
    cy.contains(noteData.title).should('be.visible');
    cy.contains(noteData.content).should('be.visible');
  });
});
