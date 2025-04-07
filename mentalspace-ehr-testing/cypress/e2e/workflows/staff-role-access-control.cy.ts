// cypress/e2e/workflows/staff-role-access-control.cy.ts
// End-to-end test for cross-module workflow:
// Updating staff roles affecting access in Client and Documentation modules

describe('Staff Role Access Control Workflow', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      // Login as admin to have access to all modules
      cy.login(users.admin.email, users.admin.password);
    });
  });

  it('should update staff role and verify access changes across modules', () => {
    // Step 1: Navigate to staff directory
    cy.visit('/staff');
    
    // Step 2: Find and edit a specific staff member
    cy.contains('Maria Williams').parent().parent().contains('Edit').click();
    
    // Step 3: Change role from Biller to Clinician
    cy.get('select[name="role"]').select('Clinician');
    cy.contains('button', 'Save Changes').click();
    
    // Verify role was updated
    cy.contains('Staff updated successfully').should('be.visible');
    
    // Step 4: Logout as admin
    cy.contains('Logout').click();
    
    // Step 5: Login as the updated staff member
    cy.fixture('users').then((users) => {
      cy.login('maria.williams@mentalspace.com', users.biller.password);
    });
    
    // Step 6: Verify new access to clinical documentation
    cy.visit('/dashboard');
    
    // Should now see clinician-specific dashboard widgets
    cy.contains('Upcoming Appointments').should('be.visible');
    cy.contains('Documentation Due').should('be.visible');
    
    // Should have access to documentation module
    cy.visit('/documentation');
    cy.url().should('include', '/documentation');
    cy.contains('Create Note').should('be.visible');
    
    // Should have access to client records
    cy.visit('/clients');
    cy.url().should('include', '/clients');
    cy.contains('Add Client').should('be.visible');
    
    // Step 7: Logout and login as admin again
    cy.contains('Logout').click();
    cy.fixture('users').then((users) => {
      cy.login(users.admin.email, users.admin.password);
    });
    
    // Step 8: Change the role back to Biller
    cy.visit('/staff');
    cy.contains('Maria Williams').parent().parent().contains('Edit').click();
    cy.get('select[name="role"]').select('Biller');
    cy.contains('button', 'Save Changes').click();
    
    // Verify role was updated
    cy.contains('Staff updated successfully').should('be.visible');
    
    // Step 9: Logout as admin
    cy.contains('Logout').click();
    
    // Step 10: Login as the staff member again
    cy.fixture('users').then((users) => {
      cy.login('maria.williams@mentalspace.com', users.biller.password);
    });
    
    // Step 11: Verify access has changed back to billing-specific
    cy.visit('/dashboard');
    
    // Should now see biller-specific dashboard widgets
    cy.contains('Outstanding Claims').should('be.visible');
    cy.contains('Recent Payments').should('be.visible');
    
    // Should have access to billing module
    cy.visit('/billing');
    cy.url().should('include', '/billing');
    cy.contains('New Claim').should('be.visible');
    
    // Should have limited access to documentation module
    cy.visit('/documentation');
    cy.url().should('include', '/documentation');
    // Should not see option to create notes
    cy.contains('Create Note').should('not.exist');
  });
});
