import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// CORE & DB
import { sequelize } from "./core/database/connection"; // استورد الـ instance مباشرة
import { authenticateJWT } from "./shared/auth.util";
import { tenantResolver } from "./core/middleware/tenantResolver";
import { initContext } from "./core/middleware/context.middleware";

// ROUTES (استعمل الـ Import العادي باش الـ Typescript يفهم الـ Default exports)
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import siteRoutes from "./modules/sites/site.routes";
import publicRoutes from "./modules/public/public.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import seoRoutes from "./modules/seo/seo.routes";
import adminRoutes from "./modules/admin/admin.routes";
import pluginRoutes from "./modules/plugins/plugin.routes";
import pageRoutes from "./modules/pages/page.routes";
import { getPublicPage } from "./modules/pages/page.controller";

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(initContext);

// PUBLIC ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// PRIVATE ROUTES
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/admin", authenticateJWT, adminRoutes);
app.use("/api/sites/:siteId/pages", pageRoutes);

app.use("/api/public/pages", pageRoutes);
app.use("/api/sites/:siteId/pages", pageRoutes);
app.get("/api/v2/magic-redirect/:siteId/:slug", getPublicPage);

app.use("/api/dashboard", authenticateJWT, dashboardRoutes);


// TENANT ROUTES
const tenantStack = [authenticateJWT, tenantResolver];
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/seo", tenantStack, seoRoutes);
app.use("/api/sites/:siteId/plugins", tenantStack, pluginRoutes);

// START SERVER
const startServer = async () => {
  try {
    // 1. تثبت من الربط فقط (Ping)
    await sequelize.authenticate();
    console.log("✅ DB Connection: OK (Authenticity Verified)");

    // 2. ممنوع منعا باتا وجود sequelize.sync() هنا! 
    // الـ Migrations تتصب في الـ Deployment Pipeline (Render/Railway) 
    // قبل ما السيرفر يبدأ الـ Listen

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Node Server: Operational on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical: Database Authentication Failed", err);
    process.exit(1);
  }
};

startServer();