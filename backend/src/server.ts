// backend/src/server.ts

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
import pluginMarketplaceRoutes from "./modules/plugin/plugin.marketplace.routes";
import { requireSiteAccess } from "./core/middleware/siteGuard";
import invitationRoutes from "./core/services/invitations/invitation.routes";
import partnerApplicationRoutes, { publicPartnerApplicationRoutes } from "./modules/partnerApplications/partnerApplication.routes";
import { rejectOversizedAiContentLength } from "./modules/ia/aiRequestLimits.middleware";
import chatbotPublicRoutes from "./modules/chatbot/chatbot.public.routes";
import { rejectOversizedChatbotContentLength } from "./modules/chatbot/chatbot.payloadLimit";
import platformAssistantRoutes from "./modules/platformAssistant/services/platformAssistant.routes";
import cmsRoutes from "./modules/cms/cms.routes";
import cmsPublicRoutes from "./modules/cms/cms.public.routes";

// ✅ استورد getPublicPageById
import { getPublicPageById } from "./modules/pages/controllers/page.controller";
import formsPublicRoutes from "./modules/forms/forms.public.routes";
import formsRoutes from "./modules/forms/forms.routes";
import siteVisitorAuthRoutes from "./modules/siteVisitors/siteVisitorAuth.routes";
import { attachOptionalSiteVisitorAuth } from "./modules/siteVisitors/siteVisitorAuth.middleware";

const app: Application = express();
const PORT = Number(process.env.PORT) || 10000;
const authStack = [authenticateJWT, maintenanceMode];

/* ========================
   GLOBAL MIDDLEWARE
======================== */
app.use(cors());

app.use(rejectOversizedAiContentLength);
app.use(rejectOversizedChatbotContentLength);

app.use(
  "/api/public/sites/:siteId/chatbot",
  express.json({ limit: "50kb" }),
  chatbotPublicRoutes
);

app.use(
  "/api/platform-assistant",
  authStack,
  express.json({ limit: "100kb" }),
  platformAssistantRoutes
);

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
app.use("/p/public", publicSiteRoutes);
app.use( "/api/public",formsPublicRoutes);
/* ========================
   AUTH
======================== */
app.use("/api/auth", authRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/public/sites/:siteId/partner-applications", publicPartnerApplicationRoutes);
app.use("/api/public/sites/:siteId/cms", cmsPublicRoutes);

/* ========================
   PUBLIC PAGE ROUTES (NO AUTH)
======================== */

app.get(
  "/api/sites/:siteId/pages/:pageId/public",
  attachOptionalSiteVisitorAuth,
  getPublicPageById
);
app.use(
  "/api/public/sites/:siteId/visitor-auth",
  siteVisitorAuthRoutes
);

/* ========================
   GLOBAL (IMPORTANT FIX)
======================== */
app.use("/api/invitations", authStack, invitationRoutes);
app.use("/api/sites", authStack, siteRoutes);

/* ========================
   TENANT ROUTES (SaaS CORE)
======================== */
const tenantStack = [authenticateJWT, maintenanceMode, tenantResolver, requireSiteAccess];
app.use("/api/sites/:siteId/dashboard", tenantStack, dashboardRoutes);
app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/partner-applications", tenantStack, partnerApplicationRoutes);
app.use("/api/sites/:siteId/import", tenantStack, importRoutes);
app.use("/api/sites/:siteId/cms", tenantStack, cmsRoutes);
app.use("/api/figma-plugin", figmaPluginRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sites/:siteId/ia", tenantStack, iaRoutes);
app.use("/api/ai/assistant", authStack, assistantRoutes);
app.use("/api/sites/:siteId/forms", authStack,formsRoutes);

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
app.use("/api/sites/:siteId/commands", tenantStack, commandRoutes);
app.use("/api/sites/:siteId/plugins", tenantStack, pluginMarketplaceRoutes);

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