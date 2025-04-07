import { Staff } from './Staff';

export interface DashboardPreference {
  id: string;
  staffId: string;
  staff?: Staff;
  layout: string;
  visibleWidgets: string[];
  defaultFilters: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
