


export interface DashboardBlock {
  type: string;
  col: number;
}

export interface DashboardLayout {
  blocks: DashboardBlock[];
}

export interface DashboardStats {
  totalSites: number;
  totalPages: number;
  totalViews: number;

  chartData: {
    month: string;
    count: number;
  }[];
}

export interface ActivityItem {
  id: number;
  action: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface DashboardResponse {
  stats: DashboardStats;
  activity: ActivityItem[];
  layout: DashboardLayout;
}