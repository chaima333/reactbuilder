import { DashboardCard }
from "../layout/DashboardCard";

type VersionWidgetProps = {
  data: {
    totalVersions: number;
    lastBackup: string;
  };
};

export const VersionWidget:
React.FC<VersionWidgetProps> = ({
  data
}) => {

  if (!data) {

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
        {data.totalVersions}
      </p>

      <p>
        Last Backup:
        {" "}
        {data.lastBackup}
      </p>

    </DashboardCard>

  );
};