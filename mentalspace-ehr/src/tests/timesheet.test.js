const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Staff = require('../models/Staff');
const Timesheet = require('../models/Timesheet');
const Payroll = require('../models/Payroll');

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
let timesheetId;
let payrollId;

// Before tests, create test users and get tokens
beforeAll(async () => {
  // Create admin user if not exists
  let admin = await Staff.findOne({ email: testAdmin.email });
  if (!admin) {
    admin = await Staff.create({
      firstName: 'Admin',
      lastName: 'User',
      email: testAdmin.email,
      password: testAdmin.password,
      role: 'PRACTICE_ADMIN',
      phone: '555-123-4567'
    });
  }

  // Create staff user if not exists
  let staff = await Staff.findOne({ email: testStaff.email });
  if (!staff) {
    staff = await Staff.create({
      firstName: 'Staff',
      lastName: 'User',
      email: testStaff.email,
      password: testStaff.password,
      role: 'CLINICIAN',
      phone: '555-987-6543'
    });
  }

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
});

// After all tests, clean up
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Timesheet API', () => {
  it('Should create a new timesheet', async () => {
    const res = await request(app)
      .post('/api/v1/timesheets')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        date: new Date(),
        clockInTime: new Date(),
        clockOutTime: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours later
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('_id');
    timesheetId = res.body.data._id;
  });

  it('Should get all timesheets', async () => {
    const res = await request(app)
      .get('/api/v1/timesheets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('Should get a single timesheet', async () => {
    const res = await request(app)
      .get(`/api/v1/timesheets/${timesheetId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('_id', timesheetId);
  });

  it('Should update a timesheet', async () => {
    const res = await request(app)
      .put(`/api/v1/timesheets/${timesheetId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        notes: 'Updated timesheet notes'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('notes', 'Updated timesheet notes');
  });

  it('Should approve a timesheet', async () => {
    const res = await request(app)
      .put(`/api/v1/timesheets/${timesheetId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('status', 'Approved');
  });
});

describe('Payroll API', () => {
  it('Should create a new payroll record', async () => {
    const res = await request(app)
      .post('/api/v1/payrolls')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        staff: mongoose.Types.ObjectId(), // Replace with actual staff ID
        payPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        payPeriodEnd: new Date(),
        grossAmount: 1000,
        deductions: [
          {
            type: 'Tax',
            description: 'Income Tax',
            amount: 200
          }
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('_id');
    payrollId = res.body.data._id;
  });

  it('Should get all payroll records', async () => {
    const res = await request(app)
      .get('/api/v1/payrolls')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('Should get a single payroll record', async () => {
    const res = await request(app)
      .get(`/api/v1/payrolls/${payrollId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('_id', payrollId);
  });

  it('Should approve a payroll record', async () => {
    const res = await request(app)
      .put(`/api/v1/payrolls/${payrollId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('status', 'Approved');
  });

  it('Should mark a payroll record as paid', async () => {
    const res = await request(app)
      .put(`/api/v1/payrolls/${payrollId}/paid`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        paymentDate: new Date(),
        paymentMethod: 'Direct Deposit',
        paymentReference: 'REF123456'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('status', 'Paid');
  });
});
