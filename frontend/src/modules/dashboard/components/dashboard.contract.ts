export interface DashboardStats {
  totalSites: number;
  totalPages: number;
  totalViews: number;
  chartData: { month: string; count: number }[];
}

export interface Activity {
  id: number;
  action: string;
  createdAt: string;
}

export interface DashboardContext {
  stats: DashboardStats | null;
  activity: Activity[];
  loading: {
    stats: boolean;
    activity: boolean;
  };
}

