// src/modules/dashboard/components/widgets/ActivityFeed.tsx

import { DashboardCard }
from "../layout/DashboardCard";

type ActivityItem = {
  id: number;
  action: string;
  createdAt: string;
};

type ActivityFeedProps = {
  signals: {
    totalActivities: number;
    lastActivity: ActivityItem | null;
    topPages: any[];
  };
};

export const ActivityFeed:
React.FC<ActivityFeedProps> = ({
  signals
}) => {

  if (!signals) {
    return (
      <DashboardCard title="Activity">
        <div>No activity</div>
      </DashboardCard>
    );
  }

  return (

    <DashboardCard title="Recent Activity">

      <p>
        Total Activities:
        {" "}
        {signals.totalActivities}
      </p>

      {signals.lastActivity && (

        <div
          style={{
            marginTop: 16
          }}
        >

          <strong>
            Last Activity
          </strong>

          <p>
            {signals.lastActivity.action}
          </p>

          <small>
            {signals.lastActivity.createdAt}
          </small>

        </div>

      )}

    </DashboardCard>
  );
};