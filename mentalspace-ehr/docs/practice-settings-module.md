# Practice Settings Module

This document provides an overview of the Practice Settings Module for the MentalSpace EHR system.

## Overview

The Practice Settings Module enables mental health practices to configure and customize the EHR system to meet their specific needs, manage multiple locations, integrate with third-party services, and perform system maintenance tasks.

## Core Features

### System Settings Management
- Centralized configuration management
- Categorized settings for easy navigation
- Role-based access control for settings
- Audit logging for all setting changes
- Bulk update capabilities for efficient configuration

### Location Management
- Multi-location practice support
- Location details and contact information
- Operating hours configuration
- Primary location designation
- Facility details and resources

### Integration Management
- Third-party service integrations
- API credential management
- Integration status monitoring
- Connection testing
- Data synchronization configuration
- Webhook management

### System Maintenance
- Database backup and restore
- System logs management
- System health monitoring
- Performance optimization
- Error tracking and reporting

## Data Models

### Setting
- Key-value configuration storage
- Categorization for organization
- Data type validation
- Encryption for sensitive values
- System vs. user-defined settings
- Validation rules for data integrity
- Audit trail for changes

### Location
- Practice location details
- Address and contact information
- Operating hours configuration
- Timezone settings
- Facility resources and capabilities
- Primary location designation

### Integration
- Third-party service connections
- API credentials and configuration
- Connection status tracking
- Synchronization settings
- Error handling and reporting
- Webhook configuration

### SettingAuditLog
- Comprehensive audit trail for settings
- Change tracking (previous and new values)
- User attribution for all changes
- Timestamp and IP tracking
- Sensitive data masking

## API Endpoints

### Settings Endpoints
- `GET /api/v1/settings` - Get all settings
- `GET /api/v1/settings/:id` - Get a single setting
- `GET /api/v1/settings/key/:key` - Get setting by key
- `GET /api/v1/settings/category/:category` - Get settings by category
- `POST /api/v1/settings` - Create a new setting
- `PUT /api/v1/settings/:id` - Update a setting
- `DELETE /api/v1/settings/:id` - Delete a setting
- `GET /api/v1/settings/:id/audit-logs` - Get setting audit logs
- `PUT /api/v1/settings/bulk` - Bulk update settings

### Locations Endpoints
- `GET /api/v1/locations` - Get all locations
- `GET /api/v1/locations/:id` - Get a single location
- `GET /api/v1/locations/primary` - Get primary location
- `POST /api/v1/locations` - Create a new location
- `PUT /api/v1/locations/:id` - Update a location
- `DELETE /api/v1/locations/:id` - Delete a location
- `PUT /api/v1/locations/:id/set-primary` - Set location as primary
- `PUT /api/v1/locations/:id/operating-hours` - Update location operating hours

### Integrations Endpoints
- `GET /api/v1/integrations` - Get all integrations
- `GET /api/v1/integrations/:id` - Get a single integration
- `GET /api/v1/integrations/type/:type` - Get integrations by type
- `POST /api/v1/integrations` - Create a new integration
- `PUT /api/v1/integrations/:id` - Update an integration
- `DELETE /api/v1/integrations/:id` - Delete an integration
- `PUT /api/v1/integrations/:id/activate` - Activate an integration
- `PUT /api/v1/integrations/:id/deactivate` - Deactivate an integration
- `POST /api/v1/integrations/:id/test` - Test integration connection
- `POST /api/v1/integrations/:id/sync` - Sync integration data

### Backup and Maintenance Endpoints
- `GET /api/v1/backup/database` - Get all database backups
- `POST /api/v1/backup/database` - Create a database backup
- `GET /api/v1/backup/database/:fileName` - Download a database backup
- `DELETE /api/v1/backup/database/:fileName` - Delete a database backup
- `POST /api/v1/backup/database/:fileName/restore` - Restore database from backup
- `POST /api/v1/backup/logs` - Create a logs backup
- `GET /api/v1/backup/health` - Get system health status

## Integration Points

The Practice Settings Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For user attribution in audit logs
- **Client Management Module** - For practice-wide client settings
- **Scheduling Module** - For location-based scheduling configuration
- **Documentation Module** - For documentation templates and settings
- **Billing Module** - For payment and insurance settings
- **Messaging Module** - For communication settings
- **CRM Module** - For marketing and outreach settings

## Business Rules

- Only administrators can modify system settings
- System settings cannot be deleted
- Primary location cannot be deleted
- There must always be at least one location
- Only one location can be designated as primary
- Active integrations cannot be deleted
- Sensitive credentials must be encrypted
- All setting changes must be logged in the audit trail
- Backup operations require administrator privileges
- Database restore operations require confirmation

## Security Considerations

- Role-based access control for all settings
- Encryption for sensitive configuration values
- Comprehensive audit logging for all changes
- IP and user agent tracking for security monitoring
- Sensitive data masking in audit logs
- Secure credential storage for third-party integrations
- Backup file encryption and secure storage
- System health monitoring for security anomalies
