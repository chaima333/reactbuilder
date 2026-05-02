// src/modules/dashboard/components/widgets/MediaWidget.tsx
import React from "react";
import { DashboardContext } from "./types";

export const MediaWidget: React.FC<DashboardContext> = ({ plugins, loading }) => {
  if (loading.global) return <div>Loading media...</div>;

  const mediaItems = plugins?.media?.items || [];

  return (
    <div className="media-widget">
      <h3>Assets ({plugins?.media?.totalFiles || 0})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
        {mediaItems.map((m: any) => (
          <div key={m.id} className="asset-item">
            {/* 1. Logic حسب الـ Type اللي جاي من الـ Backend */}
            {m.type === "image" && (
              <img src={m.url} width="100%" height="100" style={{ objectFit: 'cover' }} alt={m.alt} />
            )}

            {m.type === "video" && (
              <video width="100%" height="100" style={{ backgroundColor: '#000' }}>
                <source src={m.url} type="video/mp4" />
              </video>
            )}

            {m.type === "file" && (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                📄 {m.originalName.split('.').pop()}
              </div>
            )}
            
            <span style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>
              {m.originalName.length > 10 ? m.originalName.substring(0, 10) + '...' : m.originalName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};