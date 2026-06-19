import { StatsCards }
from "../components/widgets/StatsCards";

import { MonthlyChart }
from "../components/widgets/MonthlyChart";

import { ActivityFeed }
from "../components/widgets/ActivityFeed";

import { SeoWidget }
from "../components/widgets/SeoWidget";

import { VersionWidget }
from "../components/widgets/VersionWidget";

import { MediaWidget }
from "../components/widgets/MediaWidget";

import { NotificationsWidget }
from "../components/widgets/NotificationsWidget";

export const pluginRegistry:
Record<string, any> = {

  stats:
    StatsCards,

  chart:
    MonthlyChart,

  activity:
    ActivityFeed,

  "widget.seo.score":
    SeoWidget,

  "widget.version.summary":
    VersionWidget,

 "widget.media.summary":
  MediaWidget,

 notifications:
  NotificationsWidget

};
