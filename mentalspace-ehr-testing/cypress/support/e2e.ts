// cypress/support/e2e.ts
// This file is processed and loaded automatically before your test files.

import '@cypress/code-coverage/support';

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
  const log = app.console.log;
  app.console.log = (...args) => {
    if (args.length && typeof args[0] === 'string' && args[0].includes('XHR')) return;
    return log(...args);
  };
}

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<Element>;
    }
  }
}
