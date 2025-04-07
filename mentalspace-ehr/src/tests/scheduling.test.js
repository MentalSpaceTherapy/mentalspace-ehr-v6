const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Appointment = require('../models/Appointment');
const ProviderAvailability = require('../models/ProviderAvailability');
const RecurringAppointment = require('../models/RecurringAppointment');
const Staff = require('../models/Staff');
const Client = require('../models/Client');

// Test user credentials
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testProvider = {
  email: 'provider@test.com',
  password: 'password123'
};

let adminToken;
let providerToken;
let clientId;
let providerId;
let appointmentId;
let availabilityId;
let recurringAppointmentId;

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

  // Login as provider
  const providerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: testProvider.email,
      password: testProvider.password
    });
  providerToken = providerRes.body.token;

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

  // Get provider ID
  const providerData = await Staff.findOne({ email: testProvider.email });
  providerId = providerData._id;
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Scheduling Module API', () => {
  describe('Appointment API', () => {
    it('Should create a new appointment', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          client: clientId,
          provider: providerId,
          startTime,
          endTime,
          duration: 60,
          appointmentType: 'Individual Therapy',
          location: 'Office'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      appointmentId = res.body.data._id;
    });

    it('Should get all appointments', async () => {
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get appointments for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/appointments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update an appointment', async () => {
      const res = await request(app)
        .put(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notes: 'Updated appointment notes'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('notes', 'Updated appointment notes');
    });

    it('Should cancel an appointment', async () => {
      const res = await request(app)
        .put(`/api/v1/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cancellationReason: 'Client requested cancellation'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Cancelled');
      expect(res.body.data).toHaveProperty('cancellationReason', 'Client requested cancellation');
    });
  });

  describe('Provider Availability API', () => {
    it('Should create a new provider availability', async () => {
      const res = await request(app)
        .post(`/api/v1/staff/${providerId}/availabilities`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          location: 'Office'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      availabilityId = res.body.data._id;
    });

    it('Should get all provider availabilities', async () => {
      const res = await request(app)
        .get('/api/v1/provider-availabilities')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get availabilities for a specific provider', async () => {
      const res = await request(app)
        .get(`/api/v1/staff/${providerId}/availabilities`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update a provider availability', async () => {
      const res = await request(app)
        .put(`/api/v1/provider-availabilities/${availabilityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startTime: '10:00',
          endTime: '18:00',
          notes: 'Updated availability'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('startTime', '10:00');
      expect(res.body.data).toHaveProperty('endTime', '18:00');
    });
  });

  describe('Recurring Appointment API', () => {
    it('Should create a new recurring appointment', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Start tomorrow

      const res = await request(app)
        .post('/api/v1/recurring-appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          client: clientId,
          provider: providerId,
          appointmentType: 'Individual Therapy',
          duration: 60,
          location: 'Office',
          recurrencePattern: 'Weekly',
          dayOfWeek: 'Wednesday',
          startTime: '14:00',
          startDate,
          numberOfOccurrences: 8
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body).toHaveProperty('generatedCount');
      expect(res.body.generatedCount).toBeGreaterThan(0);
      recurringAppointmentId = res.body.data._id;
    });

    it('Should get all recurring appointments', async () => {
      const res = await request(app)
        .get('/api/v1/recurring-appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get recurring appointments for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/recurring-appointments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should add an exception to a recurring appointment', async () => {
      const exceptionDate = new Date();
      exceptionDate.setDate(exceptionDate.getDate() + 14); // Two weeks from now

      const res = await request(app)
        .post(`/api/v1/recurring-appointments/${recurringAppointmentId}/exceptions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          date: exceptionDate,
          reason: 'Provider unavailable',
          isRescheduled: false
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.exceptions).toBeInstanceOf(Array);
      expect(res.body.data.exceptions.length).toBeGreaterThan(0);
    });

    it('Should cancel a recurring appointment', async () => {
      const res = await request(app)
        .put(`/api/v1/recurring-appointments/${recurringAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Client requested cancellation of series'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Cancelled');
      expect(res.body).toHaveProperty('cancelledAppointments');
    });
  });
});
