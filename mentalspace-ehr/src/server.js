const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const staff = require('./routes/staff');
const clients = require('./routes/clients');
const timesheets = require('./routes/timesheets');
const payroll = require('./routes/payroll');
const insurancePolicies = require('./routes/insurancePolicies');
const clientFlags = require('./routes/clientFlags');
const clientNotes = require('./routes/clientNotes');
const waitlist = require('./routes/waitlist');
const appointments = require('./routes/appointments');
const providerAvailabilities = require('./routes/providerAvailabilities');
const recurringAppointments = require('./routes/recurringAppointments');
const notes = require('./routes/notes');
const noteTemplates = require('./routes/noteTemplates');
const documentationSettings = require('./routes/documentationSettings');
const diagnoses = require('./routes/diagnoses');
const riskAssessments = require('./routes/riskAssessments');
const insuranceCarriers = require('./routes/insuranceCarriers');
const claims = require('./routes/claims');
const payments = require('./routes/payments');
const invoices = require('./routes/invoices');
const authorizations = require('./routes/authorizations');
const messages = require('./routes/messages');
const messageThreads = require('./routes/messageThreads');
const messageTemplates = require('./routes/messageTemplates');
const messageNotifications = require('./routes/messageNotifications');
const leads = require('./routes/leads');
const contacts = require('./routes/contacts');
const campaigns = require('./routes/campaigns');
const tasks = require('./routes/tasks');
const emailCampaigns = require('./routes/emailCampaigns');
const settings = require('./routes/settings');
const locations = require('./routes/locations');
const integrations = require('./routes/integrations');
const backup = require('./routes/backup');
// Dashboard module routes
const dashboards = require('./routes/dashboards');
const dashboardWidgets = require('./routes/dashboardWidgets');
const dashboardPreferences = require('./routes/dashboardPreferences');
const dashboardMetrics = require('./routes/dashboardMetrics');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/staff', staff);
app.use('/api/v1/clients', clients);
app.use('/api/v1/timesheets', timesheets);
app.use('/api/v1/payroll', payroll);
app.use('/api/v1/insurance-policies', insurancePolicies);
app.use('/api/v1/client-flags', clientFlags);
app.use('/api/v1/client-notes', clientNotes);
app.use('/api/v1/waitlist', waitlist);
app.use('/api/v1/appointments', appointments);
app.use('/api/v1/provider-availabilities', providerAvailabilities);
app.use('/api/v1/recurring-appointments', recurringAppointments);
app.use('/api/v1/notes', notes);
app.use('/api/v1/note-templates', noteTemplates);
app.use('/api/v1/documentation-settings', documentationSettings);
app.use('/api/v1/diagnoses', diagnoses);
app.use('/api/v1/risk-assessments', riskAssessments);
app.use('/api/v1/insurance-carriers', insuranceCarriers);
app.use('/api/v1/claims', claims);
app.use('/api/v1/payments', payments);
app.use('/api/v1/invoices', invoices);
app.use('/api/v1/authorizations', authorizations);
app.use('/api/v1/messages', messages);
app.use('/api/v1/message-threads', messageThreads);
app.use('/api/v1/message-templates', messageTemplates);
app.use('/api/v1/message-notifications', messageNotifications);
app.use('/api/v1/leads', leads);
app.use('/api/v1/contacts', contacts);
app.use('/api/v1/campaigns', campaigns);
app.use('/api/v1/tasks', tasks);
app.use('/api/v1/email-campaigns', emailCampaigns);
app.use('/api/v1/settings', settings);
app.use('/api/v1/locations', locations);
app.use('/api/v1/integrations', integrations);
app.use('/api/v1/backup', backup);
// Mount dashboard routes
app.use('/api/v1/dashboards', dashboards);
app.use('/api/v1/dashboards/widgets', dashboardWidgets);
app.use('/api/v1/dashboards/preferences', dashboardPreferences);
app.use('/api/v1/dashboards/metrics', dashboardMetrics);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
