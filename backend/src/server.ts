import * as dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
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
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import adminRoutes from "./modules/admin/admin.routes";
import pluginRoutes from "./modules/plugins/plugin.routes";
import pageRoutes from "./modules/pages/routes/page.routes";
import publicRoutes from "./modules/pages/routes/public.routes";

const app: Application = express();
const PORT = Number(process.env.PORT) || 10000;

// ========================
// 1. GLOBAL MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ========================
// 2. HEALTH CHECK & PUBLIC LAYER
// ========================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 🔥 PUBLIC ROUTES (Redirects & Public Pages)
// لازم تكون الفوق باش Express يلقاها طول قبل الـ Auth
app.use("/", publicRoutes); 

// AUTHENTICATION
app.use("/api/auth", authRoutes);

// ========================
// 3. PRIVATE LAYER (AUTH REQUIRED)
// ========================
const authStack = [authenticateJWT];

app.use("/api/users", authStack, userRoutes);
app.use("/api/admin", authStack, adminRoutes);
app.use("/api/dashboard", authStack, dashboardRoutes);

// ========================
// 4. TENANT LAYER (AUTH + SITE_ID REQUIRED)
// ========================
const tenantStack = [authenticateJWT, tenantResolver];

app.use("/api/sites/:siteId/pages", tenantStack, pageRoutes);
app.use("/api/sites/:siteId/media", tenantStack, mediaRoutes);
app.use("/api/sites/:siteId/plugins", tenantStack, pluginRoutes);
app.use("/api/sites/:siteId/settings", tenantStack, siteRoutes);

// ========================
// 5. 404 & ERROR HANDLING
// ========================
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ========================
// 6. START SERVER
// ========================
const startServer = async () => {
  try {
    // تأكد من الاتصال بالقاعدة قبل التشغيل
    await sequelize.authenticate();
    console.log("✅ DB Connection: OK");

    // Sync models if needed (Optional)
    // await sequelize.sync({ alter: false });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Node Server running on port ${PORT}`);
      console.log(`🌍 Public Access: http://localhost:${PORT}/pages/:siteId/:slug`);
    });
  } catch (err) {
    console.error("❌ DB Error:", err);
    process.exit(1);
  }
};

startServer();