// src/modules/dashboard/types.ts

/**
 * =====================================================
 * STATS
 * =====================================================
 */

export interface MonthlyStat {

  month: string;

  count: number;

}

export interface DashboardStats {

  siteId: number;

  totalPages: number;

  totalViews: number;

  siteName?: string;

  chartData: MonthlyStat[];

}

/**
 * =====================================================
 * ACTIVITY
 * =====================================================
 */

export interface ActivityItem {

  action: string;

  createdAt: string;

}

/**
 * =====================================================
 * TOP PAGES
 * =====================================================
 */

export interface TopPage {

  id: number;

  title: string;

  updatedAt: string;

}

/**
 * =====================================================
 * SIGNALS
 * =====================================================
 */

export interface DashboardSignals {

  totalActivities: number;

  lastActivity:
    ActivityItem | null;

  topPages:
    TopPage[];

}

/**
 * =====================================================
 * WIDGETS
 * =====================================================
 */

export interface DashboardWidget {

  id: string;

  type: string;

  enabled: boolean;

  payload: any;

  title?: string;

  col?: number;

  order?: number;

}

/**
 * =====================================================
 * LAYOUT
 * =====================================================
 */

export interface DashboardBlock {

  id: string;

  type: string;

  col: number;

  order?: number;

}

export interface DashboardLayout {

  blocks:
    DashboardBlock[];

}

/**
 * =====================================================
 * FULL SNAPSHOT
 * =====================================================
 */

export interface DashboardFullResponse {

  stats: DashboardStats;

  signals: DashboardSignals;

  widgets: DashboardWidget[];

  layout: DashboardLayout;

  meta: {

    generatedAt: number;

    schemaVersion: number;

    cacheTTL: number;

  };

}
