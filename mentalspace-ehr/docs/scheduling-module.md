# Scheduling Module

This document provides an overview of the Scheduling Module for the MentalSpace EHR system.

## Overview

The Scheduling Module provides comprehensive appointment management functionality for mental health practices, including single appointments, recurring appointments, provider availability management, and calendar views.

## Core Features

### Appointment Management
- Single appointment scheduling
- Client and provider assignment
- Multiple appointment types
- In-office and virtual appointment support
- Status tracking (Scheduled, Confirmed, Completed, Cancelled, No-Show)
- Cancellation tracking with reason and fee options
- Appointment notes

### Provider Availability
- Weekly schedule configuration
- Multiple locations support
- Time block management
- Effective date tracking for schedule changes
- Availability exceptions

### Recurring Appointments
- Multiple recurrence patterns (Weekly, Biweekly, Monthly)
- Exception handling
- Series management
- Automatic appointment generation
- Rescheduling support

### Appointment Reminders
- Email and SMS reminders
- Configurable timing
- Confirmation tracking
- Custom reminder templates

## Data Models

### Appointment
- Client and provider references
- Start and end times with duration
- Appointment type and location
- Virtual meeting details when applicable
- Status tracking
- Confirmation status
- Cancellation tracking
- Reminder settings

### ProviderAvailability
- Provider reference
- Day of week and time blocks
- Location options
- Availability status
- Effective dates
- Exception handling

### RecurringAppointment
- Client and provider references
- Recurrence pattern configuration
- Start date and end conditions
- Exception tracking
- Generated appointment references

## API Endpoints

### Appointment Endpoints
- `GET /api/v1/appointments` - Get all appointments
- `GET /api/v1/clients/:clientId/appointments` - Get appointments for a specific client
- `GET /api/v1/staff/:providerId/appointments` - Get appointments for a specific provider
- `GET /api/v1/appointments/:id` - Get a single appointment
- `POST /api/v1/appointments` - Create a new appointment
- `PUT /api/v1/appointments/:id` - Update an appointment
- `DELETE /api/v1/appointments/:id` - Delete an appointment
- `PUT /api/v1/appointments/:id/cancel` - Cancel an appointment
- `PUT /api/v1/appointments/:id/complete` - Mark an appointment as completed

### Provider Availability Endpoints
- `GET /api/v1/provider-availabilities` - Get all provider availabilities
- `GET /api/v1/staff/:providerId/availabilities` - Get availabilities for a specific provider
- `GET /api/v1/provider-availabilities/:id` - Get a single provider availability
- `POST /api/v1/staff/:providerId/availabilities` - Create a new provider availability
- `PUT /api/v1/provider-availabilities/:id` - Update a provider availability
- `DELETE /api/v1/provider-availabilities/:id` - Delete a provider availability

### Recurring Appointment Endpoints
- `GET /api/v1/recurring-appointments` - Get all recurring appointments
- `GET /api/v1/clients/:clientId/recurring-appointments` - Get recurring appointments for a specific client
- `GET /api/v1/staff/:providerId/recurring-appointments` - Get recurring appointments for a specific provider
- `GET /api/v1/recurring-appointments/:id` - Get a single recurring appointment
- `POST /api/v1/recurring-appointments` - Create a new recurring appointment
- `PUT /api/v1/recurring-appointments/:id` - Update a recurring appointment
- `PUT /api/v1/recurring-appointments/:id/cancel` - Cancel a recurring appointment
- `POST /api/v1/recurring-appointments/:id/exceptions` - Add an exception to a recurring appointment

## Integration Points

The Scheduling Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For provider information and availability
- **Client Management Module** - For client information and waitlist conversion
- **Documentation Module** - For session notes and treatment planning
- **Billing Module** - For appointment billing and insurance verification
- **Messaging Module** - For appointment reminders and notifications

## Security Considerations

- Role-based access control for all operations
- Comprehensive audit logging for HIPAA compliance
- Secure handling of virtual meeting links and credentials
- Privacy controls for sensitive appointment information
