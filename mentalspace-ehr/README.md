# MentalSpace EHR - README

## Overview

MentalSpace EHR is a comprehensive Electronic Health Record system specifically designed for mental health practices. It provides a complete solution for managing clients, scheduling appointments, documenting sessions, handling billing and insurance claims, secure messaging, client relationship management, and practice administration.

## Key Features

- **Authentication & Security**: Secure login, role-based access control, and comprehensive audit logging
- **Staff Management**: Provider profiles, credentials, supervision relationships, and compensation tracking
- **Client Management**: Client records, insurance information, waitlist management, and client flags
- **Scheduling**: Appointment booking, recurring appointments, provider availability, and calendar management
- **Documentation**: Clinical notes, templates, versioning, diagnoses, and risk assessments
- **Billing**: Insurance claims, payments, invoices, and authorizations management
- **Messaging**: Secure client-provider communication, message templates, and notifications
- **CRM**: Lead tracking, marketing campaigns, and client acquisition tools
- **Practice Settings**: System configuration, location management, integrations, and system maintenance

## Technical Architecture

MentalSpace EHR is built using the MERN stack:

- **MongoDB**: NoSQL database for flexible data storage
- **Express.js**: Backend API framework
- **React.js**: Frontend user interface
- **Node.js**: JavaScript runtime environment

The application follows a modular architecture with clear separation of concerns:

- **Models**: MongoDB schemas and data validation
- **Controllers**: Business logic and API endpoints
- **Routes**: API route definitions and middleware
- **Middleware**: Authentication, error handling, and request processing
- **Utils**: Utility functions and helpers
- **Tests**: Comprehensive test suite for all modules

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-organization/mentalspace-ehr.git
cd mentalspace-ehr
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
cp .env.example .env
```
Edit the `.env` file with your configuration settings.

4. Start the development server
```
npm run dev
```

### Running Tests

```
npm test
```

## API Documentation

The API is organized into the following main routes:

- `/api/v1/auth`: Authentication endpoints
- `/api/v1/staff`: Staff management endpoints
- `/api/v1/clients`: Client management endpoints
- `/api/v1/appointments`: Scheduling endpoints
- `/api/v1/notes`: Documentation endpoints
- `/api/v1/claims`: Billing endpoints
- `/api/v1/messages`: Messaging endpoints
- `/api/v1/leads`: CRM endpoints
- `/api/v1/settings`: Practice settings endpoints

Detailed API documentation is available in the `/docs` directory.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Comprehensive audit logging
- HIPAA-compliant data handling
- Encryption for sensitive data
- Session timeout and management
- Input validation and sanitization

## Mental Health Specific Features

- DSM-5 diagnosis support
- Risk assessment tools
- Treatment plan templates
- Progress note templates
- Outcome measurement tools
- Telehealth integration
- Supervision and training tools
- Client portal for self-service

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@mentalspace-ehr.com or open an issue on GitHub.
