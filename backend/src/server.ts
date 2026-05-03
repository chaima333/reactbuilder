import * as dotenv from "dotenv";
dotenv.config();

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

// CORE
import { bootstrapPlugins } from "./app.bootstrap";
import { cmsRegistry } from "./core/plugins/plugin.registry";
import { initPluginWorker } from "./core/queues/plugin.worker";
import commandRoutes from "./modules/dashboard/commands/command.routes";
import { registerCommands } from "./core/commands/register";

const app: Application = express();
const PORT = Number(process.env.PORT) || 10000;

/* ========================
   GLOBAL MIDDLEWARE
======================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/", publicRoutes);

/* ========================
   AUTH
======================== */
app.use("/api/auth", authRoutes);

/* ========================
   GLOBAL (IMPORTANT FIX 🔥)
   => THIS WAS MISSING (ROOT CAUSE OF 404)
======================== */
const authStack = [authenticateJWT];
app.use("/api/sites", authStack, siteRoutes);

/* ========================
   TENANT ROUTES (SaaS CORE)
======================== */
const tenantStack = [authenticateJWT, tenantResolver];
app.use("/api/sites/:siteId/dashboard", authenticateJWT, dashboardRoutes);
app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);

/* ========================
   ADMIN / USERS
======================== */
app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);

/* ========================
   COMMANDS / PLUGINS
======================== */
registerCommands();
app.use("/api/command", authStack, commandRoutes);

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
    await sequelize.authenticate();

    bootstrapPlugins();
    console.log("✅ Plugins loaded:", cmsRegistry.getPlugins());

    initPluginWorker();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup error:", err);
  }
};

startServer();