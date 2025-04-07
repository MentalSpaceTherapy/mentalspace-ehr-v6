# Enhanced Client Management Module

This document provides an overview of the Enhanced Client Management Module for the MentalSpace EHR system.

## Overview

The Enhanced Client Management Module extends the basic client functionality with comprehensive features for managing mental health practice clients, including detailed demographics, insurance policy tracking, client flags, administrative notes, and waitlist management.

## Core Features

### Client Profile Management
- Comprehensive demographic information
- Contact preferences and emergency contacts
- Referral source tracking
- Status management (Active, Inactive, Waitlist, Discharged, Inquiry)
- Provider assignment

### Insurance Policy Management
- Multiple policies per client with coverage type designation
- Policy verification tracking
- Detailed coverage information (copay, coinsurance, deductible)
- Authorization tracking
- Insurance card document storage
- Expiration alerts

### Client Flags
- Risk assessment with severity levels
- Follow-up tracking
- Assignment to staff members
- Resolution workflow
- Visual indicators in client chart

### Administrative Notes
- Categorized note types (Administrative, Phone Call, Email, Insurance, Billing)
- Tag-based organization
- Follow-up tracking
- Privacy controls with role-based access
- Edit history tracking

### Waitlist Management
- Service and provider preferences
- Urgency and priority levels
- Contact attempt tracking
- Scheduling workflow integration
- Waitlist reporting

## Data Models

### InsurancePolicy
- Client reference
- Provider and policy details
- Coverage information
- Verification tracking
- Authorization details
- Document storage

### ClientFlag
- Client reference
- Flag type and severity
- Action requirements
- Assignment and status tracking
- Resolution workflow

### ClientNote
- Client reference
- Note type and content
- Tag-based organization
- Follow-up tracking
- Privacy controls
- Edit history

### Waitlist
- Client reference
- Service and scheduling preferences
- Priority and urgency levels
- Contact attempt tracking
- Status management

## API Endpoints

### Insurance Policy Endpoints
- `GET /api/v1/insurance-policies` - Get all insurance policies
- `GET /api/v1/clients/:clientId/insurance-policies` - Get policies for a specific client
- `GET /api/v1/insurance-policies/:id` - Get a single insurance policy
- `POST /api/v1/clients/:clientId/insurance-policies` - Create a new insurance policy
- `PUT /api/v1/insurance-policies/:id` - Update an insurance policy
- `DELETE /api/v1/insurance-policies/:id` - Delete an insurance policy
- `POST /api/v1/insurance-policies/:id/documents` - Add document to insurance policy

### Client Flag Endpoints
- `GET /api/v1/client-flags` - Get all client flags
- `GET /api/v1/clients/:clientId/flags` - Get flags for a specific client
- `GET /api/v1/client-flags/:id` - Get a single client flag
- `POST /api/v1/clients/:clientId/flags` - Create a new client flag
- `PUT /api/v1/client-flags/:id` - Update a client flag
- `DELETE /api/v1/client-flags/:id` - Delete a client flag

### Client Note Endpoints
- `GET /api/v1/client-notes` - Get all client notes
- `GET /api/v1/clients/:clientId/notes` - Get notes for a specific client
- `GET /api/v1/client-notes/:id` - Get a single client note
- `POST /api/v1/clients/:clientId/notes` - Create a new client note
- `PUT /api/v1/client-notes/:id` - Update a client note
- `DELETE /api/v1/client-notes/:id` - Delete a client note

### Waitlist Endpoints
- `GET /api/v1/waitlist` - Get all waitlist entries
- `GET /api/v1/clients/:clientId/waitlist` - Get waitlist entry for a specific client
- `GET /api/v1/waitlist/:id` - Get a single waitlist entry
- `POST /api/v1/clients/:clientId/waitlist` - Add client to waitlist
- `PUT /api/v1/waitlist/:id` - Update a waitlist entry
- `POST /api/v1/waitlist/:id/contact-attempts` - Add contact attempt to waitlist entry
- `PUT /api/v1/waitlist/:id/remove` - Remove client from waitlist

## Integration Points

The Enhanced Client Management Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For provider assignment and supervision relationships
- **Scheduling Module** - For appointment management and waitlist conversion
- **Documentation Module** - For clinical documentation and treatment planning
- **Billing Module** - For insurance verification and claims processing

## Security Considerations

- Role-based access control for all operations
- Comprehensive audit logging for HIPAA compliance
- Privacy controls for sensitive client information
- Secure document storage and transmission
