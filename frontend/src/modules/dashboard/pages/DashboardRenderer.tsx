import React from "react";
import { pluginRegistry } from "../registry/widget.registry";
import { DashboardFullResponse, DashboardBlock } from "../types/dashboard.types";

interface Props {
  layout: { blocks: DashboardBlock[] };
  context: DashboardFullResponse;
}

/**
 * DashboardRenderer
 * مسؤول عن تحويل الـ Layout JSON إلى مكونات React فعلية.
 * يربط بين الـ Block (مكان العرض) والـ Widget Instance (البيانات).
 */
export default function DashboardRenderer({ layout, context }: Props) {
  // 1. حماية في حالة غياب الـ Blocks
  if (!layout?.blocks || !Array.isArray(layout.blocks)) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        No dashboard layout configuration found.
      </div>
    );
  }

  // 2. إصلاح مشكلة Read-only: نصنع نسخة جديدة قبل الترتيب
  const sortedBlocks = [...layout.blocks].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "24px",
      }}
    >
      {sortedBlocks.map((block) => {
        // 3. جلب الـ Component من الـ Registry بناءً على الـ type
        const Component = pluginRegistry[block.type];

        if (!Component) {
          return (
            <div 
              key={block.id} 
              style={{ gridColumn: `span ${block.col || 12}`, color: "orange" }}
            >
              ⚠️ Missing Plugin: {block.type}
            </div>
          );
        }

        
        const widgetInstance = context.widgets?.find(
          (w: any) => w.id === block.id
        );

        return (
          <div
            key={block.id}
            style={{
              gridColumn: `span ${block.col || 12}`,
            }}
          >
            {/* 5. تمرير البيانات للـ Widget */}
            <Component
              stats={context.stats}
              signals={context.signals}
              // نمرر الـ payload الخاص بهذا الـ ID بالظبط
              data={widgetInstance?.payload}
            />
          </div>
        );
      })}
    </div>
  );
}