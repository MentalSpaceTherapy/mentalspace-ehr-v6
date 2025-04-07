# MentalSpace EHR Platform

A comprehensive Electronic Health Record system for mental health practices built with React, TypeScript, and Node.js.

## Project Overview

MentalSpace EHR is designed to streamline administrative and clinical workflows for mental health practices. The platform offers a suite of integrated modules for client management, scheduling, documentation, billing, and more.

## Project Structure

- **[Frontend](/mentalspace-ehr-frontend)**: React/TypeScript application
- **[Backend](/mentalspace-ehr)**: Node.js/Express API with TypeORM
- **[Database Migrations](/mentalspace-ehr-migrations)**: TypeORM migration files
- **[Testing](/mentalspace-ehr-testing)**: Cypress E2E tests

## Key Features

- **Authentication & Authorization**: Role-based access control for different staff members
- **Staff Management**: Manage providers, schedules, and credentials
- **Client Management**: Comprehensive client information management
- **Scheduling**: Calendar and appointment management
- **Documentation**: Clinical documentation tools
- **Billing**: Insurance and self-pay billing features
- **Dashboard**: Customizable analytics dashboard
- **Messaging**: Secure client and team communication
- **Reports**: Financial and clinical reporting
- **CRM**: Lead tracking and conversion toolset

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeORM
- **Database**: PostgreSQL
- **Testing**: Cypress, Jest
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Containerization**: Docker, Docker Compose

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/mentalspacetherapy/mentalspace-ehr-v6.git
   cd mentalspace-ehr-v6
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in each project directory
   - Fill in the required environment variables

3. Start the application using Docker Compose:
   ```
   docker-compose up
   ```

4. Or start each component individually:
   - Backend: 
     ```
     cd mentalspace-ehr
     npm install
     npm run dev
     ```
   - Frontend: 
     ```
     cd mentalspace-ehr-frontend
     npm install
     npm run dev
     ```
   - Migrations: 
     ```
     cd mentalspace-ehr-migrations
     npm install
     npm run typeorm:run
     ```

## Testing

Run end-to-end tests:
```
cd mentalspace-ehr-testing
npm install
npm run test:e2e
```

Run backend tests:
```
cd mentalspace-ehr
npm test
```

Run frontend tests:
```
cd mentalspace-ehr-frontend
npm test
```

## Deployment

The application is configured with CI/CD pipelines for automatic deployment:

- Push to `develop` branch deploys to staging environment
- Push to `main` branch deploys to production environment

See the [.github/workflows/ci-cd.yml](/.github/workflows/ci-cd.yml) file for detailed CI/CD configuration.

## Documentation

Additional documentation is available in the [docs](/mentalspace-ehr/docs) directory:

- Architecture Overview
- API Documentation
- Database Schema
- User Guides for Different Roles

## License

[Specify license information here]

## Contact

[Contact information for the project maintainers]
