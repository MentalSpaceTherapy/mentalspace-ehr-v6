# CRM Module

This document provides an overview of the Customer Relationship Management (CRM) Module for the MentalSpace EHR system.

## Overview

The CRM Module enables mental health practices to manage leads, contacts, campaigns, tasks, and email marketing to support practice growth and maintain relationships with referral sources and community partners.

## Core Features

### Lead Management
- Capture and track potential clients
- Lead qualification and conversion process
- Lead source tracking and analytics
- Interaction history and follow-up management
- Seamless conversion to client records

### Contact Management
- Manage referral sources and professional contacts
- Track organizations and relationships
- Contact categorization and tagging
- Interaction history and communication logs
- Referral relationship management

### Campaign Management
- Create and manage marketing campaigns
- Multi-channel campaign support
- Campaign scheduling and automation
- Target audience segmentation
- Campaign performance analytics

### Task Management
- Create and assign follow-up tasks
- Task prioritization and categorization
- Due date tracking and reminders
- Task completion workflow
- Subtask support for complex activities

### Email Marketing
- Create and send email campaigns
- Email template management
- Email scheduling and delivery
- Open and click tracking
- Unsubscribe management
- Compliance with email marketing regulations

## Data Models

### Lead
- Basic contact information
- Source and referral tracking
- Status and stage in conversion process
- Interested services and preferences
- Insurance information
- Assigned staff member
- Interaction history
- Conversion status and related client record

### Contact
- Professional contact information
- Organization and title
- Contact type and category
- Referral relationship details
- Website and social media
- Interaction history
- Tags for easy filtering

### Campaign
- Campaign details and description
- Type, status, and schedule
- Target audience and goals
- Budget tracking
- Content and messaging
- Recipient lists and segments
- Performance metrics

### Task
- Task details and description
- Type, priority, and status
- Due dates and reminders
- Related entity (lead, contact, etc.)
- Assignment and ownership
- Subtasks for complex activities
- Completion tracking

### EmailCampaign
- Email campaign details
- Parent campaign association
- Email content (HTML and text)
- Sender information
- Scheduling options
- Recipient lists
- Tracking settings
- Delivery results and metrics

## API Endpoints

### Lead Endpoints
- `GET /api/v1/leads` - Get all leads
- `GET /api/v1/leads/:id` - Get a single lead
- `POST /api/v1/leads` - Create a new lead
- `PUT /api/v1/leads/:id` - Update a lead
- `DELETE /api/v1/leads/:id` - Delete a lead
- `POST /api/v1/leads/:id/interactions` - Add an interaction to a lead
- `POST /api/v1/leads/:id/convert` - Convert a lead to a client
- `GET /api/v1/leads/stats` - Get lead statistics

### Contact Endpoints
- `GET /api/v1/contacts` - Get all contacts
- `GET /api/v1/contacts/:id` - Get a single contact
- `POST /api/v1/contacts` - Create a new contact
- `PUT /api/v1/contacts/:id` - Update a contact
- `DELETE /api/v1/contacts/:id` - Delete a contact
- `POST /api/v1/contacts/:id/interactions` - Add an interaction to a contact
- `GET /api/v1/contacts/stats` - Get contact statistics

### Campaign Endpoints
- `GET /api/v1/campaigns` - Get all campaigns
- `GET /api/v1/campaigns/:id` - Get a single campaign
- `POST /api/v1/campaigns` - Create a new campaign
- `PUT /api/v1/campaigns/:id` - Update a campaign
- `DELETE /api/v1/campaigns/:id` - Delete a campaign
- `PUT /api/v1/campaigns/:id/recipients` - Add recipients to a campaign
- `DELETE /api/v1/campaigns/:id/recipients/:type/:recipientId` - Remove a recipient from a campaign
- `GET /api/v1/campaigns/stats` - Get campaign statistics

### Task Endpoints
- `GET /api/v1/tasks` - Get all tasks
- `GET /api/v1/tasks/:id` - Get a single task
- `POST /api/v1/tasks` - Create a new task
- `PUT /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete a task
- `POST /api/v1/tasks/:id/subtasks` - Add a subtask to a task
- `PUT /api/v1/tasks/:id/subtasks/:subtaskId` - Update a subtask
- `DELETE /api/v1/tasks/:id/subtasks/:subtaskId` - Delete a subtask
- `GET /api/v1/tasks/stats` - Get task statistics

### Email Campaign Endpoints
- `GET /api/v1/email-campaigns` - Get all email campaigns
- `GET /api/v1/email-campaigns/:id` - Get a single email campaign
- `POST /api/v1/email-campaigns` - Create a new email campaign
- `PUT /api/v1/email-campaigns/:id` - Update an email campaign
- `DELETE /api/v1/email-campaigns/:id` - Delete an email campaign
- `PUT /api/v1/email-campaigns/:id/schedule` - Schedule an email campaign
- `PUT /api/v1/email-campaigns/:id/send` - Send an email campaign immediately
- `PUT /api/v1/email-campaigns/:id/cancel` - Cancel a scheduled email campaign
- `GET /api/v1/email-campaigns/stats` - Get email campaign statistics

## Integration Points

The CRM Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For staff assignment and ownership
- **Client Management Module** - For lead conversion and client relationships
- **Scheduling Module** - For appointment scheduling during lead conversion
- **Messaging Module** - For communication with leads and contacts
- **Billing Module** - For insurance verification during lead qualification
- **Practice Settings Module** - For configuration and customization

## Business Rules

- Leads can be converted to clients, maintaining a relationship between the lead and client records
- Converted leads cannot be deleted to maintain data integrity
- Active campaigns cannot be deleted
- Sent email campaigns cannot be modified or deleted
- Tasks can be related to various entities (leads, contacts, campaigns, etc.)
- Task completion automatically updates status and timestamps
- Campaign metrics are updated in real-time as email campaigns are sent and tracked

## Security Considerations

- Role-based access control for all CRM operations
- Comprehensive audit logging for all actions
- Data encryption for sensitive information
- Compliance with privacy regulations (HIPAA, GDPR)
- Secure handling of email marketing to ensure compliance with CAN-SPAM and similar regulations
- IP and device tracking for security monitoring
