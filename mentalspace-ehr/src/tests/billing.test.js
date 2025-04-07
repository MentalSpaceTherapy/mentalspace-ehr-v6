const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const InsuranceCarrier = require('../models/InsuranceCarrier');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Authorization = require('../models/Authorization');

// Test user credentials
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testBilling = {
  email: 'billing@test.com',
  password: 'password123'
};

let adminToken;
let billingToken;
let clientId;
let providerId;
let insuranceCarrierId;
let insurancePolicyId;
let claimId;
let paymentId;
let invoiceId;
let authorizationId;

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

  // Login as billing staff
  const billingRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: testBilling.email,
      password: testBilling.password
    });
  billingToken = billingRes.body.token;

  // Get client ID
  const clientsRes = await request(app)
    .get('/api/v1/clients')
    .set('Authorization', `Bearer ${adminToken}`);
  clientId = clientsRes.body.data[0]._id;

  // Get provider ID
  const staffRes = await request(app)
    .get('/api/v1/staff')
    .set('Authorization', `Bearer ${adminToken}`);
  providerId = staffRes.body.data.find(staff => staff.role === 'CLINICIAN')._id;

  // Get insurance policy ID
  const policiesRes = await request(app)
    .get(`/api/v1/clients/${clientId}/insurance-policies`)
    .set('Authorization', `Bearer ${adminToken}`);
  if (policiesRes.body.data && policiesRes.body.data.length > 0) {
    insurancePolicyId = policiesRes.body.data[0]._id;
  }
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Billing Module API', () => {
  describe('Insurance Carrier API', () => {
    it('Should create a new insurance carrier', async () => {
      const res = await request(app)
        .post('/api/v1/insurance-carriers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Insurance Company',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345'
          },
          phone: '555-123-4567',
          fax: '555-123-4568',
          website: 'https://testinsurance.com',
          email: 'claims@testinsurance.com',
          electronicPayer: true,
          payerId: 'TEST123',
          claimSubmissionMethod: 'Electronic',
          eligibilityVerificationMethod: 'Electronic'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      insuranceCarrierId = res.body.data._id;
    });

    it('Should get all insurance carriers', async () => {
      const res = await request(app)
        .get('/api/v1/insurance-carriers')
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should update an insurance carrier', async () => {
      const res = await request(app)
        .put(`/api/v1/insurance-carriers/${insuranceCarrierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          phone: '555-987-6543',
          averagePaymentTime: 21
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('phone', '555-987-6543');
      expect(res.body.data).toHaveProperty('averagePaymentTime', 21);
    });
  });

  describe('Claim API', () => {
    it('Should create a new claim', async () => {
      const serviceDate = new Date();
      
      const res = await request(app)
        .post('/api/v1/claims')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          client: clientId,
          provider: providerId,
          insurancePolicy: insurancePolicyId,
          insuranceCarrier: insuranceCarrierId,
          serviceDate,
          billingCodes: [
            {
              code: '90834',
              description: 'Psychotherapy, 45 minutes',
              units: 1,
              fee: 125.00
            }
          ],
          diagnosisCodes: [
            {
              code: 'F41.1',
              description: 'Generalized Anxiety Disorder',
              codeType: 'ICD-10'
            }
          ],
          placeOfService: '11',
          totalCharged: 125.00
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      claimId = res.body.data._id;
    });

    it('Should get all claims', async () => {
      const res = await request(app)
        .get('/api/v1/claims')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get claims for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/claims`)
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should submit a claim', async () => {
      const res = await request(app)
        .put(`/api/v1/claims/${claimId}/submit`)
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          submissionMethod: 'Electronic',
          trackingNumber: 'TRACK123456'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Submitted');
      expect(res.body.data).toHaveProperty('dateSubmitted');
    });
  });

  describe('Payment API', () => {
    it('Should create a new payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          client: clientId,
          claim: claimId,
          paymentType: 'Insurance',
          paymentMethod: 'Electronic',
          amount: 100.00,
          date: new Date(),
          insuranceEOB: {
            eobDate: new Date(),
            eobNumber: 'EOB123456',
            insuranceCarrier: insuranceCarrierId,
            allowedAmount: 100.00,
            adjustmentAmount: 25.00,
            patientResponsibility: 0.00
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      paymentId = res.body.data._id;
    });

    it('Should get all payments', async () => {
      const res = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get payments for a specific claim', async () => {
      const res = await request(app)
        .get(`/api/v1/claims/${claimId}/payments`)
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Invoice API', () => {
    it('Should create a new invoice', async () => {
      const dateIssued = new Date();
      const dateDue = new Date();
      dateDue.setDate(dateDue.getDate() + 30);
      
      const res = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          client: clientId,
          dateIssued,
          dateDue,
          items: [
            {
              description: 'Copay for therapy session',
              serviceDate: new Date(),
              billingCode: '90834',
              units: 1,
              rate: 25.00,
              amount: 25.00,
              patientResponsibility: 25.00
            }
          ],
          subtotal: 25.00,
          totalAmount: 25.00,
          balance: 25.00,
          paymentTerms: 'Due on receipt'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('invoiceNumber');
      invoiceId = res.body.data._id;
    });

    it('Should get all invoices', async () => {
      const res = await request(app)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should send an invoice', async () => {
      const res = await request(app)
        .put(`/api/v1/invoices/${invoiceId}/send`)
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          sentVia: 'Email'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Sent');
      expect(res.body.data).toHaveProperty('sentDate');
    });
  });

  describe('Authorization API', () => {
    it('Should create a new authorization', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      const res = await request(app)
        .post('/api/v1/authorizations')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          client: clientId,
          insurancePolicy: insurancePolicyId,
          insuranceCarrier: insuranceCarrierId,
          authorizationNumber: 'AUTH123456',
          serviceType: 'Individual Therapy',
          billingCodes: ['90834'],
          startDate,
          endDate,
          totalSessions: 12,
          frequency: 'Weekly',
          status: 'Active',
          approvedProvider: providerId
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      authorizationId = res.body.data._id;
    });

    it('Should get all authorizations', async () => {
      const res = await request(app)
        .get('/api/v1/authorizations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get authorizations for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/authorizations`)
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should use a session from an authorization', async () => {
      const res = await request(app)
        .put(`/api/v1/authorizations/${authorizationId}/use-session`)
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          sessions: 1
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('sessionsUsed', 1);
      expect(res.body.data).toHaveProperty('sessionsRemaining', 11);
    });
  });
});
