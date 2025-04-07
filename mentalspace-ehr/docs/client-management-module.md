# Client Management Module Documentation

## Overview

The Client Management module provides a comprehensive system for managing client information in the MentalSpace EHR system. It includes a multi-step form for creating and editing client records, with support for storing demographic information, contact details, insurance information, emergency contacts, and additional clinical details.

## Features

- **Multi-Step Client Form**: A 5-step wizard interface with progress tracking
- **Field-Level Validation**: Real-time validation with inline error messages
- **Conditional Fields**: Dynamic form fields that appear based on user selections
- **Autosave Functionality**: Automatic saving at the end of each step
- **Draft Saving**: Manual saving of form progress at any point
- **Confirmation Modal**: Final review before submission
- **Address Auto-Complete**: Integration with mapping services for address entry
- **File Upload**: Support for insurance card scans and other documents
- **End-to-End Encryption**: Protection of sensitive client information
- **Comprehensive Audit Logging**: Tracking of all client data operations

## Database Schema

### Client Entity

The Client entity stores the core information about each client:

```typescript
@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    first_name: string;

    @Column({ nullable: false })
    last_name: string;

    @Column({ nullable: true })
    preferred_name: string;

    @Column({ type: "date", nullable: false })
    date_of_birth: Date;

    @Column({
        type: "enum",
        enum: ["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"],
        nullable: false
    })
    gender: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    email: string;

    // Address fields
    @Column({ nullable: false })
    address_line1: string;

    @Column({ nullable: true })
    address_line2: string;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    state: string;

    @Column({ nullable: false })
    postal_code: string;

    @Column({ default: "USA" })
    country: string;

    // Status and assignment
    @Column({
        type: "enum",
        enum: ["ACTIVE", "INACTIVE", "WAITLIST"],
        default: "ACTIVE"
    })
    status: string;

    @Column({ nullable: true })
    assigned_therapist_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "assigned_therapist_id" })
    assigned_therapist: Staff;

    @Column({
        type: "enum",
        enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
        default: "NONE"
    })
    risk_flag: string;

    // Additional clinical information
    @Column({ nullable: true })
    primary_care_provider: string;

    @Column({ nullable: true })
    referral_source: string;

    @Column({ nullable: true })
    case_number: string;

    @Column({ default: false })
    court_mandated: boolean;

    @Column({ type: "text", nullable: true })
    court_mandated_notes: string;

    // Relationships
    @OneToMany(() => EmergencyContact, emergencyContact => emergencyContact.client)
    emergency_contacts: EmergencyContact[];

    // Timestamps
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;
}
```

### EmergencyContact Entity

The EmergencyContact entity stores information about client emergency contacts:

```typescript
@Entity("emergency_contacts")
export class EmergencyContact {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    relationship: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ default: true })
    is_primary: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
```

### FileUpload Entity

The FileUpload entity manages uploaded files such as insurance cards:

```typescript
@Entity("file_uploads")
export class FileUpload {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    entity_type: string;

    @Column({ nullable: false })
    entity_id: string;

    @Column({ nullable: false })
    file_type: string;

    @Column({ nullable: false })
    original_filename: string;

    @Column({ nullable: false })
    file_path: string;

    @Column({ nullable: false })
    file_size: number;

    @Column({ nullable: false })
    mime_type: string;

    @Column({ nullable: true })
    uploaded_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
```

## Frontend Components

### Client Form

The main component for creating and editing client records is the multi-step ClientForm:

1. **BasicDemographics**: First name, last name, preferred name, date of birth, gender
2. **ContactInformation**: Phone, email, address with auto-complete
3. **InsuranceInformation**: Insurance carrier, policy details, file uploads for insurance cards
4. **EmergencyContact**: Emergency contact details, additional client information
5. **ReviewConfirmation**: Comprehensive summary with edit options for each section

### Client Directory

The ClientDirectory component provides a searchable, filterable list of all clients in the system, with options to view, edit, or delete client records.

### Client Profile

The ClientProfile component displays detailed information about a specific client, including demographics, contact information, insurance details, emergency contacts, and clinical information.

## Security Features

### End-to-End Encryption

The Client Management module implements end-to-end encryption for sensitive client data:

- **Personally Identifiable Information (PII)**: Names, dates of birth, contact information, addresses
- **Protected Health Information (PHI)**: Medical history, treatment information, clinical notes

Encryption is handled by the `secureClientService`, which encrypts data before sending it to the API and decrypts data when retrieving it from the API.

### Audit Logging

Comprehensive audit logging is implemented for all client data operations:

- **Create**: Logs when a client record is created, including who created it and basic metadata
- **Read**: Logs when a client record is accessed, including who accessed it and when
- **Update**: Logs when a client record is modified, including who modified it and what fields were changed
- **Delete**: Logs when a client record is deleted, including who deleted it

### Secure File Handling

Insurance card scans and other uploaded files are handled securely:

- Files are stored in a secure location with restricted access
- File metadata is stored in the database, with the actual file content stored in the file system
- File access is logged and restricted to authorized users

## API Endpoints

### Client Endpoints

- `GET /clients`: Get a list of all clients
- `GET /clients/:id`: Get a specific client by ID
- `POST /clients`: Create a new client
- `PUT /clients/:id`: Update an existing client
- `DELETE /clients/:id`: Delete a client

### Emergency Contact Endpoints

- `GET /clients/:clientId/emergencycontacts`: Get all emergency contacts for a client
- `POST /clients/:clientId/emergencycontacts`: Create a new emergency contact
- `PUT /emergencycontacts/:id`: Update an existing emergency contact
- `DELETE /emergencycontacts/:id`: Delete an emergency contact

### File Upload Endpoints

- `POST /uploads`: Upload a new file
- `GET /uploads`: Get a list of uploaded files
- `GET /uploads/:id`: Get a specific file by ID
- `DELETE /uploads/:id`: Delete a file

## Usage Examples

### Creating a New Client

```typescript
import { useClient } from '../contexts/ClientContext';

const ClientCreationComponent = () => {
  const { createClientFromFormData } = useClient();
  
  const handleSubmit = async (formData) => {
    try {
      const newClient = await createClientFromFormData(formData);
      console.log('Client created successfully:', newClient);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };
  
  return (
    <ClientForm onSubmit={handleSubmit} />
  );
};
```

### Updating an Existing Client

```typescript
import { useClient } from '../contexts/ClientContext';
import { useParams } from 'react-router-dom';

const ClientEditComponent = () => {
  const { id } = useParams();
  const { fetchClientById, updateClientFromFormData } = useClient();
  const [client, setClient] = useState(null);
  
  useEffect(() => {
    const loadClient = async () => {
      const clientData = await fetchClientById(id);
      setClient(clientData);
    };
    
    loadClient();
  }, [id]);
  
  const handleUpdate = async (formData) => {
    try {
      const updatedClient = await updateClientFromFormData(id, formData);
      console.log('Client updated successfully:', updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };
  
  if (!client) return <div>Loading...</div>;
  
  return (
    <ClientForm initialData={client} onSubmit={handleUpdate} />
  );
};
```

## Security Considerations

1. **Data Encryption**: All sensitive client data is encrypted both in transit and at rest
2. **Access Control**: Access to client data is restricted based on user roles and permissions
3. **Audit Logging**: All access to client data is logged for compliance and security purposes
4. **Secure File Handling**: Uploaded files are stored securely and access is restricted
5. **HIPAA Compliance**: The module is designed to comply with HIPAA regulations for protecting PHI

## Testing

The Client Management module includes comprehensive tests:

- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing the interaction between components
- **End-to-End Tests**: Testing the complete client management workflow

Tests cover form validation, navigation between steps, data submission, error handling, and security features.

## Future Enhancements

1. **Advanced Search**: Implement more advanced search and filtering options for the client directory
2. **Bulk Operations**: Add support for bulk operations on client records
3. **Client Portal Integration**: Allow clients to view and update their own information through a client portal
4. **Custom Fields**: Support for custom fields to be added to client records
5. **Document Generation**: Generate PDF documents from client data (e.g., intake forms, consent forms)
