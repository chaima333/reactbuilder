import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import siteRoutes from "./modules/sites/site.routes";
import publicRoutes from "./modules/public/public.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import seoRoutes from "./modules/seo/seo.routes";
import adminRoutes from "./modules/admin/admin.routes";
import aiRoutes from "./modules/ai/ai.routes";
import pluginRoutes, { authenticateJWT } from "./modules/plugins/plugin.routes";
import pageRoutes from "./modules/pages/page.routes";

// Core
import { initializeDB } from "./core/database/init";
import { tenantResolver } from "./core/middleware/tenant.middleware";
import { initContext } from "./core/middleware/context.middleware";

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// =====================
// GLOBAL MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(initContext);

// =====================
// PUBLIC ROUTES (NO AUTH)
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// =====================
// LOGGING (DEBUG ONLY)
// =====================
app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

// =====================
// PROTECTED MIDDLEWARE (APPLY ONLY AFTER)
// =====================
app.use(authenticateJWT);
app.use(tenantResolver);

// =====================
// PROTECTED ROUTES
// =====================
app.use("/api/pages", pageRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plugins", pluginRoutes);

// =====================
// DB + SERVER START
// =====================
const startServer = async () => {
  try {
    console.log("📡 Connecting DB...");
    await initializeDB();
    console.log("✅ DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err);
    process.exit(1);
  }
};

startServer();