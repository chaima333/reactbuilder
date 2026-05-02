// src/modules/dashboard/types.ts
import React from "react";

// --- 1. الـ Data Models (مستوحاة من الـ Backend) ---

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface ActivityItem {
  id: number;
  action: string;
  user?: { name: string };
  target?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSites: number;
  totalPages: number;
  totalViews: number;
  performance?: {
    storageUsed: string;
    uptime: string;
  };
  chartData: MonthlyStat[];
}

// --- 2. الـ Layout System (SaaS Engine) ---

export type DashboardWidgetType = "stats" | "chart" | "activity";

export interface DashboardBlock {
  id: string;
  type: DashboardWidgetType | string; // string للسماح بـ Plugins خارجية مستقبلاً
  col: number; // Grid size (1-12)
}

export interface DashboardLayout {
  blocks: DashboardBlock[];
}

// --- 3. الـ Shared Context (The Contract) ---


export interface DashboardContext {
  stats: DashboardStats | null;
  activity: ActivityItem[];
  plugins: {
    seo?: {
      // 🔥 زيد هذوما باش TypeScript يفهمهم
      title?: string;
      description?: string;
      keywords?: string[];
      // وخلي القديم باش ما يتكسر شيء
      indexedPages?: number; 
      missingMeta?: number;
    };
    media?: {
      totalFiles: number;
      storageUsed: string;
      items?: any[]; // لصور الميديا
    };
    [key: string]: any; 
  };
  loading: {
    stats: boolean;
    activity: boolean;
    global?: boolean;
  };
}
// --- 4. الـ Plugin Definition ---

export type DashboardPlugin = {
  key: string;
  component: React.FC<DashboardContext>;
};

// --- 5. الـ API Response Type (مستوحى من الـ Backend) ---


export interface DashboardFullResponse {
  data: {               // 🔥 هذا هو المفتاح اللي ناقصك
    stats: DashboardStats;
    activity: ActivityItem[];
    plugins: {
      seo?: any;
      media?: any;
    };
    layout: {
      blocks: DashboardBlock[];
    };
  };
  message?: string;
  status?: string;
}

// --- 6. الـ SEO Plugin Specific Types (كمثال على Plugin) ---

export interface SeoData {
  title: string;
  description: string;
  keywords: string[];
}

export interface SeoPluginContext {
  seo: SeoData;
  loading: boolean;
}

// --- 7. الـ Media Plugin Specific Types (كمثال ثاني على Plugin) ---
export interface MediaItem {
  id: number;
  url: string;
  type: "image" | "video";
}

export interface MediaPluginContext {
  media: MediaItem[];
  loading: boolean;
}