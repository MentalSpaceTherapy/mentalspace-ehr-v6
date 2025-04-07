# Database Schema

## Overview

MentalSpace EHR uses PostgreSQL as its primary database. The schema is organized into several logical groups representing different aspects of the application.

## Entity Relationship Diagram

```
+---------------+     +---------------+     +----------------+
|     User      |     |     Staff     |     |     Client     |
+---------------+     +---------------+     +----------------+
| id            |<---+| id            |     | id             |
| email         |     | userId        |     | firstName      |
| password      |     | firstName     |     | lastName       |
| role          |     | lastName      |     | email          |
| createdAt     |     | title         |     | phone          |
| updatedAt     |     | specialties   |     | dateOfBirth    |
+---------------+     | schedule      |     | address        |
                      | createdAt     |     | status         |
                      | updatedAt     |     | createdAt      |
                      +---------------+     | updatedAt      |
                             |              +----------------+
                             |                      |
                             v                      v
                      +---------------+     +----------------+
                      | Appointment   |<----| ClientProfile  |
                      +---------------+     +----------------+
                      | id            |     | id             |
                      | staffId       |     | clientId       |
                      | clientId      |     | insuranceInfo  |
                      | startTime     |     | emergencyContact|
                      | endTime       |     | medicalHistory |
                      | status        |     | createdAt      |
                      | type          |     | updatedAt      |
                      | notes         |     +----------------+
                      | createdAt     |            |
                      | updatedAt     |            |
                      +---------------+            v
                             |              +----------------+
                             |              | Document       |
                             |              +----------------+
                             |              | id             |
                             +------------->| clientId       |
                                            | staffId        |
                                            | type           |
                                            | title          |
                                            | content        |
                                            | createdAt      |
                                            | updatedAt      |
                                            +----------------+
```

## Tables

### Users

The `users` table stores authentication and authorization information.

| Column      | Type         | Description                            |
|-------------|--------------|----------------------------------------|
| id          | UUID         | Primary key                            |
| email       | VARCHAR(255) | User email (unique)                    |
| password    | VARCHAR(255) | Hashed password                        |
| role        | VARCHAR(50)  | User role (admin, therapist, etc.)     |
| resetToken  | VARCHAR(255) | Password reset token                   |
| resetExpire | TIMESTAMP    | Password reset token expiration        |
| createdAt   | TIMESTAMP    | Creation timestamp                     |
| updatedAt   | TIMESTAMP    | Update timestamp                       |

### Staff

The `staff` table stores information about healthcare providers and administrative staff.

| Column       | Type         | Description                              |
|--------------|--------------|------------------------------------------|
| id           | UUID         | Primary key                              |
| userId       | UUID         | Foreign key to users table               |
| firstName    | VARCHAR(100) | First name                               |
| lastName     | VARCHAR(100) | Last name                                |
| title        | VARCHAR(100) | Professional title                       |
| licenseNumber| VARCHAR(100) | License number                           |
| specialties  | JSONB        | Array of specialties                     |
| bio          | TEXT         | Professional biography                   |
| availability | JSONB        | Availability schedule                    |
| phone        | VARCHAR(20)  | Contact phone                            |
| imageUrl     | VARCHAR(255) | Profile image URL                        |
| status       | VARCHAR(20)  | Status (active, inactive)                |
| createdAt    | TIMESTAMP    | Creation timestamp                       |
| updatedAt    | TIMESTAMP    | Update timestamp                         |

### Clients

The `clients` table stores basic client information.

| Column      | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | UUID         | Primary key                              |
| firstName   | VARCHAR(100) | First name                               |
| lastName    | VARCHAR(100) | Last name                                |
| email       | VARCHAR(255) | Email address                            |
| phone       | VARCHAR(20)  | Phone number                             |
| dateOfBirth | DATE         | Date of birth                            |
| gender      | VARCHAR(50)  | Gender                                   |
| address     | JSONB        | Address information                      |
| status      | VARCHAR(20)  | Status (active, inactive)                |
| createdBy   | UUID         | Staff who created the record             |
| updatedBy   | UUID         | Staff who last updated the record        |
| createdAt   | TIMESTAMP    | Creation timestamp                       |
| updatedAt   | TIMESTAMP    | Update timestamp                         |

### ClientProfiles

The `client_profiles` table stores detailed client information.

| Column            | Type    | Description                              |
|-------------------|---------|------------------------------------------|
| id                | UUID    | Primary key                              |
| clientId          | UUID    | Foreign key to clients table             |
| insuranceInfo     | JSONB   | Insurance information                    |
| emergencyContact  | JSONB   | Emergency contact information            |
| medicalHistory    | JSONB   | Medical history                          |
| intakeDate        | DATE    | Intake date                              |
| intakeStaffId     | UUID    | Staff who conducted intake               |
| customFields      | JSONB   | Custom profile fields                    |
| createdAt         | TIMESTAMP | Creation timestamp                     |
| updatedAt         | TIMESTAMP | Update timestamp                       |

### Appointments

The `appointments` table stores scheduling information.

| Column      | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | UUID         | Primary key                              |
| staffId     | UUID         | Foreign key to staff table               |
| clientId    | UUID         | Foreign key to clients table             |
| startTime   | TIMESTAMP    | Appointment start time                   |
| endTime     | TIMESTAMP    | Appointment end time                     |
| status      | VARCHAR(20)  | Status (scheduled, confirmed, etc.)      |
| type        | VARCHAR(50)  | Appointment type                         |
| location    | VARCHAR(100) | Location                                 |
| notes       | TEXT         | Appointment notes                        |
| isBillable  | BOOLEAN      | Whether the appointment is billable      |
| billingCode | VARCHAR(20)  | Billing code                             |
| createdBy   | UUID         | Staff who created the appointment        |
| createdAt   | TIMESTAMP    | Creation timestamp                       |
| updatedAt   | TIMESTAMP    | Update timestamp                         |

### Documents

The `documents` table stores clinical documentation.

| Column      | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | UUID         | Primary key                              |
| clientId    | UUID         | Foreign key to clients table             |
| staffId     | UUID         | Foreign key to staff table               |
| type        | VARCHAR(50)  | Document type (assessment, note, etc.)   |
| title       | VARCHAR(255) | Document title                           |
| content     | TEXT         | Document content                         |
| status      | VARCHAR(20)  | Status (draft, final, etc.)              |
| signedAt    | TIMESTAMP    | When the document was signed             |
| signedBy    | UUID         | Staff who signed the document            |
| createdAt   | TIMESTAMP    | Creation timestamp                       |
| updatedAt   | TIMESTAMP    | Update timestamp                         |

### Billing

The `billing` table stores billing information.

| Column          | Type         | Description                              |
|-----------------|--------------|------------------------------------------|
| id              | UUID         | Primary key                              |
| clientId        | UUID         | Foreign key to clients table             |
| appointmentId   | UUID         | Foreign key to appointments table        |
| amount          | DECIMAL      | Billing amount                           |
| insuranceAmount | DECIMAL      | Amount covered by insurance              |
| clientAmount    | DECIMAL      | Amount paid by client                    |
| status          | VARCHAR(20)  | Status (pending, paid, etc.)             |
| invoiceNumber   | VARCHAR(100) | Invoice number                           |
| invoiceDate     | DATE         | Invoice date                             |
| dueDate         | DATE         | Payment due date                         |
| paidDate        | DATE         | Date when paid                           |
| createdBy       | UUID         | Staff who created the billing record     |
| createdAt       | TIMESTAMP    | Creation timestamp                       |
| updatedAt       | TIMESTAMP    | Update timestamp                         |

### Messages

The `messages` table stores secure messaging.

| Column      | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | UUID         | Primary key                              |
| senderId    | UUID         | Sender ID (user ID)                      |
| receiverId  | UUID         | Receiver ID (user ID)                    |
| subject     | VARCHAR(255) | Message subject                          |
| content     | TEXT         | Message content                          |
| isRead      | BOOLEAN      | Whether the message has been read        |
| readAt      | TIMESTAMP    | When the message was read                |
| createdAt   | TIMESTAMP    | Creation timestamp                       |
| updatedAt   | TIMESTAMP    | Update timestamp                         |

### CRM

The `crm_leads` table stores customer relationship management information.

| Column         | Type         | Description                              |
|----------------|--------------|------------------------------------------|
| id             | UUID         | Primary key                              |
| firstName      | VARCHAR(100) | First name                               |
| lastName       | VARCHAR(100) | Last name                                |
| email          | VARCHAR(255) | Email address                            |
| phone          | VARCHAR(20)  | Phone number                             |
| source         | VARCHAR(100) | Lead source                              |
| status         | VARCHAR(50)  | Status (new, contacted, etc.)            |
| assignedTo     | UUID         | Staff assigned to the lead               |
| notes          | TEXT         | Notes about the lead                     |
| convertedToClient | BOOLEAN   | Whether converted to client              |
| convertedClientId | UUID      | ID of the converted client               |
| createdAt      | TIMESTAMP    | Creation timestamp                       |
| updatedAt      | TIMESTAMP    | Update timestamp                         |

## Indexes

The following indexes are recommended for performance optimization:

- `users`: `email` (unique)
- `staff`: `userId` (unique)
- `clients`: `email` (unique)
- `appointments`: `staffId`, `clientId`, `startTime`, `endTime`
- `documents`: `clientId`, `staffId`
- `billing`: `clientId`, `appointmentId`
- `messages`: `senderId`, `receiverId`, `isRead`
- `crm_leads`: `email`, `status`, `assignedTo`

## Foreign Key Constraints

The database implements foreign key constraints for referential integrity, including:

- `staff.userId` → `users.id`
- `client_profiles.clientId` → `clients.id`
- `appointments.staffId` → `staff.id`
- `appointments.clientId` → `clients.id`
- `documents.clientId` → `clients.id`
- `documents.staffId` → `staff.id`
- `billing.clientId` → `clients.id`
- `billing.appointmentId` → `appointments.id`

## Data Migration Strategy

Database migrations are managed using TypeORM migrations. All migrations are stored in the `mentalspace-ehr-migrations` directory. 