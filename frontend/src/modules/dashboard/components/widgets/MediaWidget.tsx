// src/modules/dashboard/components/widgets/MediaWidget.tsx
import React from "react";

type MediaWidgetProps = {
  data: {
    totalFiles: number;
    storageUsed: string;
    items: any[];
  };
};

export const MediaWidget: React.FC<MediaWidgetProps> = ({ data }) => {

  if (!data) {
    return <div>No media</div>;
  }

  return (
    <div>
      <h3>Assets ({data.totalFiles})</h3>

      {data.items?.map((m: any) => (
        <div key={m.id}>
          {m.originalName}
        </div>
      ))}
    </div>
  );
};