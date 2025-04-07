# MentalSpace EHR TypeORM Migrations

This project contains TypeORM database migrations for the MentalSpace EHR system. These migrations define the database schema for all modules of the system.

## Project Structure

- `src/config/` - Database configuration
- `src/entity/` - TypeORM entity definitions
- `src/migration/` - TypeORM migration files
- `src/seed/` - Seed data scripts

## Modules Covered

The migrations cover the following modules of the MentalSpace EHR system:

1. **Authentication Module** - User authentication and access control
2. **Staff Management Module** - Provider profiles, supervision, and compensation tracking
3. **Client Management Module** - Client records, insurance, waitlist, and flags
4. **Scheduling Module** - Appointments, availability, and recurring sessions
5. **Documentation Module** - Clinical notes, templates, diagnoses, and risk assessments
6. **Messaging Module** - Secure communication, templates, and notifications
7. **CRM Module** - Lead tracking, marketing campaigns, and client acquisition
8. **Practice Settings Module** - System configuration, locations, and integrations
9. **Dashboard Module** - Customizable dashboards, widgets, metrics, and alerts

## Setup Instructions

1. Clone this repository
2. Copy `.env.example` to `.env` and update with your database credentials
3. Install dependencies: `npm install`
4. Run migrations: `npm run typeorm migration:run`

## Migration Commands

- Run migrations: `npm run typeorm migration:run`
- Revert last migration: `npm run typeorm migration:revert`
- Generate migration: `npm run typeorm migration:generate -n MigrationName`
- Create empty migration: `npm run typeorm migration:create -n MigrationName`

## Entity Relationships

The database schema includes complex relationships between entities, such as:

- Staff to Supervision Relationships
- Clients to Insurance Policies
- Appointments to Staff and Clients
- Notes to Appointments
- Messages to Staff and Clients
- Dashboard Preferences to Staff

## Database Features

- Uses PostgreSQL with UUID extension
- Implements soft deletion for most entities
- Uses JSONB for flexible data storage
- Includes proper indexing for performance
- Maintains audit trails for sensitive operations
