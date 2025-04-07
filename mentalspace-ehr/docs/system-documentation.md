# MentalSpace EHR System Documentation

## Overview

MentalSpace EHR is a comprehensive Electronic Health Record system designed specifically for mental health practices. The system provides a complete solution for managing clients, staff, appointments, documentation, billing, and practice operations.

This documentation covers all aspects of the MentalSpace EHR system, including:

1. System Architecture
2. Database Schema
3. Backend API
4. Frontend Application
5. Security Features
6. Deployment Guide
7. Monitoring and Logging
8. User Guides

## Table of Contents

- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Backend API](#backend-api)
- [Frontend Application](#frontend-application)
- [Security Features](#security-features)
- [Deployment Guide](#deployment-guide)
- [Monitoring and Logging](#monitoring-and-logging)
- [User Guides](#user-guides)

## System Architecture

MentalSpace EHR follows a modern microservices architecture with the following components:

- **Database Layer**: PostgreSQL database with TypeORM migrations
- **Backend API**: Node.js Express API with TypeScript
- **Frontend Application**: React with TypeScript and Tailwind CSS
- **Authentication**: JWT-based authentication with role-based access control
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **Deployment**: Docker containers orchestrated with Docker Compose

The system is designed to be scalable, secure, and compliant with healthcare regulations including HIPAA.

### Component Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Authentication │     │  Monitoring     │     │  Migrations     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Database Schema

The database schema is implemented using TypeORM entities and migrations. The schema includes the following main entities:

### Core Entities

- **User**: Base user entity with authentication information
- **Staff**: Staff members including clinicians, administrators, and support staff
- **Client**: Client/patient information
- **Role**: User roles and permissions

### Module-Specific Entities

- **Scheduling**: Appointments, Provider Availability, Recurring Appointments
- **Documentation**: Notes, Note Templates, Diagnoses, Risk Assessments
- **Billing**: Claims, Payments, Invoices, Insurance Carriers, Authorizations
- **Messaging**: Messages, Message Threads, Message Templates, Notifications
- **CRM**: Leads, Contacts, Campaigns, Tasks
- **Practice Settings**: Settings, Locations, Integrations
- **Dashboard**: Dashboard Preferences, Widgets, Metrics, Alerts

### Entity Relationships

The database schema includes complex relationships between entities, such as:

- Staff to Clients (provider relationship)
- Staff to Staff (supervision relationship)
- Clients to Insurance Policies
- Appointments to Notes
- Notes to Diagnoses

## Backend API

The backend API is built with Express.js and TypeScript, providing RESTful endpoints for all system functionality.

### API Structure

The API follows a modular structure with controllers, routes, models, and middleware:

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── server.js
```

### Authentication

The API uses JWT (JSON Web Tokens) for authentication with the following features:

- Secure token generation and validation
- Role-based access control
- Token refresh mechanism
- Password reset functionality

### API Endpoints

The API provides endpoints for all system modules:

- `/api/auth`: Authentication endpoints
- `/api/staff`: Staff management
- `/api/clients`: Client management
- `/api/appointments`: Scheduling
- `/api/notes`: Documentation
- `/api/billing`: Billing and claims
- `/api/messages`: Messaging
- `/api/crm`: CRM functionality
- `/api/settings`: Practice settings

## Frontend Application

The frontend application is built with React, TypeScript, and Tailwind CSS, providing a modern and responsive user interface.

### Application Structure

The frontend follows a modular structure:

```
src/
├── components/
├── contexts/
├── hooks/
├── layouts/
├── models/
├── pages/
├── services/
├── utils/
└── App.tsx
```

### Key Features

- **Authentication**: Login, logout, password reset
- **Role-Based Access**: Different views and permissions based on user role
- **Responsive Design**: Works on desktop and mobile devices
- **Real-Time Updates**: WebSocket integration for notifications
- **Offline Support**: Progressive Web App capabilities

### User Interface

The user interface includes:

- Dashboard with role-specific widgets
- Client management screens
- Scheduling calendar
- Documentation editor
- Billing and claims management
- Messaging interface
- CRM tools
- Practice settings

## Security Features

MentalSpace EHR implements comprehensive security features to ensure HIPAA compliance and protect sensitive healthcare data.

### Authentication and Authorization

- JWT-based authentication
- Role-based access control
- Session timeout management
- Secure password storage with bcrypt

### Data Protection

- Data encryption at rest and in transit
- Sensitive data redaction in logs
- Secure local storage with encryption
- HTTPS enforcement

### Audit Logging

- Comprehensive audit trail
- User action logging
- Access attempt tracking
- Security event monitoring

### HIPAA Compliance

- Automatic session timeouts
- Secure browser features
- Data leakage prevention
- Page view logging for audit trails

## Deployment Guide

MentalSpace EHR can be deployed in various environments using Docker containers.

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 14+ (if not using Docker)
- SMTP server for email notifications

### Environment Configuration

The system uses environment variables for configuration, with separate files for different environments:

- `.env.development`: Development environment
- `.env.staging`: Staging environment
- `.env.production`: Production environment

### Deployment Steps

1. Clone the repository
2. Configure environment variables
3. Run database migrations
4. Build Docker images
5. Start containers with Docker Compose
6. Verify deployment

### CI/CD Pipeline

The system includes a GitHub Actions workflow for continuous integration and deployment:

- Automated testing
- Security scanning
- Staging deployment
- Production deployment

## Monitoring and Logging

MentalSpace EHR includes comprehensive monitoring and logging solutions.

### Metrics Collection

- Prometheus for metrics collection
- Node.js application metrics
- PostgreSQL database metrics
- System resource metrics

### Visualization

- Grafana dashboards for metrics visualization
- API request rate monitoring
- Response time tracking
- Error rate monitoring
- Database connection monitoring

### Logging

- Centralized logging with ELK stack
- Structured logging with Pino
- Sensitive data redaction
- Custom log levels based on response status
- Request ID tracking for correlation

### Alerting

- Grafana alerting for critical metrics
- Email notifications for system issues
- Dashboard alerts for security events

## User Guides

### Administrator Guide

- System setup and configuration
- User management
- Role assignment
- Practice settings
- Backup and maintenance

### Clinician Guide

- Client management
- Appointment scheduling
- Documentation
- Billing
- Messaging

### Front Office Guide

- Client intake
- Appointment scheduling
- Insurance verification
- Payment processing

### Supervisor Guide

- Staff supervision
- Documentation review
- Performance monitoring
- Reporting

### IT Support Guide

- Troubleshooting
- Monitoring
- Security management
- System updates
