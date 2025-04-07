const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Client = require('../models/Client');
const InsurancePolicy = require('../models/InsurancePolicy');
const ClientFlag = require('../models/ClientFlag');
const ClientNote = require('../models/ClientNote');
const Waitlist = require('../models/Waitlist');

// Test user credentials
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testStaff = {
  email: 'staff@test.com',
  password: 'password123'
};

let adminToken;
let staffToken;
let clientId;
let insurancePolicyId;
let clientFlagId;
let clientNoteId;
let waitlistId;

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

  // Login as staff
  const staffRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: testStaff.email,
      password: testStaff.password
    });
  staffToken = staffRes.body.token;

  // Create a test client
  const clientRes = await request(app)
    .post('/api/v1/clients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'Test',
      lastName: 'Client',
      email: 'testclient@example.com',
      phone: '555-123-4567',
      dateOfBirth: '1990-01-01'
    });
  clientId = clientRes.body.data._id;
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Enhanced Client Management API', () => {
  describe('Insurance Policy API', () => {
    it('Should create a new insurance policy', async () => {
      const res = await request(app)
        .post(`/api/v1/clients/${clientId}/insurance-policies`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          insuranceProvider: 'Test Insurance',
          policyNumber: '12345678',
          policyHolderName: 'Test Client',
          effectiveDate: new Date(),
          coverageType: 'Primary',
          copayAmount: 25
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      insurancePolicyId = res.body.data._id;
    });

    it('Should get all insurance policies', async () => {
      const res = await request(app)
        .get('/api/v1/insurance-policies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get insurance policies for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/insurance-policies`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update an insurance policy', async () => {
      const res = await request(app)
        .put(`/api/v1/insurance-policies/${insurancePolicyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          copayAmount: 30,
          status: 'Active'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('copayAmount', 30);
      expect(res.body.data).toHaveProperty('status', 'Active');
    });
  });

  describe('Client Flag API', () => {
    it('Should create a new client flag', async () => {
      const res = await request(app)
        .post(`/api/v1/clients/${clientId}/flags`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          flagType: 'Clinical Alert',
          severity: 'High',
          description: 'Test flag description',
          actionRequired: true,
          actionDescription: 'Follow up needed'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      clientFlagId = res.body.data._id;
    });

    it('Should get all client flags', async () => {
      const res = await request(app)
        .get('/api/v1/client-flags')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get flags for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/flags`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update a client flag', async () => {
      const res = await request(app)
        .put(`/api/v1/client-flags/${clientFlagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Resolved',
          resolutionNotes: 'Issue resolved'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Resolved');
      expect(res.body.data).toHaveProperty('resolutionNotes', 'Issue resolved');
    });
  });

  describe('Client Note API', () => {
    it('Should create a new client note', async () => {
      const res = await request(app)
        .post(`/api/v1/clients/${clientId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          noteType: 'Administrative',
          title: 'Test Note',
          content: 'This is a test note content',
          tags: ['test', 'important']
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      clientNoteId = res.body.data._id;
    });

    it('Should get all client notes', async () => {
      const res = await request(app)
        .get('/api/v1/client-notes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get notes for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update a client note', async () => {
      const res = await request(app)
        .put(`/api/v1/client-notes/${clientNoteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Updated note content',
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('content', 'Updated note content');
      expect(res.body.data).toHaveProperty('followUpRequired', true);
    });
  });

  describe('Waitlist API', () => {
    it('Should add a client to the waitlist', async () => {
      const res = await request(app)
        .post(`/api/v1/clients/${clientId}/waitlist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          serviceRequested: 'Individual Therapy',
          preferredDays: ['Monday', 'Wednesday'],
          preferredTimes: ['Afternoon', 'Evening'],
          urgency: 'Medium',
          notes: 'Test waitlist entry'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      waitlistId = res.body.data._id;
    });

    it('Should get the entire waitlist', async () => {
      const res = await request(app)
        .get('/api/v1/waitlist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get waitlist entry for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/waitlist`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('client');
    });

    it('Should add a contact attempt to a waitlist entry', async () => {
      const res = await request(app)
        .post(`/api/v1/waitlist/${waitlistId}/contact-attempts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          method: 'Phone',
          notes: 'Left voicemail',
          successful: false
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.contactAttempts).toBeInstanceOf(Array);
      expect(res.body.data.contactAttempts.length).toBeGreaterThan(0);
    });

    it('Should remove a client from the waitlist', async () => {
      const res = await request(app)
        .put(`/api/v1/waitlist/${waitlistId}/remove`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          removalReason: 'Scheduled',
          removalNotes: 'Client scheduled for next week'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Removed');
      expect(res.body.data).toHaveProperty('removalReason', 'Scheduled');
    });
  });
});
