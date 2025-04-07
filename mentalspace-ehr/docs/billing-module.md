# Billing Module

This document provides an overview of the Billing Module for the MentalSpace EHR system.

## Overview

The Billing Module provides comprehensive financial management functionality for mental health practices, including insurance claim processing, payment tracking, invoicing, and authorization management.

## Core Features

### Insurance Carrier Management
- Carrier information and contact details
- Electronic payer IDs and submission methods
- Claim format specifications
- Eligibility verification methods
- Portal credentials and submission tracking

### Claim Processing
- Electronic and paper claim creation
- Multiple service codes and diagnosis support
- Claim status tracking
- Submission and tracking
- Denial management and appeals
- Payment reconciliation

### Payment Management
- Insurance and patient payment tracking
- Multiple payment methods
- EOB processing
- Payment allocation
- Refund and adjustment handling
- Payment reconciliation

### Invoicing
- Client invoice generation
- Customizable invoice templates
- Payment tracking
- Reminder management
- Balance tracking
- Discount and adjustment handling

### Authorization Management
- Insurance authorization tracking
- Session counting and monitoring
- Authorization verification
- Renewal tracking
- Provider restrictions
- Diagnosis limitations

## Data Models

### InsuranceCarrier
- Carrier details and contact information
- Electronic submission settings
- Payer IDs and claim formats
- Portal credentials
- Verification methods

### Claim
- Client and provider references
- Service and diagnosis information
- Insurance policy details
- Submission tracking
- Status management
- Payment reconciliation

### Payment
- Payment source and method
- Amount and date tracking
- EOB information
- Claim and invoice associations
- Status tracking

### Invoice
- Client billing information
- Line items and services
- Payment terms
- Status tracking
- Payment reconciliation
- Reminder management

### Authorization
- Insurance approval details
- Session limits and tracking
- Date restrictions
- Provider limitations
- Verification information

## API Endpoints

### Insurance Carrier Endpoints
- `GET /api/v1/insurance-carriers` - Get all insurance carriers
- `GET /api/v1/insurance-carriers/:id` - Get a single insurance carrier
- `POST /api/v1/insurance-carriers` - Create a new insurance carrier
- `PUT /api/v1/insurance-carriers/:id` - Update an insurance carrier
- `DELETE /api/v1/insurance-carriers/:id` - Delete an insurance carrier

### Claim Endpoints
- `GET /api/v1/claims` - Get all claims
- `GET /api/v1/clients/:clientId/claims` - Get claims for a specific client
- `GET /api/v1/claims/:id` - Get a single claim
- `POST /api/v1/claims` - Create a new claim
- `PUT /api/v1/claims/:id` - Update a claim
- `DELETE /api/v1/claims/:id` - Delete a claim
- `PUT /api/v1/claims/:id/submit` - Submit a claim
- `PUT /api/v1/claims/:id/deny` - Mark a claim as denied
- `PUT /api/v1/claims/:id/appeal` - Appeal a denied claim

### Payment Endpoints
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/clients/:clientId/payments` - Get payments for a specific client
- `GET /api/v1/claims/:claimId/payments` - Get payments for a specific claim
- `GET /api/v1/invoices/:invoiceId/payments` - Get payments for a specific invoice
- `GET /api/v1/payments/:id` - Get a single payment
- `POST /api/v1/payments` - Create a new payment
- `PUT /api/v1/payments/:id` - Update a payment
- `DELETE /api/v1/payments/:id` - Delete a payment
- `PUT /api/v1/payments/:id/void` - Void a payment

### Invoice Endpoints
- `GET /api/v1/invoices` - Get all invoices
- `GET /api/v1/clients/:clientId/invoices` - Get invoices for a specific client
- `GET /api/v1/invoices/:id` - Get a single invoice
- `POST /api/v1/invoices` - Create a new invoice
- `PUT /api/v1/invoices/:id` - Update an invoice
- `DELETE /api/v1/invoices/:id` - Delete an invoice
- `PUT /api/v1/invoices/:id/send` - Send an invoice
- `PUT /api/v1/invoices/:id/remind` - Add a reminder to an invoice
- `PUT /api/v1/invoices/:id/void` - Void an invoice

### Authorization Endpoints
- `GET /api/v1/authorizations` - Get all authorizations
- `GET /api/v1/clients/:clientId/authorizations` - Get authorizations for a specific client
- `GET /api/v1/authorizations/:id` - Get a single authorization
- `POST /api/v1/authorizations` - Create a new authorization
- `PUT /api/v1/authorizations/:id` - Update an authorization
- `DELETE /api/v1/authorizations/:id` - Delete an authorization
- `PUT /api/v1/authorizations/:id/verify` - Verify an authorization
- `PUT /api/v1/authorizations/:id/use-session` - Use a session from an authorization

## Integration Points

The Billing Module integrates with:

- **Authentication Module** - For user authentication and access control
- **Staff Management Module** - For provider information and billing credentials
- **Client Management Module** - For client information and insurance policies
- **Scheduling Module** - For appointment information and service dates
- **Documentation Module** - For clinical notes, diagnosis codes, and billing codes

## Security Considerations

- Role-based access control for all operations
- Comprehensive audit logging for HIPAA compliance
- Secure handling of insurance credentials and payment information
- Encryption of sensitive financial data
- Compliance with PCI standards for payment processing
