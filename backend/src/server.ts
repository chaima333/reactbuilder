import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// =====================
// ROUTES
// =====================
const authRoutes = require("./modules/auth/auth.routes").default;
const dashboardRoutes = require("./modules/dashboard/dashboard.routes").default;
const siteRoutes = require("./modules/sites/site.routes").default;
const publicRoutes = require("./modules/public/public.routes").default;
const mediaRoutes = require("./modules/media/media.routes").default;
const userRoutes = require("./modules/users/user.routes").default;
const seoRoutes = require("./modules/seo/seo.routes").default;
const adminRoutes = require("./modules/admin/admin.routes").default;
const aiRoutes = require("./modules/ai/ai.routes").default;
const pluginRoutes = require("./modules/plugins/plugin.routes").default;
const pageRoutes = require("./modules/pages/page.routes").default;

// =====================
// CORE
// =====================
import { initializeDB } from "./core/database/init";
import { authenticateJWT } from "./shared/auth.util";
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
// DEBUG LOGGER (optional but useful)
// =====================
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// =====================
// PUBLIC ROUTES
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// =====================
// PROTECTED STACK (IMPORTANT RULE)
// order: auth → tenant → routes
// =====================
const protectedStack = [authenticateJWT, tenantResolver];

// =====================
// PROTECTED ROUTES
// =====================
app.use("/api/pages", ...protectedStack, pageRoutes);
app.use("/api/sites", ...protectedStack, siteRoutes);
app.use("/api/dashboard", ...protectedStack, dashboardRoutes);
app.use("/api/media", ...protectedStack, mediaRoutes);
app.use("/api/users", ...protectedStack, userRoutes);
app.use("/api/seo", ...protectedStack, seoRoutes);
app.use("/api/admin", ...protectedStack, adminRoutes);
app.use("/api/ai", ...protectedStack, aiRoutes);
app.use("/api/plugins", ...protectedStack, pluginRoutes);

// =====================
// START SERVER
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