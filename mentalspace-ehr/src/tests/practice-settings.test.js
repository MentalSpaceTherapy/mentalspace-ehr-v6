const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Setting = require('../models/Setting');
const Location = require('../models/Location');
const Integration = require('../models/Integration');
const SettingAuditLog = require('../models/SettingAuditLog');

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
let settingId;
let locationId;
let integrationId;

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
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Practice Settings Module API', () => {
  describe('Settings API', () => {
    it('Should create a new setting', async () => {
      const res = await request(app)
        .post('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'practice.name',
          value: 'MentalSpace Therapy Center',
          category: 'General',
          description: 'Name of the practice',
          dataType: 'string'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('key', 'practice.name');
      expect(res.body.data).toHaveProperty('value', 'MentalSpace Therapy Center');
      settingId = res.body.data._id;
    });

    it('Should get all settings', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single setting', async () => {
      const res = await request(app)
        .get(`/api/v1/settings/${settingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', settingId);
      expect(res.body.data).toHaveProperty('key', 'practice.name');
    });

    it('Should get settings by category', async () => {
      const res = await request(app)
        .get('/api/v1/settings/category/General')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('category', 'General');
    });

    it('Should update a setting', async () => {
      const res = await request(app)
        .put(`/api/v1/settings/${settingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'MentalSpace Wellness Center'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('value', 'MentalSpace Wellness Center');
    });

    it('Should get setting audit logs', async () => {
      const res = await request(app)
        .get(`/api/v1/settings/${settingId}/audit-logs`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should perform bulk update of settings', async () => {
      const res = await request(app)
        .put('/api/v1/settings/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          settings: [
            {
              key: 'practice.name',
              value: 'MentalSpace Therapy & Wellness'
            },
            {
              key: 'practice.phone',
              value: '555-123-4567'
            }
          ]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('success');
      expect(res.body.data.success).toBeInstanceOf(Array);
      expect(res.body.data.success.length).toBeGreaterThan(0);
    });

    it('Should not allow non-admin to create settings', async () => {
      const res = await request(app)
        .post('/api/v1/settings')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          key: 'test.setting',
          value: 'Test Value',
          category: 'General',
          description: 'Test setting',
          dataType: 'string'
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Locations API', () => {
    it('Should create a new location', async () => {
      const res = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Main Office',
          address: {
            street1: '123 Therapy Lane',
            city: 'Mentalville',
            state: 'CA',
            zipCode: '90210',
            country: 'United States'
          },
          contactInfo: {
            phone: '555-987-6543',
            email: 'office@mentalspace.com'
          },
          operatingHours: [
            {
              day: 'Monday',
              openTime: '09:00',
              closeTime: '17:00',
              isClosed: false
            },
            {
              day: 'Tuesday',
              openTime: '09:00',
              closeTime: '17:00',
              isClosed: false
            },
            {
              day: 'Wednesday',
              openTime: '09:00',
              closeTime: '17:00',
              isClosed: false
            },
            {
              day: 'Thursday',
              openTime: '09:00',
              closeTime: '17:00',
              isClosed: false
            },
            {
              day: 'Friday',
              openTime: '09:00',
              closeTime: '17:00',
              isClosed: false
            },
            {
              day: 'Saturday',
              openTime: '10:00',
              closeTime: '14:00',
              isClosed: false
            },
            {
              day: 'Sunday',
              openTime: '00:00',
              closeTime: '00:00',
              isClosed: true
            }
          ],
          timezone: 'America/Los_Angeles'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Main Office');
      expect(res.body.data).toHaveProperty('isPrimary', true); // First location should be primary
      locationId = res.body.data._id;
    });

    it('Should get all locations', async () => {
      const res = await request(app)
        .get('/api/v1/locations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single location', async () => {
      const res = await request(app)
        .get(`/api/v1/locations/${locationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', locationId);
      expect(res.body.data).toHaveProperty('name', 'Main Office');
    });

    it('Should get primary location', async () => {
      const res = await request(app)
        .get('/api/v1/locations/primary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('isPrimary', true);
    });

    it('Should update location operating hours', async () => {
      const res = await request(app)
        .put(`/api/v1/locations/${locationId}/operating-hours`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operatingHours: [
            {
              day: 'Monday',
              openTime: '08:00',
              closeTime: '18:00',
              isClosed: false
            },
            {
              day: 'Tuesday',
              openTime: '08:00',
              closeTime: '18:00',
              isClosed: false
            },
            {
              day: 'Wednesday',
              openTime: '08:00',
              closeTime: '18:00',
              isClosed: false
            },
            {
              day: 'Thursday',
              openTime: '08:00',
              closeTime: '18:00',
              isClosed: false
            },
            {
              day: 'Friday',
              openTime: '08:00',
              closeTime: '18:00',
              isClosed: false
            },
            {
              day: 'Saturday',
              openTime: '09:00',
              closeTime: '15:00',
              isClosed: false
            },
            {
              day: 'Sunday',
              openTime: '00:00',
              closeTime: '00:00',
              isClosed: true
            }
          ]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.operatingHours[0]).toHaveProperty('openTime', '08:00');
      expect(res.body.data.operatingHours[0]).toHaveProperty('closeTime', '18:00');
    });

    it('Should not allow non-admin to create locations', async () => {
      const res = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          name: 'Satellite Office',
          address: {
            street1: '456 Mental Health Ave',
            city: 'Therapytown',
            state: 'CA',
            zipCode: '90211',
            country: 'United States'
          },
          contactInfo: {
            phone: '555-123-7890'
          }
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Integrations API', () => {
    it('Should create a new integration', async () => {
      const res = await request(app)
        .post('/api/v1/integrations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Stripe Payment Processing',
          type: 'Payment',
          provider: 'Stripe',
          description: 'Integration with Stripe for payment processing',
          status: 'Inactive',
          credentials: {
            apiKey: 'sk_test_123456789',
            apiSecret: 'test_secret_key',
            baseUrl: 'https://api.stripe.com/v1'
          },
          settings: {
            enableAutomaticReceipts: true,
            currency: 'USD'
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Stripe Payment Processing');
      expect(res.body.data).toHaveProperty('type', 'Payment');
      integrationId = res.body.data._id;
    });

    it('Should get all integrations', async () => {
      const res = await request(app)
        .get('/api/v1/integrations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single integration', async () => {
      const res = await request(app)
        .get(`/api/v1/integrations/${integrationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', integrationId);
      expect(res.body.data).toHaveProperty('name', 'Stripe Payment Processing');
    });

    it('Should get integrations by type', async () => {
      const res = await request(app)
        .get('/api/v1/integrations/type/Payment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('type', 'Payment');
    });

    it('Should activate an integration', async () => {
      const res = await request(app)
        .put(`/api/v1/integrations/${integrationId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Active');
    });

    it('Should test an integration connection', async () => {
      const res = await request(app)
        .post(`/api/v1/integrations/${integrationId}/test`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('message', 'Connection test successful');
    });

    it('Should deactivate an integration', async () => {
      const res = await request(app)
        .put(`/api/v1/integrations/${integrationId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Inactive');
    });

    it('Should not allow non-admin to create integrations', async () => {
      const res = await request(app)
        .post('/api/v1/integrations')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          name: 'Test Integration',
          type: 'Email',
          provider: 'Mailchimp',
          description: 'Test integration',
          status: 'Inactive'
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Backup API', () => {
    it('Should create a database backup', async () => {
      const res = await request(app)
        .post('/api/v1/backup/database')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('fileName');
      expect(res.body.data).toHaveProperty('path');
      expect(res.body.data).toHaveProperty('timestamp');
    });

    it('Should get all database backups', async () => {
      const res = await request(app)
        .get('/api/v1/backup/database')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should create a logs backup', async () => {
      const res = await request(app)
        .post('/api/v1/backup/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('fileName');
      expect(res.body.data).toHaveProperty('path');
      expect(res.body.data).toHaveProperty('timestamp');
    });

    it('Should get system health status', async () => {
      const res = await request(app)
        .get('/api/v1/backup/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('database');
      expect(res.body.data).toHaveProperty('server');
      expect(res.body.data).toHaveProperty('services');
    });

    it('Should not allow non-admin to access backup features', async () => {
      const res = await request(app)
        .post('/api/v1/backup/database')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

  // Cleanup tests - run these last
  describe('Cleanup', () => {
    it('Should delete an integration', async () => {
      // First deactivate to ensure it can be deleted
      await request(app)
        .put(`/api/v1/integrations/${integrationId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .delete(`/api/v1/integrations/${integrationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    it('Should delete a setting', async () => {
      const res = await request(app)
        .delete(`/api/v1/settings/${settingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    // Note: We don't delete the location since it's the primary location
  });
});
