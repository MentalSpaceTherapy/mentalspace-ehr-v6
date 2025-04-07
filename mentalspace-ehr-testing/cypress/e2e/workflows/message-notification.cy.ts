// cypress/e2e/workflows/message-notification.cy.ts
// End-to-end test for cross-module workflow:
// Message receipt → Notification

describe('Message to Notification Workflow', () => {
  const messageData = {
    subject: 'Important Update',
    content: 'This is an important message regarding your upcoming appointment.',
    priority: 'High'
  };

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as admin
      cy.login(users.admin.email, users.admin.password);
    });
  });

  it('should send a message and verify notifications are generated for the recipient', () => {
    // Step 1: Navigate to messaging module
    cy.visit('/messaging');
    
    // Step 2: Create a new message
    cy.contains('New Message').click();
    
    // Step 3: Select recipient (clinician)
    cy.get('input[name="recipientSearch"]').type('clinician');
    cy.contains('Dr. John Doe').click();
    
    // Step 4: Fill in message details
    cy.get('input[name="subject"]').type(messageData.subject);
    cy.get('textarea[name="content"]').type(messageData.content);
    cy.get('select[name="priority"]').select(messageData.priority);
    cy.contains('button', 'Send Message').click();
    
    // Verify message was sent
    cy.contains('Message sent successfully').should('be.visible');
    
    // Step 5: Logout as admin
    cy.contains('Logout').click();
    
    // Step 6: Login as clinician
    cy.fixture('users').then((users) => {
      cy.login(users.clinician.email, users.clinician.password);
    });
    
    // Step 7: Check for notification on dashboard
    cy.visit('/dashboard');
    
    // Verify notification badge is visible
    cy.get('[data-testid="notifications-icon"]').within(() => {
      cy.get('[data-testid="notification-badge"]').should('be.visible');
    });
    
    // Step 8: Open notifications
    cy.get('[data-testid="notifications-icon"]').click();
    
    // Verify message notification appears
    cy.contains('New message: Important Update').should('be.visible');
    cy.contains('High Priority').should('be.visible');
    
    // Step 9: Click on notification to navigate to message
    cy.contains('New message: Important Update').click();
    
    // Verify we're in the messaging module with the correct message open
    cy.url().should('include', '/messaging/inbox');
    cy.contains(messageData.subject).should('be.visible');
    cy.contains(messageData.content).should('be.visible');
    
    // Step 10: Verify read receipt is generated
    cy.contains('Read').should('be.visible');
    
    // Step 11: Logout as clinician
    cy.contains('Logout').click();
    
    // Step 12: Login as admin again
    cy.fixture('users').then((users) => {
      cy.login(users.admin.email, users.admin.password);
    });
    
    // Step 13: Check sent messages for read receipt
    cy.visit('/messaging/sent');
    cy.contains(messageData.subject).click();
    
    // Verify read receipt is visible to sender
    cy.contains('Read by Dr. John Doe').should('be.visible');
  });
});
