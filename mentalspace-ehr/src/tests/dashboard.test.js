const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Staff = require('../models/Staff');
const DashboardPreference = require('../models/DashboardPreference');
const DashboardWidget = require('../models/DashboardWidget');
const DashboardMetric = require('../models/DashboardMetric');
const DashboardAlert = require('../models/DashboardAlert');

// Test user
let adminUser;
let clinicianUser;
let adminToken;
let clinicianToken;

// Test data
let testWidget;
let testMetric;
let testAlert;
let adminPreference;
let clinicianPreference;

describe('Dashboard Module', () => {
  beforeAll(async () => {
    // Create test users
    adminUser = await Staff.create({
      name: 'Admin Test',
      email: 'admin.dashboard@test.com',
      password: 'password123',
      role: 'admin'
    });

    clinicianUser = await Staff.create({
      name: 'Clinician Test',
      email: 'clinician.dashboard@test.com',
      password: 'password123',
      role: 'clinician'
    });

    // Get tokens
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin.dashboard@test.com',
        password: 'password123'
      });
    
    adminToken = adminRes.body.token;

    const clinicianRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'clinician.dashboard@test.com',
        password: 'password123'
      });
    
    clinicianToken = clinicianRes.body.token;

    // Create test widget
    testWidget = await DashboardWidget.create({
      name: 'Test Widget',
      widgetId: 'test-widget',
      description: 'Widget for testing',
      category: 'documentation',
      type: 'chart',
      chartType: 'bar',
      dataSource: 'documentation',
      allowedRoles: ['admin', 'clinician'],
      defaultSize: {
        width: 2,
        height: 1
      }
    });

    // Create test metric
    testMetric = await DashboardMetric.create({
      name: 'Test Metric',
      metricId: 'test-metric',
      description: 'Metric for testing',
      category: 'documentation',
      valueType: 'percentage',
      aggregationType: 'average',
      calculationMethod: 'percentage',
      dataSource: 'documentation',
      visibleToRoles: ['admin', 'clinician']
    });

    // Create test alert
    testAlert = await DashboardAlert.create({
      title: 'Test Alert',
      message: 'This is a test alert',
      type: 'info',
      category: 'documentation',
      source: 'test',
      targetRoles: ['admin', 'clinician'],
      priority: 'medium'
    });

    // Create test preferences
    adminPreference = await DashboardPreference.create({
      staff: adminUser._id,
      layout: 'default',
      widgets: [
        {
          widgetId: testWidget.widgetId,
          position: {
            x: 0,
            y: 0,
            width: 2,
            height: 1
          },
          visible: true,
          settings: {}
        }
      ],
      defaultFilters: {
        dateRange: 'week'
      }
    });

    clinicianPreference = await DashboardPreference.create({
      staff: clinicianUser._id,
      layout: 'default',
      widgets: [
        {
          widgetId: testWidget.widgetId,
          position: {
            x: 0,
            y: 0,
            width: 2,
            height: 1
          },
          visible: true,
          settings: {}
        }
      ],
      defaultFilters: {
        dateRange: 'week'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await DashboardPreference.deleteMany({});
    await DashboardWidget.deleteMany({});
    await DashboardMetric.deleteMany({});
    await DashboardAlert.deleteMany({});
    await Staff.deleteMany({ email: { $in: ['admin.dashboard@test.com', 'clinician.dashboard@test.com'] } });
  });

  describe('Dashboard Main Routes', () => {
    test('Should get dashboard for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('preferences');
      expect(res.body.data).toHaveProperty('availableWidgets');
      expect(res.body.data).toHaveProperty('alerts');
    });

    test('Should not allow access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards');

      expect(res.statusCode).toBe(401);
    });

    test('Should get widget data', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboards/widgets/${testWidget.widgetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('widget');
      expect(res.body.data).toHaveProperty('data');
    });
  });

  describe('Dashboard Preferences Routes', () => {
    test('Should get user preferences', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/preferences')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('widgets');
      expect(res.body.data.staff.toString()).toBe(adminUser._id.toString());
    });

    test('Should update widget position', async () => {
      const res = await request(app)
        .put(`/api/v1/dashboards/preferences/widgets/${testWidget.widgetId}/position`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          x: 1,
          y: 1,
          width: 2,
          height: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.widgets[0].position.x).toBe(1);
      expect(res.body.data.widgets[0].position.y).toBe(1);
      expect(res.body.data.widgets[0].position.width).toBe(2);
      expect(res.body.data.widgets[0].position.height).toBe(2);
    });

    test('Should toggle widget visibility', async () => {
      const res = await request(app)
        .put(`/api/v1/dashboards/preferences/widgets/${testWidget.widgetId}/visibility`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.widgets[0].visible).toBe(false);
    });
  });

  describe('Dashboard Widgets Routes (Admin Only)', () => {
    test('Should get all widgets as admin', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/widgets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    test('Should not allow clinician to access widgets management', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/widgets')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('Should create a new widget as admin', async () => {
      const newWidget = {
        name: 'New Test Widget',
        widgetId: 'new-test-widget',
        description: 'New widget for testing',
        category: 'billing',
        type: 'chart',
        chartType: 'pie',
        dataSource: 'billing',
        allowedRoles: ['admin', 'biller']
      };

      const res = await request(app)
        .post('/api/v1/dashboards/widgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newWidget);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(newWidget.name);
      expect(res.body.data.widgetId).toBe(newWidget.widgetId);

      // Clean up
      await DashboardWidget.findByIdAndDelete(res.body.data._id);
    });
  });

  describe('Dashboard Metrics Routes (Admin Only)', () => {
    test('Should get metrics by category', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/metrics/category/documentation')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    test('Should not allow clinician to access metrics management', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/metrics/category/documentation')
        .set('Authorization', `Bearer ${clinicianToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('Should toggle metric status', async () => {
      const res = await request(app)
        .put(`/api/v1/dashboards/metrics/${testMetric._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('Dashboard Alerts', () => {
    test('Should get alerts for user', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    test('Should mark alert as read', async () => {
      const res = await request(app)
        .put(`/api/v1/dashboards/alerts/${testAlert._id}/read`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.readBy).toBeInstanceOf(Array);
      expect(res.body.data.readBy.length).toBeGreaterThan(0);
      expect(res.body.data.readBy[0].staff.toString()).toBe(adminUser._id.toString());
    });
  });
});
