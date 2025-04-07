# API Documentation

## Base URL

The API base URL for different environments:

- **Development**: `http://localhost:4000/api`
- **Staging**: `https://staging-api.mentalspace-ehr.com/api`
- **Production**: `https://api.mentalspace-ehr.com/api`

## Authentication

All API requests (except for login and registration) require authentication using JWT tokens.

### Authentication Header

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "therapist"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "therapist"
  }
}
```

#### GET /api/auth/me

Get the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## Client Management

### GET /api/clients

Get a list of clients.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, email
- `status` (optional): Filter by status (active, inactive)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "data": [
    {
      "id": "1",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "555-123-4567",
      "dateOfBirth": "1985-05-15",
      "status": "active",
      "createdAt": "2023-01-15T12:00:00Z"
    },
    // More clients...
  ]
}
```

### GET /api/clients/:id

Get a single client by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "555-123-4567",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345"
    },
    "dateOfBirth": "1985-05-15",
    "gender": "female",
    "status": "active",
    "insuranceInfo": {
      "provider": "Blue Cross",
      "policyNumber": "BC12345678",
      "groupNumber": "GRP123",
      "primaryInsured": "Jane Smith"
    },
    "emergencyContact": {
      "name": "John Smith",
      "relationship": "Spouse",
      "phone": "555-987-6543"
    },
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-03-10T14:30:00Z"
  }
}
```

### POST /api/clients

Create a new client.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-123-4567",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "dateOfBirth": "1985-05-15",
  "gender": "female",
  "insuranceInfo": {
    "provider": "Blue Cross",
    "policyNumber": "BC12345678",
    "groupNumber": "GRP123",
    "primaryInsured": "Jane Smith"
  },
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "555-987-6543"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    // Other client fields...
    "createdAt": "2023-05-20T10:15:00Z"
  }
}
```

### PUT /api/clients/:id

Update a client.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "email": "jane.johnson@example.com",
  // Other updated fields...
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Jane",
    "lastName": "Smith-Johnson",
    "email": "jane.johnson@example.com",
    // Other updated client fields...
    "updatedAt": "2023-05-25T14:30:00Z"
  }
}
```

### DELETE /api/clients/:id

Delete a client.

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Appointments

### GET /api/appointments

Get a list of appointments.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `clientId` (optional): Filter by client ID
- `staffId` (optional): Filter by staff ID
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "data": [
    {
      "id": "1",
      "startTime": "2023-06-15T14:00:00Z",
      "endTime": "2023-06-15T15:00:00Z",
      "status": "confirmed",
      "type": "individual",
      "notes": "Initial consultation",
      "client": {
        "id": "1",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "staff": {
        "id": "2",
        "firstName": "Dr.",
        "lastName": "Johnson"
      },
      "createdAt": "2023-06-01T10:00:00Z"
    },
    // More appointments...
  ]
}
```

## Documents

### GET /api/documents/:clientId

Get documents for a specific client.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "assessment",
      "title": "Initial Assessment",
      "content": "Patient presents with...",
      "createdBy": {
        "id": "2",
        "name": "Dr. Johnson"
      },
      "createdAt": "2023-06-15T15:30:00Z",
      "updatedAt": "2023-06-15T15:30:00Z"
    },
    // More documents...
  ]
}
```

## Error Responses

All errors follow a common format:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Not authorized to access this resource"
  }
}
```

### Common Error Codes

- `BAD_REQUEST`: Invalid request parameters
- `AUTH_ERROR`: Authentication error
- `FORBIDDEN`: Permission denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Validation error
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. When exceeded, you'll receive a 429 Too Many Requests response. 