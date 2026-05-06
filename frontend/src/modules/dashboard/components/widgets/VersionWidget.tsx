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
    return <div>No Version Data</div>;
  }

  return (
    <div>

      <h3>Versions</h3>

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

    </div>
  );
};