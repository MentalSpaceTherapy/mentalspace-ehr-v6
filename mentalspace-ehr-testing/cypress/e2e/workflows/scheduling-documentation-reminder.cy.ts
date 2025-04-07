// cypress/e2e/workflows/scheduling-documentation-reminder.cy.ts
// End-to-end test for cross-module workflow:
// Appointment scheduling → Documentation reminder

describe('Scheduling to Documentation Reminder Workflow', () => {
  const clientData = {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com'
  };

  const appointmentData = {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '15:30',
    duration: 50,
    type: 'Therapy Session',
    notes: 'Follow-up session'
  };

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as clinician
      cy.login(users.clinician.email, users.clinician.password);
    });
  });

  it('should schedule an appointment and verify documentation reminders are generated', () => {
    // Step 1: Navigate to scheduling
    cy.visit('/scheduling');
    
    // Step 2: Create a new appointment
    cy.contains('New Appointment').click();
    
    // Step 3: Search for and select a client
    cy.get('input[name="clientSearch"]').type(clientData.firstName);
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    
    // Step 4: Fill in appointment details
    cy.get('input[name="date"]').type(appointmentData.date);
    cy.get('input[name="time"]').type(appointmentData.time);
    cy.get('input[name="duration"]').clear().type(appointmentData.duration.toString());
    cy.get('select[name="type"]').select(appointmentData.type);
    cy.get('textarea[name="notes"]').type(appointmentData.notes);
    cy.contains('button', 'Schedule').click();
    
    // Verify appointment was scheduled
    cy.contains('Appointment scheduled successfully').should('be.visible');
    
    // Step 5: Navigate to dashboard to check for documentation reminders
    cy.visit('/dashboard');
    
    // Verify the appointment appears in upcoming appointments
    cy.get('[data-testid="upcoming-appointments"]').within(() => {
      cy.contains(appointmentData.date).should('be.visible');
      cy.contains(appointmentData.time).should('be.visible');
      cy.contains(`${clientData.firstName} ${clientData.lastName}`).should('be.visible');
    });
    
    // Step 6: Complete the appointment (mark as attended)
    cy.visit('/scheduling');
    cy.contains(appointmentData.date).click();
    cy.contains(`${clientData.firstName} ${clientData.lastName}`).click();
    cy.get('select[name="status"]').select('Attended');
    cy.contains('button', 'Update Status').click();
    
    // Verify status was updated
    cy.contains('Appointment status updated successfully').should('be.visible');
    
    // Step 7: Check dashboard for documentation reminder
    cy.visit('/dashboard');
    
    // Verify documentation reminder appears
    cy.get('[data-testid="documentation-due"]').within(() => {
      cy.contains(`${clientData.firstName} ${clientData.lastName}`).should('be.visible');
      cy.contains(appointmentData.date).should('be.visible');
      cy.contains('Documentation Due').should('be.visible');
    });
    
    // Step 8: Check notifications for documentation reminder
    cy.get('[data-testid="notifications-icon"]').click();
    cy.contains(`Documentation due for ${clientData.firstName} ${clientData.lastName}`).should('be.visible');
    
    // Step 9: Navigate to documentation module from reminder
    cy.get('[data-testid="documentation-due"]').within(() => {
      cy.contains('Create Note').click();
    });
    
    // Verify we're in the documentation module with the correct client selected
    cy.url().should('include', '/documentation/new');
    cy.get('[data-testid="client-name"]').should('contain', `${clientData.firstName} ${clientData.lastName}`);
    cy.get('[data-testid="session-date"]').should('contain', appointmentData.date);
  });
});
