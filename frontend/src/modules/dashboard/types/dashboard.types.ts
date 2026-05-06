// src/modules/dashboard/types.ts


// ======================================================
// CORE STATS
// ======================================================

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface DashboardStats {
  totalSites: number;
  totalPages: number;
  totalViews: number;
  chartData: MonthlyStat[];
}

// ======================================================
// ACTIVITY
// ======================================================

export interface ActivityItem {
  id: number;
  action: string;
  createdAt: string;
}

// ======================================================
// LAYOUT
// ======================================================

export interface DashboardBlock {
  id: string;
  type: string;
  col: number;
  order?: number;
}

export interface DashboardLayout {
  blocks: DashboardBlock[];
}

// ======================================================
// PLUGINS
// ======================================================

export interface DashboardPluginData {
  name: string;
  enabled: boolean;
  priority: number;
  hasDashboard: boolean;
  data?: unknown;
}

// ======================================================
// API RESPONSE
// ======================================================

export interface DashboardFullResponse {
  stats: DashboardStats;
  signals: {
    totalActivities: number;
    lastActivity: ActivityItem | null;
    topPages: TopPage[];
  };

  plugins: DashboardPluginData[];

  layout: DashboardLayout;

  generatedAt: number;
}

// ======================================================
// WIDGET REGISTRY
// ======================================================

export type DashboardPlugin = {
  key: string;
  component: any;
};

 // 
export interface TopPage {
  id: number;
  title: string;
  updatedAt: string;
}

export interface DashboardSignals {
  totalActivities: number;
  lastActivity: ActivityItem | null;
  topPages: TopPage[];
}