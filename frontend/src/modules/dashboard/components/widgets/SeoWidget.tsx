import React from "react";
import { DashboardCard } from "../layout/DashboardCard";

type SeoWidgetProps = {
  data: {
    seoScore: number;
    optimizedPages: number;
  };
};

export const SeoWidget: React.FC<SeoWidgetProps> = ({ data }) => {
  if (!data) {
    return (
      <DashboardCard title="SEO Analysis">
        <div style={{ color: "#A3AED0", padding: "20px" }}>No SEO Data Available</div>
      </DashboardCard>
    );
  }

  // تحديد اللون بناءً على الـ Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // أخضر
    if (score >= 50) return "#f59e0b"; // برتقالي
    return "#ef4444"; // أحمر
  };

  return (
    <DashboardCard title="SEO Performance">
      <div style={{ padding: "10px 0" }}>
        {/* Score Circle/Bar Section */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Overall Score</span>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: getScoreColor(data.seoScore) }}>
              {data.seoScore}%
            </span>
          </div>
          {/* Progress Bar Container */}
          <div style={{ width: "100%", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ 
              width: `${data.seoScore}%`, 
              height: "100%", 
              backgroundColor: getScoreColor(data.seoScore),
              transition: "width 1s ease-in-out" 
            }} />
          </div>
        </div>

        {/* Info Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
          <div style={{ fontSize: "20px" }}></div>
          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>OPTIMIZED PAGES</p>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>{data.optimizedPages} Pages</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};