import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// CORE & DB
import { sequelize } from "./core/database/connection";
import { authenticateJWT } from "./shared/auth.util";
import { tenantResolver } from "./core/middleware/tenantResolver";

// ROUTES
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import siteRoutes from "./modules/sites/site.routes";
//import publicRoutes from "./modules/public/public.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import adminRoutes from "./modules/admin/admin.routes";
import pluginRoutes from "./modules/plugins/plugin.routes";
import pageRoutes from "./modules/pages/routes/page.routes";

import { getPublicPage } from "./modules/pages/controllers/page.controller";

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// ========================
// GLOBAL MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ========================
// PUBLIC LAYER
// ========================
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);

app.get("/api/v2/magic-page/:siteId/:slug", getPublicPage);

// legacy public route
//app.use("/api/public", publicRoutes);

import publicRoutes from "./modules/pages/routes/public.routes";

app.use("/", publicRoutes);

// ========================
// PRIVATE LAYER (AUTH ONLY)
// ========================
const authStack = [authenticateJWT];

app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);
app.use("/api/dashboard", authStack, dashboardRoutes);

// ========================
// TENANT LAYER (IMPORTANT FIX)
// ========================

// ⚠️ FIX: tenantResolver لازم يكون هنا قبل pages
const tenantStack = [authenticateJWT, tenantResolver];

app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/plugins", tenantStack, pluginRoutes);
app.use("/api/sites/:siteId/settings", tenantStack, siteRoutes);

// ========================
// START SERVER
// ========================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connection: OK");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Node Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Error:", err);
    process.exit(1);
  }
};

startServer();