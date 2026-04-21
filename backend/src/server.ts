import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// CORE & DB
import { sequelize } from "./core/database/connection";
import { authenticateJWT } from "./shared/auth.util";
import { tenantResolver } from "./core/middleware/tenantResolver";
import { initContext } from "./core/middleware/context.middleware";

// ROUTES
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

// --- 1. GLOBAL MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(initContext);

// --- 2. 🌍 PUBLIC LAYER (Strictly No Auth) ---
// ⚠️ القاعدة الذهبية: الـ Routes الخاصّة (Specific) لازم تجي قبل الـ Router العام
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);

// ✅ الضربة القاضية: نحطو الـ Redirect Route "قبل" الـ publicRoutes
app.get("/api/public/pages/:siteId/:slug", getPublicPage);


// الـ Router هذا توّة باش يشد كان الـ /sites/ فقط
app.use("/api/public", publicRoutes);


// --- 3. 🔒 PRIVATE LAYER (JWT Required) ---
// باش نمنعو أي تداخل، نستعملو Middleware واحد يحمي الـ Block كامل
const authStack = [authenticateJWT];

app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);
app.use("/api/dashboard", authStack, dashboardRoutes);
app.use("/api/sites/:siteId/pages", authStack, pageRoutes);


// --- 4. 🏢 TENANT LAYER ---
const tenantStack = [authenticateJWT, tenantResolver];
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/seo", tenantStack, seoRoutes);
app.use("/api/sites/:siteId/plugins", tenantStack, pluginRoutes);
app.use("/api/sites/:siteId/settings", tenantStack, siteRoutes);


// --- START SERVER ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connection: OK");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Node Server: Operational on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical: Database Authentication Failed", err);
    process.exit(1);
  }
};

startServer();