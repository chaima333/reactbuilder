import React from "react";
import { DashboardCard } from "../layout/DashboardCard";

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

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ signals }) => {
  if (!signals || !signals.lastActivity) {
    return (
      <DashboardCard title="Recent Activity">
        <div style={{ color: "#A3AED0", padding: "20px", textAlign: "center" }}>
          ☕ No recent pulses detected.
        </div>
      </DashboardCard>
    );
  }

  // دالة لتلوين الـ Action بناءً على نوعها
  const getActionStyle = (action: string) => {
    if (action.includes('updated')) return { color: "#3b82f6", bg: "#eff6ff", label: "Update" };
    if (action.includes('created')) return { color: "#10b981", bg: "#ecfdf5", label: "New" };
    if (action.includes('deleted')) return { color: "#ef4444", bg: "#fef2f2", label: "Delete" };
    return { color: "#64748b", bg: "#f8fafc", label: "Action" };
  };

  const style = getActionStyle(signals.lastActivity.action);

  return (
    <DashboardCard title="Recent Activity">
      <div style={{ padding: "5px 0" }}>
        {/* Total Badge */}
        <div style={{ 
          display: "inline-block", 
          padding: "4px 12px", 
          backgroundColor: "#f1f5f9", 
          borderRadius: "20px", 
          fontSize: "11px", 
          fontWeight: 700, 
          color: "#475569",
          marginBottom: "20px"
        }}>
          {signals.totalActivities} TOTAL EVENTS
        </div>

        {/* Timeline Item */}
        <div style={{ position: "relative", paddingLeft: "30px", borderLeft: "2px solid #f1f5f9", marginLeft: "10px" }}>
          {/* Timeline Dot */}
          <div style={{ 
            position: "absolute", 
            left: "-7px", 
            top: "0", 
            width: "12px", 
            height: "12px", 
            borderRadius: "50%", 
            backgroundColor: style.color,
            border: "3px solid white",
            boxShadow: "0 0 0 1px #f1f5f9"
          }} />

          <div style={{ marginBottom: "5px" }}>
            <span style={{ 
              fontSize: "10px", 
              fontWeight: 800, 
              textTransform: "uppercase", 
              color: style.color, 
              backgroundColor: style.bg,
              padding: "2px 8px",
              borderRadius: "4px",
              marginRight: "8px"
            }}>
              {style.label}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {new Date(signals.lastActivity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
            {signals.lastActivity.action.replace(/_/g, ' ')}
          </p>
          
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            Activity logged via system pulse.
          </p>
        </div>

        {/* Top Pages Shortcut (Optional Visual) */}
        {signals.topPages?.length > 0 && (
          <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px dashed #e2e8f0" }}>
             <p style={{ margin: "0 0 10px 0", fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>TOP ACTIVE PAGES</p>
             {signals.topPages.slice(0, 2).map((page: any) => (
               <div key={page.id} style={{ fontSize: "13px", color: "#475569", marginBottom: "5px", display: "flex", alignItems: "center" }}>
                 <span style={{ marginRight: "8px" }}>📄</span> {page.title}
               </div>
             ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};