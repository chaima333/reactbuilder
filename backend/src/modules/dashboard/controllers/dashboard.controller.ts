// src/modules/dashboard/controllers/dashboard.controller.ts
import { Response } from "express";
import { DashboardProjection } from "../projections/dashboard.projection";
import { rebuildDashboardProjection } from "../projections/dashboard.projection.builder";

// src/modules/dashboard/controllers/dashboard.controller.ts

export const getDashboardFull = async (req: any, res: Response) => {
  try {
    const siteId = Number(req.params.siteId || req.query.siteId);
    console.log("-----------------------------------------");
    console.log(`📩 Request received for Site ID: ${siteId}`);

    // 1. جرب جيب من الـ Redis
    let snapshot = await DashboardProjection.get(siteId);

    if (!snapshot) {
      console.log("♻️ Cache Miss. Calling Builder...");
      snapshot = await rebuildDashboardProjection(siteId);
    }

    // 2. إذا الـ Builder رجع null، اصنع "Fake Data" وقتية باش تتأكد إنو المشكلة في الـ Builder
    if (!snapshot) {
      console.log("❌ Builder returned NULL! Sending Emergency Fallback.");
      snapshot = {
        stats: { siteName: "Debug Site", totalPages: 1 },
        signals: { totalActivities: 0, chartData: [] },
        layout: { blocks: [{ id: "stats-core", type: "stats", col: 12, order: 0 }] },
        meta: { generatedAt: Date.now(), debug: true }
      };
    }

    console.log("✅ Sending Data to Frontend");
    return res.json({ success: true, data: snapshot });

  } catch (error: any) {
    console.error("❌ Controller Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};