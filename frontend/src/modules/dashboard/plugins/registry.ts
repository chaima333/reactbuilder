// src/modules/dashboard/plugins/registry.ts
import { StatsCards } from "../components/widgets/StatsCards";
import { MonthlyChart } from "../components/widgets/MonthlyChart";
import { ActivityFeed } from "../components/widgets/ActivityFeed";
import { SeoWidget } from "../components/widgets/SeoWidget"; // 🆕
import { MediaWidget } from "../components/widgets/MediaWidget"; // 🆕
import { DashboardContext } from "../components/widgets/types";

export const pluginRegistry: Record<string, React.FC<DashboardContext>> = {
  stats: StatsCards,
  chart: MonthlyChart,
  activity: ActivityFeed,
  seo: SeoWidget,    
  media: MediaWidget, 
};