import React from "react";
import { DashboardStats } from "../../types/dashboard.types";

type StatsCardsProps = {
  stats: DashboardStats;
};

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const items = [
    { label: "Total Sites", value: stats?.totalSites ?? 0, color: "#3b82f6", icon: "🌐" },
    { label: "Total Pages", value: stats?.totalPages ?? 0, color: "#10b981", icon: "📄" },
    { label: "Total Views", value: stats?.totalViews ?? 0, color: "#8b5cf6", icon: "👁️" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
      fontFamily: "sans-serif"
    }}>
      {items.map((item, index) => (
        <div key={index} style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #eef2f6",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center"
        }}>
          {/* Icon Circle */}
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            backgroundColor: `${item.color}15`, // Transparency
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            marginRight: "15px"
          }}>
            {item.icon}
          </div>

          {/* Data */}
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              {item.label}
            </p>
            <h3 style={{ margin: "5px 0 0 0", fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
              {item.value.toLocaleString()}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};