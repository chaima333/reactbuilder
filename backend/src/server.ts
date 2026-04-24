import * as dotenv from "dotenv";
dotenv.config();

// 1. 🔥 الـ Imports الأساسية للـ Plugins والـ Queue
import { cmsRegistry } from "./core/plugins/plugin.registry"; 
import { initPluginWorker } from "./core/queues/plugin.worker"; // الـ Worker اللي صنعناه

import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";

// CORE & DB
import { sequelize } from "./core/database/connection";
import { authenticateJWT } from "./shared/auth.util";
import { tenantResolver } from "./core/middleware/tenantResolver";

// ROUTES (تقعد كيف ما هيّ)
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import siteRoutes from "./modules/sites/site.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import adminRoutes from "./modules/admin/admin.routes";
import pageRoutes from "./modules/pages/routes/page.routes";
import publicRoutes from "./modules/pages/routes/public.routes";

const app: Application = express();
const PORT = Number(process.env.PORT) || 10000;

// ========================
// GLOBAL MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ========================
// ROUTES MAPPING
// ========================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/", publicRoutes); 
app.use("/api/auth", authRoutes);

const authStack = [authenticateJWT];
app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);
app.use("/api/dashboard", authStack, dashboardRoutes);

const tenantStack = [authenticateJWT, tenantResolver];
app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/settings", tenantStack, siteRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ========================
// 🚀 START SERVER LOGIC
// ========================
const startServer = async () => {
  try {
    // 1. التأكد من اتصال الداتابيز
    await sequelize.authenticate();
    console.log("✅ DB Connection: OK");

    // 2. 🔥 تفعيل الـ Plugins (Initialization)
    // الـ Registry توّة باش يركّب الـ SEO والـ Versioning والـ Notification
    cmsRegistry.init();
    console.log("🔌 Active Event Listeners:", cmsRegistry.eventBus.eventNames());

    // 3. 👷 تفعيل الـ Background Worker (BullMQ)
    // السيرفر توّة يبدأ يسمع للـ Redis ويخدم الـ Tasks اللي في الـ Queue
    initPluginWorker();
    console.log("👷 Background Worker: Active & Listening to Redis");

    // 4. ديماري السيرفر
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Node Server running on port ${PORT}`);
      console.log(`🌍 Public Access: http://localhost:${PORT}/pages/:siteId/:slug`);
    });

  } catch (err) {
    console.error("❌ Bootstrap Error:", err);
    process.exit(1);
  }
};

startServer();