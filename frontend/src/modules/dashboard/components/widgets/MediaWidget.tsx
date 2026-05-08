import React from "react";
import { DashboardCard } from "../layout/DashboardCard";

type MediaWidgetProps = {
  data: { // بدلنا payload بـ data
    totalFiles: number;
    storageUsed: string;
    items: any[];
  };
};

export const MediaWidget: React.FC<MediaWidgetProps> = ({ data }) => {
  // التثبت توّة يصير على data
  if (!data) {
    return (
      <DashboardCard title="Media Assets">
        <div style={{ color: "#A3AED0", padding: "20px" }}>No media assets found.</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Media Assets">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 600 }}>FILES</p>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{data.totalFiles}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 600 }}>STORAGE</p>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#3b82f6" }}>{data.storageUsed}</p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase" }}>
          Recent Uploads
        </p>
        {data.items?.length > 0 ? (
          data.items.map((m: any) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#1e293b",
                border: "1px solid #f1f5f9"
              }}
            >
              <span style={{ marginRight: "10px" }}>🖼️</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {m.originalName}
              </span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#cbd5e1", textAlign: "center" }}>Library is empty</p>
        )}
      </div>
    </DashboardCard>
  );
};