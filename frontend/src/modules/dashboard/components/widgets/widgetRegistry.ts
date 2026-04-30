import { FC } from 'react';
import { StatsCards } from "../../components/widgets/StatsCards";
import { MonthlyChart } from "../../components/widgets/MonthlyChart";
import { ActivityFeed } from "../../components/widgets/ActivityFeed";

import { SectionBlock } from "../../../pageBuilder/components/blocks/SectionBlock"; 

export const blockRegistry: Record<string, FC<any>> = {
  // 📊 Dashboard Blocks
  "dashboard.stats": StatsCards,
  "dashboard.chart": MonthlyChart,
  "dashboard.activity": ActivityFeed,
  
  // 🏗️ Layout Blocks
  "layout.section": SectionBlock, 
};