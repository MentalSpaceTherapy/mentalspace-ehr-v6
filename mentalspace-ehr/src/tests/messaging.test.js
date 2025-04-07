const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Message = require('../models/Message');
const MessageThread = require('../models/MessageThread');
const MessageTemplate = require('../models/MessageTemplate');
const MessageNotification = require('../models/MessageNotification');

// Test user credentials
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testClinician = {
  email: 'clinician@test.com',
  password: 'password123'
};

const testClient = {
  email: 'client@test.com',
  password: 'password123'
};

let adminToken;
let clinicianToken;
let clientToken;
let staffId;
let clientId;
let threadId;
let messageId;
let templateId;
let notificationId;

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

  // Get staff ID
  const staffRes = await request(app)
    .get('/api/v1/staff')
    .set('Authorization', `Bearer ${adminToken}`);
  staffId = staffRes.body.data.find(staff => staff.email === testClinician.email)._id;

  // Get client ID
  const clientsRes = await request(app)
    .get('/api/v1/clients')
    .set('Authorization', `Bearer ${adminToken}`);
  clientId = clientsRes.body.data[0]._id;
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Messaging Module API', () => {
  describe('Message Thread API', () => {
    it('Should create a new message thread', async () => {
      const res = await request(app)
        .post('/api/v1/message-threads')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          title: 'Test Thread',
          type: 'Direct',
          category: 'Clinical',
          participants: [
            {
              participant: clientId,
              participantModel: 'Client',
              role: 'Member'
            }
          ]
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', 'Test Thread');
      threadId = res.body.data._id;
    });

    it('Should get all message threads', async () => {
      const res = await request(app)
        .get('/api/v1/message-threads')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single message thread', async () => {
      const res = await request(app)
        .get(`/api/v1/message-threads/${threadId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', threadId);
      expect(res.body.data).toHaveProperty('participants');
      expect(res.body.data.participants).toBeInstanceOf(Array);
    });

    it('Should update a message thread', async () => {
      const res = await request(app)
        .put(`/api/v1/message-threads/${threadId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          title: 'Updated Thread Title',
          category: 'Administrative'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('title', 'Updated Thread Title');
      expect(res.body.data).toHaveProperty('category', 'Administrative');
    });

    it('Should add a participant to a thread', async () => {
      const res = await request(app)
        .put(`/api/v1/message-threads/${threadId}/participants`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          participant: staffId,
          participantModel: 'Staff',
          role: 'Member'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.participants.length).toBeGreaterThan(1);
    });

    it('Should archive a thread', async () => {
      const res = await request(app)
        .put(`/api/v1/message-threads/${threadId}/archive`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Archived');
    });

    it('Should reactivate an archived thread', async () => {
      const res = await request(app)
        .put(`/api/v1/message-threads/${threadId}/reactivate`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Active');
    });
  });

  describe('Message API', () => {
    it('Should create a new message', async () => {
      const res = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          thread: threadId,
          recipient: clientId,
          recipientModel: 'Client',
          subject: 'Test Message',
          content: 'This is a test message content.',
          isUrgent: false
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('content', 'This is a test message content.');
      messageId = res.body.data._id;
    });

    it('Should get messages for a thread', async () => {
      const res = await request(app)
        .get(`/api/v1/message-threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single message', async () => {
      const res = await request(app)
        .get(`/api/v1/messages/${messageId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', messageId);
      expect(res.body.data).toHaveProperty('content');
    });

    it('Should update a message (mark as urgent)', async () => {
      const res = await request(app)
        .put(`/api/v1/messages/${messageId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          isUrgent: true
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('isUrgent', true);
    });
  });

  describe('Message Template API', () => {
    it('Should create a new message template', async () => {
      const res = await request(app)
        .post('/api/v1/message-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Appointment Reminder',
          description: 'Template for appointment reminders',
          subject: 'Reminder: Your appointment on {{date}}',
          content: 'Dear {{clientName}},\n\nThis is a reminder that you have an appointment scheduled with {{providerName}} on {{date}} at {{time}}.\n\nPlease arrive 10 minutes early to complete any necessary paperwork.\n\nIf you need to reschedule, please call us at {{practicePhone}}.\n\nThank you,\n{{practiceName}} Team',
          category: 'Appointment',
          variables: [
            {
              name: 'clientName',
              description: 'Client\'s full name',
              defaultValue: '[Client Name]'
            },
            {
              name: 'providerName',
              description: 'Provider\'s full name',
              defaultValue: '[Provider Name]'
            },
            {
              name: 'date',
              description: 'Appointment date',
              defaultValue: '[Date]'
            },
            {
              name: 'time',
              description: 'Appointment time',
              defaultValue: '[Time]'
            },
            {
              name: 'practicePhone',
              description: 'Practice phone number',
              defaultValue: '[Phone Number]'
            },
            {
              name: 'practiceName',
              description: 'Practice name',
              defaultValue: 'MentalSpace'
            }
          ],
          accessRoles: ['PRACTICE_ADMIN', 'CLINICIAN', 'RECEPTIONIST']
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Appointment Reminder');
      templateId = res.body.data._id;
    });

    it('Should get all message templates', async () => {
      const res = await request(app)
        .get('/api/v1/message-templates')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get a single message template', async () => {
      const res = await request(app)
        .get(`/api/v1/message-templates/${templateId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id', templateId);
      expect(res.body.data).toHaveProperty('variables');
    });

    it('Should apply a template with variables', async () => {
      const res = await request(app)
        .post(`/api/v1/message-templates/${templateId}/apply`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          variables: {
            clientName: 'John Doe',
            providerName: 'Dr. Jane Smith',
            date: 'Monday, April 10, 2023',
            time: '2:00 PM',
            practicePhone: '555-123-4567',
            practiceName: 'MentalSpace Clinic'
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('subject');
      expect(res.body.data).toHaveProperty('content');
      expect(res.body.data.subject).toContain('Monday, April 10, 2023');
      expect(res.body.data.content).toContain('John Doe');
      expect(res.body.data.content).toContain('Dr. Jane Smith');
    });

    it('Should update a message template', async () => {
      const res = await request(app)
        .put(`/api/v1/message-templates/${templateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated template for appointment reminders',
          accessRoles: ['PRACTICE_ADMIN', 'CLINICIAN', 'RECEPTIONIST', 'SUPERVISOR']
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('description', 'Updated template for appointment reminders');
      expect(res.body.data.accessRoles).toContain('SUPERVISOR');
    });
  });

  describe('Message Notification API', () => {
    it('Should get all notifications for current user', async () => {
      const res = await request(app)
        .get('/api/v1/message-notifications')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      
      // If there are notifications, save one for testing
      if (res.body.data.length > 0) {
        notificationId = res.body.data[0]._id;
      }
    });

    it('Should get unread notification count', async () => {
      const res = await request(app)
        .get('/api/v1/message-notifications/unread-count')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.count).toBe('number');
    });

    // Only run these tests if we have a notification ID
    if (notificationId) {
      it('Should get a single notification', async () => {
        const res = await request(app)
          .get(`/api/v1/message-notifications/${notificationId}`)
          .set('Authorization', `Bearer ${clinicianToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('_id', notificationId);
      });

      it('Should mark a notification as read', async () => {
        const res = await request(app)
          .put(`/api/v1/message-notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${clinicianToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('isRead', true);
        expect(res.body.data).toHaveProperty('readAt');
      });
    }

    it('Should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/v1/message-notifications/mark-all-read')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('count');
    });

    it('Should delete read notifications', async () => {
      const res = await request(app)
        .delete('/api/v1/message-notifications/delete-read')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('count');
    });
  });

  // Cleanup tests - run these last
  describe('Cleanup', () => {
    it('Should delete a message', async () => {
      const res = await request(app)
        .delete(`/api/v1/messages/${messageId}`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });

    it('Should delete a message template', async () => {
      const res = await request(app)
        .delete(`/api/v1/message-templates/${templateId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({});
    });
  });
});
