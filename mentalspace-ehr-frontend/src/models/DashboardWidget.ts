export interface DashboardWidget {
  id: string;
  name: string;
  type: 'appointments' | 'documentation' | 'messages' | 'billing' | 'clients' | 'staff' | 'metrics' | 'custom';
  config: Record<string, any>;
  defaultSize: 'small' | 'medium' | 'large';
  defaultPosition: number;
  roles: ('admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor')[];
  createdAt: string;
  updatedAt: string;
}
