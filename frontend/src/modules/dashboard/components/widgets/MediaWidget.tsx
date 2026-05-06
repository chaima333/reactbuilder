// src/modules/dashboard/components/widgets/MediaWidget.tsx

import React from "react";

import { DashboardCard }
from "../layout/DashboardCard";

type MediaWidgetProps = {
  data: {
    totalFiles: number;
    storageUsed: string;
    items: any[];
  };
};

export const MediaWidget:
React.FC<MediaWidgetProps> = ({
  data
}) => {

  if (!data) {
    return (
      <DashboardCard title="Media">
        <div>No media</div>
      </DashboardCard>
    );
  }

  return (

    <DashboardCard title="Media Assets">

      <p>
        Total Files:
        {" "}
        {data.totalFiles}
      </p>

      <p>
        Storage Used:
        {" "}
        {data.storageUsed}
      </p>

      <div
        style={{
          marginTop: 20
        }}
      >

        {data.items?.map((m: any) => (

          <div
            key={m.id}
            style={{
              padding: "8px 0",
              borderBottom:
                "1px solid #eee"
            }}
          >
            {m.originalName}
          </div>

        ))}

      </div>

    </DashboardCard>
  );
};