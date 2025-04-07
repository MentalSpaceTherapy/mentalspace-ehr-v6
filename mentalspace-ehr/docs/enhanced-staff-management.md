# Enhanced Staff Management Module

This document provides an overview of the Enhanced Staff Management Module for the MentalSpace EHR system.

## Overview

The Enhanced Staff Management Module extends the basic staff functionality with comprehensive features for managing mental health practice staff, including role-based access control, supervision relationships, compensation management, timesheet tracking, and payroll processing.

## Core Features

### Role-Based Access Control
- Granular permission system with predefined roles
- Custom role creation with specific permission sets
- Multiple roles per staff member support

### Supervision Relationships
- Supervisor-supervisee relationship tracking
- Co-sign workflows for clinical documentation
- Supervision hour tracking and reporting
- Supervision note documentation

### Compensation Management
- Multiple compensation models (hourly, salary, per-session, commission)
- Staff-specific compensation rules
- Effective date tracking for rate changes
- Historical compensation data

### Timesheet Tracking
- Clock in/out functionality
- Break tracking with paid/unpaid designation
- Automatic hour calculation
- Approval workflows
- Status tracking (Draft, Submitted, Approved, Rejected, Paid)

### Payroll Processing
- Pay period management
- Automatic calculations based on timesheets and compensation rules
- Deduction tracking
- Approval workflows
- Payment tracking and history

### Documentation Deadlines
- Configurable deadlines by documentation type
- Grace period settings
- Automated notifications
- Enforcement actions for missed deadlines

## Data Models

### Role
- Name and description
- Granular permissions for system modules
- Active status

### SupervisionRelationship
- Supervisor and supervisee references
- Start and end dates
- Supervision type (Clinical, Administrative, Both)
- Required frequency and hours
- Status tracking

### CompensationRule
- Staff reference
- Compensation type (Hourly, Salary, PerSession, Commission, Mixed)
- Rate information based on type
- Effective dates
- Active status

### Timesheet
- Staff reference
- Date and clock times
- Break tracking
- Hour calculations
- Status and approval tracking

### DocumentationDeadline
- Staff reference
- Documentation type
- Deadline and grace period hours
- Notification settings
- Enforcement actions

### Payroll
- Staff reference
- Pay period dates
- Timesheet references
- Hour and session totals
- Financial calculations
- Deduction tracking
- Status and payment tracking

## API Endpoints

### Timesheet Endpoints
- `GET /api/v1/timesheets` - Get all timesheets
- `GET /api/v1/staff/:staffId/timesheets` - Get timesheets for a specific staff member
- `GET /api/v1/timesheets/:id` - Get a single timesheet
- `POST /api/v1/timesheets` - Create a new timesheet
- `PUT /api/v1/timesheets/:id` - Update a timesheet
- `DELETE /api/v1/timesheets/:id` - Delete a timesheet
- `PUT /api/v1/timesheets/:id/approve` - Approve a timesheet
- `PUT /api/v1/timesheets/:id/reject` - Reject a timesheet

### Payroll Endpoints
- `GET /api/v1/payrolls` - Get all payroll records
- `GET /api/v1/staff/:staffId/payrolls` - Get payroll records for a specific staff member
- `GET /api/v1/payrolls/:id` - Get a single payroll record
- `POST /api/v1/payrolls` - Create a new payroll record
- `PUT /api/v1/payrolls/:id` - Update a payroll record
- `DELETE /api/v1/payrolls/:id` - Delete a payroll record
- `PUT /api/v1/payrolls/:id/approve` - Approve a payroll record
- `PUT /api/v1/payrolls/:id/paid` - Mark a payroll record as paid

## Integration Points

The Enhanced Staff Management Module integrates with:

- **Authentication Module** - For user authentication and basic staff information
- **Client Management Module** - For provider assignment and client relationships
- **Documentation Module** - For co-sign workflows and documentation deadlines
- **Scheduling Module** - For provider availability and session tracking
- **Billing Module** - For compensation calculations and payment processing

## Security Considerations

- Role-based access control for all operations
- Comprehensive audit logging for HIPAA compliance
- Secure handling of sensitive financial information
- Validation of all operations against user permissions
