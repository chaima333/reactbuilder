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

import { getPublicPage } from "./modules/pages/controllers/page.controller";
import { SlugResolver } from "./modules/pages/services/slugResolver.service";

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// ========================
// GLOBAL MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
//app.use(initContext);
app.use("/api/sites/:siteId", initContext);
// ========================
// PUBLIC LAYER
// ========================
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);

// 🟢 SEO MAGIC ROUTE (slug system)
app.get("/api/v2/magic-page/:siteId/:slug", async (req, res) => {
  console.log("🚀 ROUTE HIT:", req.params);

  const result = await SlugResolver.resolve(
    Number(req.params.siteId),
    req.params.slug
  );

  console.log("🧠 RESULT:", result);

  if (result.type === "page") {
    return res.json({ success: true, data: result.data });
  }

  if (result.type === "redirect") {
    console.log("🔀 REDIRECTING...");
    return res.redirect(
      301,
      `/api/v2/magic-page/${req.params.siteId}/${result.to}`
    );
  }

  return res.status(404).json({ success: false });
});

// legacy public route (optional)
app.get("/api/public/pages/:siteId/:slug", getPublicPage);
app.use("/api/public", publicRoutes);

// ========================
// PRIVATE LAYER
// ========================
const authStack = [authenticateJWT];

app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);
app.use("/api/dashboard", authStack, dashboardRoutes);
app.use("/api/sites/:siteId/pages", authStack, pageRoutes);

// ========================
// TENANT LAYER
// ========================
const tenantStack = [authenticateJWT, tenantResolver];

app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/seo", tenantStack, seoRoutes);
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