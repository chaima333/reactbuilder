import { DashboardCard }
from "../layout/DashboardCard";

type VersionWidgetProps = {
  payload: {
    totalVersions: number;
    lastBackup: string;
  };
};

export const VersionWidget:
React.FC<VersionWidgetProps> = ({
  payload
}) => {

  if (!payload) {

    return (
      <DashboardCard title="Versions">
        <div>No Version Data</div>
      </DashboardCard>
    );
  }

  return (

    <DashboardCard title="Versions">

      <p>
        Total Versions:
        {" "}
        {payload.totalVersions}
      </p>

      <p>
        Last Backup:
        {" "}
        {payload.lastBackup}
      </p>

    </DashboardCard>

  );
};