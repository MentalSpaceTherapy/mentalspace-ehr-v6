# Messaging Module

This document provides an overview of the Messaging Module for the MentalSpace EHR system.

## Overview

The Messaging Module provides secure communication capabilities between staff members and clients within the MentalSpace EHR system. It supports direct messaging, group conversations, message templates, and notification management to facilitate efficient and HIPAA-compliant communication.

## Core Features

### Message Threads
- Direct one-to-one conversations
- Group conversations with multiple participants
- Thread categorization (Clinical, Administrative, Billing, etc.)
- Thread status management (Active, Archived, Closed)
- Participant management with role-based permissions

### Messaging
- Secure text-based communication
- Message status tracking (Sent, Delivered, Read)
- Urgent message flagging
- File attachments
- Read receipts
- Message encryption

### Message Templates
- Predefined message templates for common communications
- Variable substitution for personalization
- Template categorization
- Role-based access control for templates
- Template versioning and management

### Notifications
- Real-time notification of new messages
- Notification priority levels
- Multi-channel delivery (In-App, Email, SMS)
- Notification status tracking
- Notification management (mark as read, delete)

## Data Models

### Message
- Sender and recipient information
- Thread reference
- Message content and subject
- Urgency flags
- Encryption status
- Attachments
- Read status and timestamps
- Delivery status

### MessageThread
- Thread title and metadata
- Participant list with roles
- Thread type and category
- Client reference (if applicable)
- Thread status
- Message history
- Creation and update information

### MessageTemplate
- Template name and description
- Subject and content templates
- Variable definitions
- Category classification
- Access control settings
- Creation and update information

### MessageReadReceipt
- Message reference
- Reader information
- Timestamp
- Device information
- IP address

### MessageNotification
- Recipient information
- Message and thread references
- Notification type and content
- Read status
- Delivery methods and status
- Priority level
- Expiration settings

## API Endpoints

### Message Endpoints
- `GET /api/v1/messages` - Get all messages
- `GET /api/v1/message-threads/:threadId/messages` - Get messages for a specific thread
- `GET /api/v1/messages/:id` - Get a single message
- `POST /api/v1/messages` - Create a new message
- `PUT /api/v1/messages/:id` - Update a message (limited functionality)
- `DELETE /api/v1/messages/:id` - Delete a message
- `PUT /api/v1/messages/:id/read` - Mark a message as read

### Message Thread Endpoints
- `GET /api/v1/message-threads` - Get all message threads
- `GET /api/v1/message-threads/:id` - Get a single message thread
- `POST /api/v1/message-threads` - Create a new message thread
- `PUT /api/v1/message-threads/:id` - Update a message thread
- `PUT /api/v1/message-threads/:id/participants` - Add a participant to a thread
- `PUT /api/v1/message-threads/:id/participants/:participantId` - Remove a participant from a thread
- `PUT /api/v1/message-threads/:id/archive` - Archive a message thread
- `PUT /api/v1/message-threads/:id/reactivate` - Reactivate an archived message thread

### Message Template Endpoints
- `GET /api/v1/message-templates` - Get all message templates
- `GET /api/v1/message-templates/:id` - Get a single message template
- `POST /api/v1/message-templates` - Create a new message template
- `PUT /api/v1/message-templates/:id` - Update a message template
- `DELETE /api/v1/message-templates/:id` - Delete a message template
- `POST /api/v1/message-templates/:id/apply` - Apply a template with variables

### Message Notification Endpoints
- `GET /api/v1/message-notifications` - Get all notifications for current user
- `GET /api/v1/message-notifications/unread-count` - Get unread notification count
- `GET /api/v1/message-notifications/:id` - Get a single notification
- `PUT /api/v1/message-notifications/:id/read` - Mark a notification as read
- `PUT /api/v1/message-notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/v1/message-notifications/:id` - Delete a notification
- `DELETE /api/v1/message-notifications/delete-read` - Delete all read notifications

## Integration Points

The Messaging Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For staff information and role-based permissions
- **Client Management Module** - For client information and communication preferences
- **Scheduling Module** - For appointment-related communications
- **Documentation Module** - For sharing clinical information securely
- **Billing Module** - For billing-related communications

## Security Considerations

- End-to-end encryption for all messages
- Role-based access control for all operations
- Comprehensive audit logging for HIPAA compliance
- Secure handling of attachments
- Automatic message expiration for sensitive content
- IP and device tracking for security monitoring
- Secure notification delivery across multiple channels
