import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { initializeDB } from "./database/index"; 
import siteRoutes from "./routes/site.routes";
import pageRoutes from "./routes/page.routes";
import publicRoutes from "./routes/public.routes";
import mediaRoutes from "./routes/media.routes";
import userRoutes from "./routes/user.routes";
import seoRoutes from "./routes/seo.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/dashboard", dashboardRoutes); 
app.use('/api/sites', siteRoutes);
app.use('/api/sites', pageRoutes);
app.use('/api/public', publicRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/uploads', express.static('uploads')); // Servir les fichiers statiques
app.use('/api/users', userRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/admin', adminRoutes);



// Route test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Démarrage serveur après initialisation DB
const startServer = async () => {
  await initializeDB(); // ✅ on initialise la DB ici

  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();