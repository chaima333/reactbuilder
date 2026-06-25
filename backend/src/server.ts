import * as dotenv from "dotenv";
dotenv.config();

console.log(
  "FIGMA TOKEN:",
  process.env.FIGMA_ACCESS_TOKEN
    ? "FOUND"
    : "NOT FOUND"
);

import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";

// DB
import { sequelize } from "./core/database/connection";

// AUTH + TENANT
import { authenticateJWT } from "./shared/auth.util";
import { tenantResolver } from "./core/middleware/tenantResolver";

// ROUTES
import authRoutes from "./modules/auth/auth.routes";
import siteRoutes from "./modules/sites/site.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import pageRoutes from "./modules/pages/routes/page.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import adminRoutes from "./modules/admin/admin.routes";
import publicRoutes from "./modules/pages/routes/public.routes";
import platformRoutes from "./modules/platform/platform.routes";

// CORE
import { bootstrapPlugins } from "./app.bootstrap";
import { initPluginWorker } from "./core/queues/plugin.worker";
import commandRoutes from "./modules/dashboard/commands/command.routes";
import { registerCommands } from "./core/commands/register";
import publicSiteRoutes from "./modules/sites/publicSite.routes";
import importRoutes from "./modules/import/import.routes";
import figmaPluginRoutes from "./modules/figmaPlugin/figmaPlugin.routes";
import { maintenanceMode } from "./core/middleware/maintenance";
import notificationRoutes from "./modules/notifications/notification.routes";
import iaRoutes from "./modules/ia/ai.routes";
import exportRoutes from "./modules/export/export.routes";
import assistantRoutes from "./modules/ia/assistant/assistant.routes";
const app: Application = express();
const PORT = Number(process.env.PORT) || 10000;

/* ========================
   GLOBAL MIDDLEWARE
======================== */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ========================
   HEALTH CHECK
======================== */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

/* ========================
   PUBLIC ROUTES
======================== */
app.use("/p", publicRoutes);
app.use("/p/public",publicSiteRoutes);
/* ========================
   AUTH
======================== */
app.use("/api/auth", authRoutes);
app.use("/api/platform", platformRoutes);

/* ========================
   GLOBAL (IMPORTANT FIX 🔥)
   => THIS WAS MISSING (ROOT CAUSE OF 404)
======================== */
const authStack = [authenticateJWT, maintenanceMode];
app.use("/api/sites", authStack, siteRoutes);

/* ========================
   TENANT ROUTES (SaaS CORE)
======================== */
const tenantStack = [authenticateJWT, maintenanceMode, tenantResolver];
app.use("/api/sites/:siteId/dashboard", authenticateJWT, maintenanceMode, dashboardRoutes);
app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/import",tenantStack,importRoutes);
app.use("/api/figma-plugin", figmaPluginRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sites/:siteId/ia", tenantStack, iaRoutes);
app.use("/api/ai/assistant", authStack, assistantRoutes);
/* ========================
   ADMIN / USERS
======================== */
app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/export", exportRoutes);

/* ========================
   COMMANDS / PLUGINS
======================== */

registerCommands();
app.use("/api/sites/:siteId/commands", authenticateJWT, maintenanceMode, commandRoutes);

/* ========================
   404 HANDLER
======================== */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ========================
   START SERVER
======================== */
const startServer = async () => {
  try {
    // 1. DB
    await sequelize.authenticate();
    console.log("🗄️ Database connected.");

    // 2. Plugins system
    await bootstrapPlugins();
    initPluginWorker();
    console.log("✅ Plugins & Workers ready.");

    // 3. Event listeners (IMPORTANT)
    console.log("📡 Dashboard listener registered.");

    // 4. Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup error:", err);
  }
};

startServer();
