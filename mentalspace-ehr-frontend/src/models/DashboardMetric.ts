export interface DashboardMetric {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  calculation: string;
  format: 'number' | 'currency' | 'percentage' | 'date';
  thresholds: {
    warning?: number;
    critical?: number;
  };
  roles: ('admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor')[];
  createdAt: string;
  updatedAt: string;
}
