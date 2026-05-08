import React from "react";
import { DashboardCard } from "../layout/DashboardCard";

type VersionWidgetProps = {
  data: {
    totalVersions: number;
    lastBackup: string;
  };
};

export const VersionWidget: React.FC<VersionWidgetProps> = ({ data }) => {
  if (!data) {
    return (
      <DashboardCard title="Versions & Backups">
        <div style={{ color: "#A3AED0", padding: "20px" }}>No backup history found.</div>
      </DashboardCard>
    );
  }

  // دالة بسيطة لتنسيق التاريخ
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <DashboardCard title="Snapshot History">
      <div style={{ padding: "10px 0" }}>
        {/* Versions Count Section */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#EEF2FF",
          borderRadius: "14px",
          border: "1px solid #E0E7FF"
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "#6366F1", fontWeight: 700, textTransform: "uppercase" }}>
              Stored Snapshots
            </p>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: 800, color: "#4338CA" }}>
              {data.totalVersions}
            </h3>
          </div>
          <div style={{ fontSize: "32px" }}></div>
        </div>

        {/* Last Backup Section */}
        <div style={{ display: "flex", alignItems: "start", gap: "12px", padding: "0 5px" }}>
          <div style={{ color: "#10B981", marginTop: "2px" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
              Last Backup Successful
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {formatDate(data.lastBackup)}
            </p>
          </div>
        </div>

        {/* Action Button (Optional Visual) */}
        <button style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#F8FAFC",
          color: "#475569",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s"
        }}>
          View Full History
        </button>
      </div>
    </DashboardCard>
  );
};