const express = require('express');
const router = express.Router();

// Import all route files
const auth = require('./auth');
const staff = require('./staff');
const clients = require('./clients');
const timesheets = require('./timesheets');
const payroll = require('./payroll');
const insurancePolicies = require('./insurancePolicies');
const clientFlags = require('./clientFlags');
const clientNotes = require('./clientNotes');
const waitlist = require('./waitlist');
const appointments = require('./appointments');
const providerAvailabilities = require('./providerAvailabilities');
const recurringAppointments = require('./recurringAppointments');
const notes = require('./notes');
const noteTemplates = require('./noteTemplates');
const documentationSettings = require('./documentationSettings');
const diagnoses = require('./diagnoses');
const riskAssessments = require('./riskAssessments');
const insuranceCarriers = require('./insuranceCarriers');
const claims = require('./claims');
const payments = require('./payments');
const invoices = require('./invoices');
const authorizations = require('./authorizations');
const messages = require('./messages');
const messageThreads = require('./messageThreads');
const messageTemplates = require('./messageTemplates');
const messageNotifications = require('./messageNotifications');
const leads = require('./leads');
const contacts = require('./contacts');
const campaigns = require('./campaigns');
const tasks = require('./tasks');
const emailCampaigns = require('./emailCampaigns');
const settings = require('./settings');
const locations = require('./locations');
const integrations = require('./integrations');
const backup = require('./backup');
const dashboards = require('./dashboards');
const dashboardWidgets = require('./dashboardWidgets');
const dashboardPreferences = require('./dashboardPreferences');
const dashboardMetrics = require('./dashboardMetrics');

// Export all routes
module.exports = {
  auth,
  staff,
  clients,
  timesheets,
  payroll,
  insurancePolicies,
  clientFlags,
  clientNotes,
  waitlist,
  appointments,
  providerAvailabilities,
  recurringAppointments,
  notes,
  noteTemplates,
  documentationSettings,
  diagnoses,
  riskAssessments,
  insuranceCarriers,
  claims,
  payments,
  invoices,
  authorizations,
  messages,
  messageThreads,
  messageTemplates,
  messageNotifications,
  leads,
  contacts,
  campaigns,
  tasks,
  emailCampaigns,
  settings,
  locations,
  integrations,
  backup,
  dashboards,
  dashboardWidgets,
  dashboardPreferences,
  dashboardMetrics
};
