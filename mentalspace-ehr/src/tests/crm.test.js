const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Task = require('../models/Task');
const EmailCampaign = require('../models/EmailCampaign');
const Client = require('../models/Client');

// Test user credentials
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testClinician = {
  email: 'clinician@test.com',
  password: 'password123'
};

let adminToken;
let clinicianToken;
let leadId;
let contactId;
let campaignId;
let taskId;
let emailCampaignId;
let clientId;

// Before tests, create test users and get tokens
beforeAll(async () => {
  // Login as admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: testAdmin.email,
      password: testAdmin.password
    });
  adminToken = adminRes.body.token;

  // Login as clinician
  const clinicianRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: testClinician.email,
      password: testClinician.password
    });
  clinicianToken = clinicianRes.body.token;

  // Get client ID for testing
  const clientsRes = await request(app)
    .get('/api/v1/clients')
    .set('Authorization', `Bearer ${adminToken}`);
  
  if (clientsRes.body.data && clientsRes.body.data.length > 0) {
    clientId = clientsRes.body.data[0]._id;
  }
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('CRM Module API', () => {
  describe('Lead API', () => {
    it('Should create a new lead', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          phone: '555-123-4567',
          source: 'Website',
          status: 'New',
          stage: 'Inquiry',
          interestedServices: ['Individual Therapy'],
          preferredContactMethod: 'Email'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('firstName', 'John');
      expect(res.body.data).toHaveProperty('lastName', 'Doe');
      leadId = res.body.data._id;
    });

    it('Should get all leads', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single lead', async () => {
      const res = await request(app)
        .get(`/api/v1/leads/${leadId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', leadId);
      expect(res.body.data).toHaveProperty('firstName', 'John');
    });

    it('Should update a lead', async () => {
      const res = await request(app)
        .put(`/api/v1/leads/${leadId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          status: 'Contacted',
          stage: 'Initial Contact',
          notes: 'Initial contact made via email'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Contacted');
      expect(res.body.data).toHaveProperty('stage', 'Initial Contact');
      expect(res.body.data).toHaveProperty('notes', 'Initial contact made via email');
    });

    it('Should add an interaction to a lead', async () => {
      const res = await request(app)
        .post(`/api/v1/leads/${leadId}/interactions`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          type: 'Email',
          notes: 'Sent initial welcome email',
          outcome: 'Successful'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.interactions).toBeInstanceOf(Array);
      expect(res.body.data.interactions.length).toBeGreaterThan(0);
      expect(res.body.data.interactions[0]).toHaveProperty('type', 'Email');
    });

    it('Should get lead statistics', async () => {
      const res = await request(app)
        .get('/api/v1/leads/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('totalLeads');
      expect(res.body.data).toHaveProperty('statusCounts');
      expect(res.body.data).toHaveProperty('sourceCounts');
    });

    it('Should convert a lead to client', async () => {
      const res = await request(app)
        .post(`/api/v1/leads/${leadId}/convert`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          dateOfBirth: '1985-05-15',
          gender: 'Male'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('lead');
      expect(res.body.data).toHaveProperty('client');
      expect(res.body.data.lead).toHaveProperty('convertedToClient', true);
      expect(res.body.data.lead).toHaveProperty('status', 'Converted');
      expect(res.body.data.client).toHaveProperty('firstName', 'John');
      expect(res.body.data.client).toHaveProperty('lastName', 'Doe');
    });
  });

  describe('Contact API', () => {
    it('Should create a new contact', async () => {
      const res = await request(app)
        .post('/api/v1/contacts')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'janesmith@example.com',
          phone: '555-987-6543',
          organization: 'Community Health Center',
          title: 'Clinical Director',
          type: 'Referral Source',
          category: 'Healthcare',
          referralRelationship: {
            isReferrer: true,
            specialties: ['Psychiatry', 'Medication Management']
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('firstName', 'Jane');
      expect(res.body.data).toHaveProperty('organization', 'Community Health Center');
      contactId = res.body.data._id;
    });

    it('Should get all contacts', async () => {
      const res = await request(app)
        .get('/api/v1/contacts')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single contact', async () => {
      const res = await request(app)
        .get(`/api/v1/contacts/${contactId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', contactId);
      expect(res.body.data).toHaveProperty('firstName', 'Jane');
    });

    it('Should update a contact', async () => {
      const res = await request(app)
        .put(`/api/v1/contacts/${contactId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          website: 'https://communityhealthcenter.org',
          notes: 'Great referral source for psychiatric services'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('website', 'https://communityhealthcenter.org');
      expect(res.body.data).toHaveProperty('notes', 'Great referral source for psychiatric services');
    });

    it('Should add an interaction to a contact', async () => {
      const res = await request(app)
        .post(`/api/v1/contacts/${contactId}/interactions`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          type: 'Meeting',
          notes: 'Met to discuss referral process',
          outcome: 'Established formal referral partnership'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.interactions).toBeInstanceOf(Array);
      expect(res.body.data.interactions.length).toBeGreaterThan(0);
      expect(res.body.data.interactions[0]).toHaveProperty('type', 'Meeting');
    });

    it('Should get contact statistics', async () => {
      const res = await request(app)
        .get('/api/v1/contacts/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('typeCounts');
      expect(res.body.data).toHaveProperty('categoryCounts');
    });
  });

  describe('Campaign API', () => {
    it('Should create a new campaign', async () => {
      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Spring Wellness Newsletter',
          description: 'Quarterly newsletter focusing on mental wellness tips',
          type: 'Email',
          status: 'Draft',
          targetAudience: 'Clients',
          goals: 'Increase engagement and provide valuable mental health resources',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Spring Wellness Newsletter');
      campaignId = res.body.data._id;
    });

    it('Should get all campaigns', async () => {
      const res = await request(app)
        .get('/api/v1/campaigns')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single campaign', async () => {
      const res = await request(app)
        .get(`/api/v1/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', campaignId);
      expect(res.body.data).toHaveProperty('name', 'Spring Wellness Newsletter');
    });

    it('Should update a campaign', async () => {
      const res = await request(app)
        .put(`/api/v1/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: {
            subject: 'Spring Wellness Tips from MentalSpace',
            body: 'Here are some wellness tips for the spring season...'
          },
          schedule: {
            frequency: 'One-time',
            sendTime: '09:00',
            timezone: 'America/New_York'
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.content).toHaveProperty('subject', 'Spring Wellness Tips from MentalSpace');
      expect(res.body.data.schedule).toHaveProperty('frequency', 'One-time');
    });

    it('Should add recipients to a campaign', async () => {
      // Skip if no client ID is available
      if (!clientId) {
        console.log('Skipping add recipients test - no client ID available');
        return;
      }

      const res = await request(app)
        .put(`/api/v1/campaigns/${campaignId}/recipients`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clients: [clientId]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.recipients).toHaveProperty('clients');
      expect(res.body.data.recipients.clients).toContain(clientId);
    });

    it('Should get campaign statistics', async () => {
      const res = await request(app)
        .get('/api/v1/campaigns/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('typeCounts');
      expect(res.body.data).toHaveProperty('statusCounts');
    });
  });

  describe('Task API', () => {
    it('Should create a new task', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          title: 'Follow up with referral source',
          description: 'Send thank you email and updated service list',
          type: 'Follow-up',
          priority: 'Medium',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          assignedTo: clinicianToken.id, // Assign to self
          relatedTo: {
            model: 'Contact',
            id: contactId
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', 'Follow up with referral source');
      taskId = res.body.data._id;
    });

    it('Should get all tasks', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single task', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', taskId);
      expect(res.body.data).toHaveProperty('title', 'Follow up with referral source');
    });

    it('Should update a task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          status: 'In Progress',
          notes: 'Started drafting the email'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'In Progress');
      expect(res.body.data).toHaveProperty('notes', 'Started drafting the email');
    });

    it('Should add a subtask to a task', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${taskId}/subtasks`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          title: 'Prepare updated service list PDF'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.subtasks).toBeInstanceOf(Array);
      expect(res.body.data.subtasks.length).toBeGreaterThan(0);
      expect(res.body.data.subtasks[0]).toHaveProperty('title', 'Prepare updated service list PDF');
    });

    it('Should mark a task as completed', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          status: 'Completed'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Completed');
      expect(res.body.data).toHaveProperty('completedDate');
    });

    it('Should get task statistics', async () => {
      const res = await request(app)
        .get('/api/v1/tasks/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('statusCounts');
      expect(res.body.data).toHaveProperty('priorityCounts');
    });
  });

  describe('Email Campaign API', () => {
    it('Should create a new email campaign', async () => {
      const res = await request(app)
        .post('/api/v1/email-campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Spring Newsletter Email',
          description: 'Email delivery of the spring wellness newsletter',
          campaign: campaignId,
          subject: 'Your Spring Wellness Newsletter from MentalSpace',
          fromName: 'MentalSpace Wellness Team',
          fromEmail: 'wellness@mentalspace.com',
          replyToEmail: 'support@mentalspace.com',
          content: {
            htmlBody: '<h1>Spring Wellness Newsletter</h1><p>Welcome to our spring edition...</p>',
            textBody: 'Spring Wellness Newsletter\n\nWelcome to our spring edition...'
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Spring Newsletter Email');
      emailCampaignId = res.body.data._id;
    });

    it('Should get all email campaigns', async () => {
      const res = await request(app)
        .get('/api/v1/email-campaigns')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single email campaign', async () => {
      const res = await request(app)
        .get(`/api/v1/email-campaigns/${emailCampaignId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', emailCampaignId);
      expect(res.body.data).toHaveProperty('name', 'Spring Newsletter Email');
    });

    it('Should update an email campaign', async () => {
      const res = await request(app)
        .put(`/api/v1/email-campaigns/${emailCampaignId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tracking: {
            enableOpenTracking: true,
            enableClickTracking: true,
            utmSource: 'spring_newsletter',
            utmMedium: 'email',
            utmCampaign: 'wellness_2023'
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.tracking).toHaveProperty('utmSource', 'spring_newsletter');
      expect(res.body.data.tracking).toHaveProperty('utmCampaign', 'wellness_2023');
    });

    it('Should schedule an email campaign', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      
      const res = await request(app)
        .put(`/api/v1/email-campaigns/${emailCampaignId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sendDate: futureDate.toISOString(),
          sendTime: '10:00',
          timezone: 'America/New_York'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Scheduled');
      expect(res.body.data.schedule).toHaveProperty('isScheduled', true);
    });

    it('Should cancel a scheduled email campaign', async () => {
      const res = await request(app)
        .put(`/api/v1/email-campaigns/${emailCampaignId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Cancelled');
      expect(res.body.data.schedule).toHaveProperty('isScheduled', false);
    });

    it('Should get email campaign statistics', async () => {
      const res = await request(app)
        .get('/api/v1/email-campaigns/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('statusCounts');
    });
  });

  // Cleanup tests - run these last
  describe('Cleanup', () => {
    it('Should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    it('Should delete an email campaign', async () => {
      const res = await request(app)
        .delete(`/api/v1/email-campaigns/${emailCampaignId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    it('Should delete a campaign', async () => {
      const res = await request(app)
        .delete(`/api/v1/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    it('Should delete a contact', async () => {
      const res = await request(app)
        .delete(`/api/v1/contacts/${contactId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });
  });
});
