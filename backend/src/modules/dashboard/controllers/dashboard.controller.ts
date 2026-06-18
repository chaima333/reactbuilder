// src/modules/dashboard/controllers/dashboard.controller.ts
import { Response } from "express";
import { DashboardProjection } from "../projections/dashboard.projection";
import { rebuildDashboardProjection } from "../projections/dashboard.projection.builder";
import { DashboardWidgetService } from "../services/dashboard.widgets.service";

export const getDashboardFull = async (req: any, res: Response) => {
  try {
    const siteId = Number(req.params.siteId || req.query.siteId);
    const CURRENT_SCHEMA_VERSION = 2;

    console.log("-----------------------------------------");
    console.log(`📩 Request received for Site ID: ${siteId}`);

    if (!siteId || isNaN(siteId)) {
      return res.status(400).json({ success: false, message: "Invalid Site ID" });
    }

    // 1. جلب البيانات من الـ Redis
    let snapshot = await DashboardProjection.get(siteId);

    // 🛡️ التثبت من الـ Schema Version (Metadata Governance)
    if (snapshot && snapshot.meta?.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.log(`⚠️ Outdated Schema (v${snapshot.meta?.schemaVersion || 'unknown'}). Force rebuilding...`);
      snapshot = null; // نلغي الـ snapshot القديم باش يتعدى للـ Builder
    }

    // 2. إعادة البناء إذا الكاش فارغ أو النسخة قديمة
    if (!snapshot) {
      console.log("♻️ Cache Miss or Outdated. Calling Builder...");
      snapshot = await rebuildDashboardProjection(siteId);
    }

    // 3. Emergency Fallback (حالة الطوارئ)
    if (!snapshot) {
      console.log("❌ Builder returned NULL! Sending Emergency Fallback.");
      snapshot = {
        stats: { siteId, totalPages: 1, totalViews: 0, siteName: "Fallback Site" },
        signals: { totalActivities: 0, chartData: [] },
        widgets: [],
        layout: { blocks: [{ id: "stats-core", type: "stats", col: 12, order: 0 }] },
        meta: { 
          generatedAt: Date.now(), 
          siteId, 
          schemaVersion: CURRENT_SCHEMA_VERSION,
          debug: true 
        }
      };
    }

    const widgets = await DashboardWidgetService.getWidgets(
      siteId,
      { userId: req.user.id }
    );

    const coreBlocks = snapshot.layout.blocks.filter(
      (block: any) =>
        ["stats", "chart", "activity"].includes(block.type)
    );

    snapshot = {
      ...snapshot,
      widgets,
      layout: {
        ...snapshot.layout,
        blocks: [
          ...coreBlocks,
          ...widgets.map((widget: any, index: number) => ({
            id: widget.id,
            type: widget.type,
            col: widget.col || 6,
            order: widget.order ?? (100 + index),
          })),
        ].sort((a: any, b: any) => a.order - b.order),
      },
    };

    console.log("✅ Sending Synchronized Data to Frontend");
    return res.json({ success: true, data: snapshot });

  } catch (error: any) {
    console.error("❌ Controller Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
