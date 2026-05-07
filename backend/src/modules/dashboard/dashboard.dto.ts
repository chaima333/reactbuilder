export type DashboardBlockType =
  | "stats"
  | "chart"
  | "activity"
  | "widget.version.summary"
  | "widget.seo.score"
  | "widget.media.summary";
/**
 * =====================================================
 * LAYOUT
 * =====================================================
 */

export interface DashboardBlock {
  id: string;

  type: DashboardBlockType;

  col: number;

  order: number;
}

export interface DashboardLayout {
  blocks: DashboardBlock[];
}

/**
 * =====================================================
 * STATS
 * =====================================================
 */

export interface DashboardStats {
  totalSites: number;

  totalPages: number;

  totalViews: number;

  siteName?: string;

  chartData: {
    month: string;

    count: number;
  }[];
}

/**
 * =====================================================
 * ACTIVITY
 * =====================================================
 */

export interface ActivityItem {
  id: number;

  action: string;

  createdAt: string;

  user?: {
    id: number;

    name: string;
  };
}

/**
 * =====================================================
 * WIDGETS
 * =====================================================
 */

export interface DashboardWidget {
  id: string;

  type: DashboardBlockType;

  enabled: boolean;

  payload: any;
}

/**
 * =====================================================
 * RESPONSE
 * =====================================================
 */

export interface DashboardResponse {
  stats: DashboardStats;

  signals: DashboardSignals;

  activity?: ActivityItem[];

  widgets: DashboardWidget[];

  layout: DashboardLayout;

  meta?: {
    generatedAt: number;

    schemaVersion: number;

    cacheTTL: number;
  };
}



export interface DashboardSignals {
  totalActivities: number;

  lastActivity: {
    action: string;
    createdAt: string;
  } | null;

  topPages: {
    id: number;
    title: string;
    updatedAt: string;
  }[];
}