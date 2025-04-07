// Mock data utility for development
export const mockStaffData = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    title: 'Therapist',
    role: 'clinician',
    status: 'active',
    hireDate: '2022-01-15',
    createdAt: '2022-01-15T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    title: 'Clinical Supervisor',
    role: 'supervisor',
    status: 'active',
    hireDate: '2021-06-10',
    createdAt: '2021-06-10T00:00:00.000Z',
    updatedAt: '2023-04-15T00:00:00.000Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '(555) 456-7890',
    title: 'Intake Coordinator',
    role: 'scheduler',
    status: 'inactive',
    hireDate: '2020-03-22',
    createdAt: '2020-03-22T00:00:00.000Z',
    updatedAt: '2023-01-10T00:00:00.000Z'
  }
];

export const mockClientData = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1990-05-15',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    gender: 'Male',
    pronouns: 'he/him',
    status: 'active',
    referralSource: 'Website',
    referralDate: '2023-01-10',
    flags: ['High priority'],
    createdAt: '2023-01-10T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z'
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Johnson',
    dateOfBirth: '1985-09-22',
    email: 'emily.johnson@example.com',
    phone: '(555) 987-6543',
    gender: 'Female',
    pronouns: 'she/her',
    status: 'active',
    referralSource: 'Doctor Referral',
    referralDate: '2022-11-05',
    flags: [],
    createdAt: '2022-11-05T00:00:00.000Z',
    updatedAt: '2023-04-15T00:00:00.000Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Williams',
    dateOfBirth: '1978-03-10',
    email: 'michael.williams@example.com',
    phone: '(555) 456-7890',
    gender: 'Male',
    pronouns: 'he/him',
    status: 'inactive',
    referralSource: 'Psychology Today',
    referralDate: '2022-08-20',
    flags: ['Insurance expired'],
    createdAt: '2022-08-20T00:00:00.000Z',
    updatedAt: '2023-01-10T00:00:00.000Z'
  }
];
