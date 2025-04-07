// cypress/e2e/workflows/crm-lead-conversion.cy.ts
// End-to-end test for cross-module workflow:
// CRM lead conversion to a full client record, followed by scheduling an intake

describe('CRM Lead Conversion Workflow', () => {
  const leadData = {
    firstName: 'Jane',
    lastName: 'Prospect',
    email: 'jane.prospect@example.com',
    phone: '555-987-6543',
    source: 'Website',
    notes: 'Interested in anxiety treatment',
    status: 'New'
  };

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as admin to have access to all modules
      cy.login(users.admin.email, users.admin.password);
    });
  });

  it('should convert a CRM lead to a client and schedule an intake appointment', () => {
    // Step 1: Create a new lead in CRM
    cy.visit('/crm/leads');
    cy.contains('Add Lead').click();
    
    cy.get('input[name="firstName"]').type(leadData.firstName);
    cy.get('input[name="lastName"]').type(leadData.lastName);
    cy.get('input[name="email"]').type(leadData.email);
    cy.get('input[name="phone"]').type(leadData.phone);
    cy.get('select[name="source"]').select(leadData.source);
    cy.get('textarea[name="notes"]').type(leadData.notes);
    cy.get('select[name="status"]').select(leadData.status);
    cy.contains('button', 'Save Lead').click();
    
    // Verify lead was created
    cy.contains('Lead created successfully').should('be.visible');
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).should('be.visible');
    
    // Step 2: Update lead status to "Contacted"
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).click();
    cy.contains('Edit').click();
    cy.get('select[name="status"]').select('Contacted');
    cy.contains('button', 'Save Changes').click();
    
    // Verify status was updated
    cy.contains('Lead updated successfully').should('be.visible');
    cy.contains('Contacted').should('be.visible');
    
    // Step 3: Add a contact record
    cy.contains('Add Contact').click();
    cy.get('textarea[name="contactNotes"]').type('Initial phone call. Client is interested in starting therapy next week.');
    cy.get('select[name="contactType"]').select('Phone');
    cy.contains('button', 'Save Contact').click();
    
    // Verify contact was added
    cy.contains('Contact added successfully').should('be.visible');
    cy.contains('Initial phone call').should('be.visible');
    
    // Step 4: Convert lead to client
    cy.contains('Convert to Client').click();
    
    // Fill in additional client information
    cy.get('input[name="dateOfBirth"]').type('1985-06-15');
    cy.get('input[name="address"]').type('456 Prospect Ave');
    cy.get('input[name="city"]').type('Anytown');
    cy.get('input[name="state"]').type('CA');
    cy.get('input[name="zipCode"]').type('90210');
    cy.get('select[name="status"]').select('Active');
    cy.contains('button', 'Create Client').click();
    
    // Verify client was created
    cy.contains('Client created successfully').should('be.visible');
    
    // Step 5: Navigate to the new client record
    cy.visit('/clients');
    cy.get('input[type="text"]').type(`${leadData.firstName} ${leadData.lastName}`);
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).click();
    
    // Verify client information was transferred from lead
    cy.contains(leadData.email).should('be.visible');
    cy.contains(leadData.phone).should('be.visible');
    
    // Step 6: Schedule an intake appointment
    cy.contains('Schedule Appointment').click();
    
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    cy.get('input[name="date"]').type(tomorrowFormatted);
    cy.get('input[name="time"]').type('14:00');
    cy.get('input[name="duration"]').clear().type('90');
    cy.get('select[name="type"]').select('Initial Assessment');
    cy.get('textarea[name="notes"]').type('Intake appointment for new client converted from CRM lead');
    cy.contains('button', 'Schedule').click();
    
    // Verify appointment was scheduled
    cy.contains('Appointment scheduled successfully').should('be.visible');
    
    // Step 7: Verify appointment appears in scheduling module
    cy.visit('/scheduling');
    cy.contains(tomorrowFormatted).click();
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).should('be.visible');
    cy.contains('Initial Assessment').should('be.visible');
    
    // Step 8: Verify lead status is updated in CRM
    cy.visit('/crm/leads');
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).should('not.exist');
    
    // Check converted leads section
    cy.contains('Converted Leads').click();
    cy.contains(`${leadData.firstName} ${leadData.lastName}`).should('be.visible');
    cy.contains('Converted to Client').should('be.visible');
  });
});
