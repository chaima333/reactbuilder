// server.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import express from "express";

import cors from "cors";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import siteRoutes from "./routes/site.routes";
import pageRoutes from "./routes/page.routes";
import publicRoutes from "./routes/public.routes";
import mediaRoutes from "./routes/media.routes";
import userRoutes from "./routes/user.routes";
import seoRoutes from "./routes/seo.routes";
import adminRoutes from "./routes/admin.routes";
import { initializeDB } from "./database/connection";

const app = express();
// Convertir PORT en nombre
const PORT = parseInt(process.env.PORT || "10000", 10);

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/sites", pageRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/admin", adminRoutes);
// server.ts
app.use("/api/pages", pageRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Démarrage serveur après initialisation DB
const startServer = async () => {
  try {
    console.log("📡 Tentative de connexion à la base de données...");
    await initializeDB();
    console.log("✅ Base de données initialisée");
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur http://0.0.0.0:${PORT}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Échec du démarrage :", error);
    process.exit(1);
  }
};

startServer();