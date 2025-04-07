const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Note = require('../models/Note');
const NoteTemplate = require('../models/NoteTemplate');
const Diagnosis = require('../models/Diagnosis');
const RiskAssessment = require('../models/RiskAssessment');

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
let clientId;
let providerId;
let noteId;
let templateId;
let diagnosisId;
let riskAssessmentId;

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
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Documentation Module API', () => {
  describe('Note Template API', () => {
    it('Should create a new note template', async () => {
      const res = await request(app)
        .post('/api/v1/note-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Progress Note Template',
          description: 'Template for testing',
          noteType: 'Progress Note',
          structure: {
            sections: [
              {
                title: 'Presenting Issues',
                type: 'textarea',
                required: true
              },
              {
                title: 'Interventions',
                type: 'textarea',
                required: true
              },
              {
                title: 'Plan',
                type: 'textarea',
                required: true
              }
            ]
          },
          defaultContent: {
            sections: {
              'Presenting Issues': '',
              'Interventions': '',
              'Plan': ''
            }
          },
          isActive: true,
          isDefault: true,
          requiredFields: [
            {
              fieldPath: 'sections.Presenting Issues',
              fieldName: 'Presenting Issues',
              errorMessage: 'Presenting Issues is required'
            }
          ],
          accessRoles: ['PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR', 'INTERN']
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      templateId = res.body.data._id;
    });

    it('Should get all note templates', async () => {
      const res = await request(app)
        .get('/api/v1/note-templates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get templates by note type', async () => {
      const res = await request(app)
        .get('/api/v1/note-templates/type/Progress Note')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update a note template', async () => {
      const res = await request(app)
        .put(`/api/v1/note-templates/${templateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated template description'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('description', 'Updated template description');
    });
  });

  describe('Diagnosis API', () => {
    it('Should create a new diagnosis', async () => {
      const res = await request(app)
        .post('/api/v1/diagnoses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'F41.1',
          description: 'Generalized Anxiety Disorder',
          codeType: 'DSM-5',
          category: 'Anxiety Disorders',
          isActive: true,
          commonlyUsed: true
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      diagnosisId = res.body.data._id;
    });

    it('Should get all diagnoses', async () => {
      const res = await request(app)
        .get('/api/v1/diagnoses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get commonly used diagnoses', async () => {
      const res = await request(app)
        .get('/api/v1/diagnoses/common')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should search diagnoses', async () => {
      const res = await request(app)
        .get('/api/v1/diagnoses/search/anxiety')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Note API', () => {
    it('Should create a new note', async () => {
      const sessionDate = new Date();
      
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          client: clientId,
          provider: providerId,
          noteType: 'Progress Note',
          templateUsed: templateId,
          title: 'Test Progress Note',
          content: {
            sections: {
              'Presenting Issues': 'Client reports ongoing anxiety symptoms',
              'Interventions': 'CBT techniques were used to address anxiety',
              'Plan': 'Continue weekly sessions, practice mindfulness'
            }
          },
          sessionDate,
          sessionDuration: 50,
          diagnosisCodes: [diagnosisId]
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      noteId = res.body.data._id;
    });

    it('Should get all notes', async () => {
      const res = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get notes for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/notes`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should update a note', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          content: {
            sections: {
              'Presenting Issues': 'Client reports ongoing anxiety symptoms with recent improvement',
              'Interventions': 'CBT techniques were used to address anxiety, introduced mindfulness',
              'Plan': 'Continue weekly sessions, practice mindfulness daily'
            }
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.content.sections).toHaveProperty('Plan', 'Continue weekly sessions, practice mindfulness daily');
    });

    it('Should sign a note', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}/sign`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'Locked');
      expect(res.body.data).toHaveProperty('signedAt');
    });
  });

  describe('Risk Assessment API', () => {
    it('Should create a new risk assessment', async () => {
      const res = await request(app)
        .post('/api/v1/risk-assessments')
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          client: clientId,
          provider: providerId,
          note: noteId,
          suicidalIdeation: {
            present: false,
            severity: 'None'
          },
          homicidalIdeation: {
            present: false,
            severity: 'None'
          },
          selfHarm: {
            present: false,
            severity: 'None'
          },
          substanceUse: {
            present: true,
            severity: 'Low',
            substances: ['Alcohol'],
            details: 'Occasional social drinking'
          },
          psychosis: {
            present: false,
            severity: 'None'
          },
          overallRiskLevel: 'Low',
          safetyPlan: {
            created: false
          },
          interventions: 'Discussed healthy coping strategies',
          followUpPlan: 'Continue to monitor in weekly sessions'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('_id');
      riskAssessmentId = res.body.data._id;
    });

    it('Should get all risk assessments', async () => {
      const res = await request(app)
        .get('/api/v1/risk-assessments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('Should get risk assessments for a specific client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/risk-assessments`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should get the latest risk assessment for a client', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${clientId}/risk-assessments/latest`)
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('overallRiskLevel');
    });

    it('Should update a risk assessment', async () => {
      const res = await request(app)
        .put(`/api/v1/risk-assessments/${riskAssessmentId}`)
        .set('Authorization', `Bearer ${clinicianToken}`)
        .send({
          followUpPlan: 'Continue to monitor in weekly sessions and reassess in one month'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('followUpPlan', 'Continue to monitor in weekly sessions and reassess in one month');
    });
  });
});
