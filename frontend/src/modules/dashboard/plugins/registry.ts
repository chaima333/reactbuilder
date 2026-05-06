// src/modules/dashboard/plugins/registry.ts

import React from "react";

// CORE WIDGETS
import { StatsCards }
from "../components/widgets/StatsCards";

import { MonthlyChart }
from "../components/widgets/MonthlyChart";

import { ActivityFeed }
from "../components/widgets/ActivityFeed";

// PLUGIN WIDGETS
import { SeoWidget }
from "../components/widgets/SeoWidget";

import { MediaWidget }
from "../components/widgets/MediaWidget";

import { VersionWidget }
from "../components/widgets/VersionWidget";

// REGISTRY
export const pluginRegistry:
Record<string, React.FC<any>> = {

  // CORE
  stats: StatsCards,

  chart: MonthlyChart,

  activity: ActivityFeed,

  // PLUGINS
  seo: SeoWidget,

  media: MediaWidget,

  version: VersionWidget

};