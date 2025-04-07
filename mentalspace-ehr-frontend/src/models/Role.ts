export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: {
    dashboard: boolean;
    clients: boolean;
    documentation: boolean;
    schedule: boolean;
    messaging: boolean;
    billing: boolean;
    settings: boolean;
    staff: boolean;
  };
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}
