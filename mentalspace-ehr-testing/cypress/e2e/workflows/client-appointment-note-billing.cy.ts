// cypress/e2e/workflows/client-appointment-note-billing.cy.ts
// End-to-end test for the critical user journey:
// A new client is created → an appointment is scheduled → a clinical note is documented and signed → a billing claim is generated → a payment is posted

describe('Client-Appointment-Note-Billing Workflow', () => {
  const clientData = {
    firstName: 'Test',
    lastName: 'Client',
    email: 'test.client@example.com',
    phone: '555-123-4567',
    dateOfBirth: '1990-01-01',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    status: 'Active'
  };

  const appointmentData = {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '10:00',
    duration: 60,
    type: 'Initial Assessment',
    notes: 'New client intake appointment'
  };

  const noteData = {
    title: 'Initial Assessment',
    content: 'Client presented with symptoms of anxiety and depression...',
    diagnosis: 'F41.1 Generalized Anxiety Disorder',
    treatmentPlan: 'Weekly therapy sessions focusing on CBT techniques'
  };

  const claimData = {
    serviceCode: '90791',
    fee: 150.00,
    diagnosisCode: 'F41.1'
  };

  const paymentData = {
    amount: 150.00,
    method: 'Insurance',
    reference: 'INS12345'
  };

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as admin to have access to all modules
      cy.login(users.admin.email, users.admin.password);
    });
  });

  it('should complete the full client-appointment-note-billing workflow', () => {
    // Step 1: Create a new client
    cy.visit('/clients');
    cy.contains('Add Client').click();
    cy.get('input[name="firstName"]').type(clientData.firstName);
    cy.get('input[name="lastName"]').type(clientData.lastName);
    cy.get('input[name="email"]').type(clientData.email);
    cy.get('input[name="phone"]').type(clientData.phone);
    cy.get('input[name="dateOfBirth"]').type(clientData.dateOfBirth);
    cy.get('input[name="address"]').type(clientData.address);
    cy.get('input[name="city"]').type(clientData.city);
    cy.get('input[name="state"]').type(clientData.state);
    cy.get('input[name="zipCode"]').type(clientData.zipCode);
    cy.get('select[name="status"]').select(clientData.status);
    cy.contains('button', 'Save').click();
    
    // Verify client was created
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).should('be.visible');
    cy.contains('Client created successfully').should('be.visible');
    
    // Step 2: Schedule an appointment
    cy.contains('Schedule Appointment').click();
    cy.get('input[name="date"]').type(appointmentData.date);
    cy.get('input[name="time"]').type(appointmentData.time);
    cy.get('input[name="duration"]').clear().type(appointmentData.duration.toString());
    cy.get('select[name="type"]').select(appointmentData.type);
    cy.get('textarea[name="notes"]').type(appointmentData.notes);
    cy.contains('button', 'Schedule').click();
    
    // Verify appointment was scheduled
    cy.contains('Appointment scheduled successfully').should('be.visible');
    
    // Step 3: Navigate to the appointment and create a note
    cy.visit('/scheduling');
    cy.contains(appointmentData.date).click();
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    cy.contains('Create Note').click();
    
    cy.get('input[name="title"]').type(noteData.title);
    cy.get('textarea[name="content"]').type(noteData.content);
    cy.get('input[name="diagnosis"]').type(noteData.diagnosis);
    cy.get('textarea[name="treatmentPlan"]').type(noteData.treatmentPlan);
    cy.contains('button', 'Save Draft').click();
    
    // Verify note was saved
    cy.contains('Note saved successfully').should('be.visible');
    
    // Sign the note
    cy.contains('button', 'Sign Note').click();
    cy.get('input[name="signature"]').type('Dr. Admin');
    cy.contains('button', 'Confirm Signature').click();
    
    // Verify note was signed
    cy.contains('Note signed successfully').should('be.visible');
    
    // Step 4: Generate a billing claim
    cy.visit('/billing/claims');
    cy.contains('New Claim').click();
    
    // Select the client
    cy.get('input[name="clientSearch"]').type(`${clientData.firstName} ${clientData.lastName}`);
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    
    // Select the service
    cy.get('select[name="serviceCode"]').select(claimData.serviceCode);
    cy.get('input[name="fee"]').clear().type(claimData.fee.toString());
    cy.get('input[name="diagnosisCode"]').type(claimData.diagnosisCode);
    cy.contains('button', 'Generate Claim').click();
    
    // Verify claim was generated
    cy.contains('Claim generated successfully').should('be.visible');
    
    // Step 5: Post a payment
    cy.contains('Post Payment').click();
    cy.get('input[name="amount"]').clear().type(paymentData.amount.toString());
    cy.get('select[name="method"]').select(paymentData.method);
    cy.get('input[name="reference"]').type(paymentData.reference);
    cy.contains('button', 'Submit Payment').click();
    
    // Verify payment was posted
    cy.contains('Payment posted successfully').should('be.visible');
    
    // Verify the claim status is updated to "Paid"
    cy.contains('Paid').should('be.visible');
  });
});
