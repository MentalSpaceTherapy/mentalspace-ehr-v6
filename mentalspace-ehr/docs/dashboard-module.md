# Dashboard Module Documentation

## Overview

The Dashboard Module provides a personalized landing page for each user based on their role in the MentalSpace EHR system. It consolidates the most relevant data from across the system into role-specific widgets that can be customized, rearranged, and filtered to provide immediate visibility into critical information.

## Key Features

1. **Role-Based Dashboards**: Different dashboard layouts for Administrators, Clinicians, Schedulers, Billers, and Supervisors
2. **Customizable Widgets**: Users can rearrange, resize, show/hide, and configure widgets
3. **Real-Time Data**: Dashboards display up-to-date information with configurable refresh intervals
4. **Interactive Filtering**: Date range selectors, staff filters, and drill-down capabilities
5. **System Alerts**: Critical notifications and alerts displayed prominently
6. **Module-Specific Dashboards**: Specialized dashboards for each major module (Client, Documentation, Scheduling, Billing, Staff, CRM)

## Architecture

The Dashboard Module is built on a flexible architecture that allows for easy extension and customization:

### Data Models

1. **DashboardPreference**: Stores user-specific dashboard settings
   - Layout preferences
   - Widget positions and visibility
   - Default filters
   - Refresh intervals

2. **DashboardWidget**: Defines available widgets
   - Widget metadata (name, description, category)
   - Data source and visualization type
   - Default size and settings
   - Role-based access control

3. **DashboardMetric**: Stores aggregated performance data
   - Metric definitions and calculation methods
   - Thresholds and targets
   - Trend analysis settings
   - Role-based visibility

4. **DashboardAlert**: Manages system alerts and notifications
   - Alert metadata (title, message, priority)
   - Target roles and staff
   - Related entities and action links
   - Read status tracking

### Controllers

1. **dashboards.js**: Main dashboard controller
   - Retrieves personalized dashboard based on user role
   - Provides widget data based on filters
   - Manages alerts and notifications

2. **dashboardWidgets.js**: Widget management
   - CRUD operations for widgets
   - Role-based widget access
   - Widget status toggling

3. **dashboardPreferences.js**: User preference management
   - Retrieves and updates user preferences
   - Widget positioning and visibility
   - Dashboard layout customization

4. **dashboardMetrics.js**: Metrics calculation and management
   - Calculates and updates dashboard metrics
   - Retrieves metric history and trends
   - Category and role-based metric filtering

### API Endpoints

#### Main Dashboard

- `GET /api/v1/dashboards`: Get personalized dashboard for current user
- `GET /api/v1/dashboards/widgets/:widgetId`: Get data for a specific widget
- `PUT /api/v1/dashboards/preferences`: Update dashboard preferences

#### Widgets Management (Admin Only)

- `GET /api/v1/dashboards/widgets`: Get all available widgets
- `POST /api/v1/dashboards/widgets`: Create a new widget
- `GET /api/v1/dashboards/widgets/:id`: Get a specific widget
- `PUT /api/v1/dashboards/widgets/:id`: Update a widget
- `DELETE /api/v1/dashboards/widgets/:id`: Delete a widget
- `GET /api/v1/dashboards/widgets/role/:role`: Get widgets for a specific role
- `PUT /api/v1/dashboards/widgets/:id/toggle`: Toggle widget active status

#### User Preferences

- `GET /api/v1/dashboards/preferences`: Get current user's preferences
- `POST /api/v1/dashboards/preferences`: Create preferences for current user
- `PUT /api/v1/dashboards/preferences/reset`: Reset preferences to default
- `GET /api/v1/dashboards/preferences/all`: Get all users' preferences (Admin only)
- `PUT /api/v1/dashboards/preferences/widgets/:widgetId/position`: Update widget position
- `PUT /api/v1/dashboards/preferences/widgets/:widgetId/visibility`: Toggle widget visibility
- `PUT /api/v1/dashboards/preferences/widgets/:widgetId/settings`: Update widget settings

#### Metrics Management (Admin Only)

- `GET /api/v1/dashboards/metrics`: Get all metrics
- `POST /api/v1/dashboards/metrics`: Create a new metric
- `GET /api/v1/dashboards/metrics/:id`: Get a specific metric
- `PUT /api/v1/dashboards/metrics/:id`: Update a metric
- `DELETE /api/v1/dashboards/metrics/:id`: Delete a metric
- `POST /api/v1/dashboards/metrics/calculate`: Calculate and update all metrics
- `GET /api/v1/dashboards/metrics/:id/history`: Get metric history
- `GET /api/v1/dashboards/metrics/category/:category`: Get metrics by category
- `GET /api/v1/dashboards/metrics/role/:role`: Get metrics by role
- `PUT /api/v1/dashboards/metrics/:id/toggle`: Toggle metric active status

#### Alerts Management

- `GET /api/v1/dashboards/alerts`: Get alerts for current user
- `PUT /api/v1/dashboards/alerts/:id/read`: Mark alert as read
- `POST /api/v1/dashboards/alerts`: Create a new alert (Admin only)
- `PUT /api/v1/dashboards/alerts/:id`: Update an alert (Admin only)
- `DELETE /api/v1/dashboards/alerts/:id`: Delete an alert (Admin only)

## Role-Based Dashboards

### Administrator Dashboard

The Administrator dashboard provides a high-level overview of the entire practice, including:

1. **System Health**: Server uptime, database usage, potential errors
2. **Staff Performance Summary**: Documentation compliance, no-show rates, staff metrics
3. **Financial Overview**: Revenue snapshot, claims status, aging summary
4. **Critical Alerts & Notifications**: License expirations, insurance policy issues, system errors

### Clinician Dashboard

The Clinician dashboard focuses on patient care and documentation:

1. **Today's Appointments**: Upcoming sessions with quick access links
2. **Unsigned Notes**: Progress notes requiring signature with direct links
3. **Client Messages**: Unread messages from assigned clients
4. **Treatment Plan Reminders**: Upcoming plan reviews or expiring authorizations
5. **Personal Productivity Metrics**: Session counts, no-show rates, client satisfaction

### Scheduler Dashboard

The Scheduler dashboard emphasizes appointment management:

1. **Daily Appointment Overview**: All providers' schedules in a concise view
2. **Cancellation/Reschedule Requests**: Client and staff-initiated change requests
3. **New Client Inquiries / Waitlist**: Waitlist management and new client scheduling

### Biller Dashboard

The Biller dashboard focuses on financial operations:

1. **Claims Needing Attention**: Rejections, pending authorizations, partial payments
2. **Recent Payments Received**: Recent EOB postings and payments
3. **Outstanding Balances Summary & AR Aging**: Aging reports with drill-down capability
4. **Next Billing Cycle Tasks**: Upcoming statement runs and billing deadlines

### Supervisor Dashboard

The Supervisor dashboard emphasizes oversight and quality control:

1. **Supervisee Performance & Pending Notes**: Note compliance and co-sign queue
2. **Co-Sign Queue**: Notes awaiting co-signature with quick access
3. **Documentation Compliance by Supervisee**: Compliance metrics for each supervisee
4. **Supervision Session Scheduling**: Group supervision planning and reminders

## Module-Specific Dashboards

Each major module has its own specialized dashboard accessible via sub-tabs:

1. **Client Module Dashboard**: Client activity, referral sources, demographics, retention metrics
2. **Documentation Module Dashboard**: Completion rates, note types, timeliness trends
3. **Scheduling Module Dashboard**: Appointment distribution, no-show trends, scheduling efficiency
4. **Billing Module Dashboard**: Revenue by service type, claim status, days in AR, denial reasons
5. **Staff Module Dashboard**: Staff distribution, productivity comparisons, compliance ranking
6. **CRM Module Dashboard**: Lead funnel visualization, campaign performance, conversion rates

## Customization & Performance

### User Customization

- Users can reorder, hide, or show widgets based on preference
- Dashboard layout persists across sessions
- Default filters can be saved for quick access

### Performance Optimization

- Aggregated tables and caching for efficient data retrieval
- Configurable refresh intervals to balance real-time updates with system performance
- Scheduled calculations for complex metrics to reduce server load

## Integration with Other Modules

The Dashboard Module integrates with all other modules in the MentalSpace EHR system:

1. **Authentication**: Role-based access control determines dashboard content
2. **Staff Management**: Staff roles, supervision relationships, and performance metrics
3. **Client Management**: Client demographics, status, and activity metrics
4. **Scheduling**: Appointment data, no-show rates, and provider availability
5. **Documentation**: Note completion rates, unsigned notes, and co-sign requirements
6. **Billing**: Claims status, payment tracking, and aging reports
7. **Messaging**: Unread message counts and notification integration
8. **CRM**: Lead tracking, conversion rates, and marketing performance
9. **Practice Settings**: System health monitoring and configuration alerts

## Implementation Considerations

### Front-End Implementation

- React components for each widget type
- Drag-and-drop interface for widget arrangement
- Interactive charts and visualizations
- Responsive design for desktop and mobile access

### Back-End Implementation

- Efficient database queries with proper indexing
- Caching and aggregation for performance optimization
- Background jobs for metric calculation
- Real-time updates via WebSockets (optional enhancement)

## Security Considerations

- Role-based access control for all dashboard components
- Data filtering to ensure users only see authorized information
- Audit logging for dashboard customization and alert management
- Secure transmission of sensitive metrics and alerts

## Conclusion

The Dashboard Module serves as the central hub of the MentalSpace EHR system, providing users with immediate access to the most relevant information based on their role. By consolidating data from across the system into a customizable, role-specific interface, the Dashboard Module enhances user productivity and ensures critical information is always visible at a glance.
