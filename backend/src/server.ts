// server.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import express from "express";
import cors from "cors";
import path from "path";

// Import des routes
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import siteRoutes from "./modules/sites/site.routes";
import pageRoutes from "./modules/pages/page.routes";
import publicRoutes from "./modules/public/public.routes";
import mediaRoutes from "./modules/media/media.routes";
import userRoutes from "./modules/users/user.routes";
import seoRoutes from "./modules/seo/seo.routes";
import adminRoutes from "./modules/admin/admin.routes";
import aiRoutes from "./modules/ai/ai.routes";
import pluginRoutes from "./modules/plugins/plugin.routes";
import { initializeDB } from "./core/database/init";
import { tenantResolver } from "./core/middleware/tenant.middleware";
import { initContext } from "./core/middleware/context.middleware";

const app = express();
const PORT = parseInt(process.env.PORT || "10000", 10);

// --- 1. MIDDLEWARES (Toujours en premier) ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- 2. ROUTES ---

// Authentification
app.use(initContext);
app.use(tenantResolver);

app.use("/api/auth", authRoutes);


// Ressources
app.use("/api/public", publicRoutes);
app.use("/api/dashboard", dashboardRoutes);
// server.ts
app.use("/api/sites", siteRoutes);
app.use("/api", pageRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plugins",pluginRoutes);

// Health check (Un seul suffit)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- 3. DÉMARRAGE ---
const startServer = async () => {
  try {
    console.log("📡 Tentative de connexion à la base de données...");
    await initializeDB();
    console.log("✅ Base de données initialisée");
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur port ${PORT}`);
      console.log(`🔗 Route Google active sur: /api/auth/google`);
    });
  } catch (error) {
    console.error("❌ Échec du démarrage :", error);
    process.exit(1);
  }
};

startServer();