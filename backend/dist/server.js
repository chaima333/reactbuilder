"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: ".env" });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const site_routes_1 = __importDefault(require("./routes/site.routes"));
const page_routes_1 = __importDefault(require("./routes/page.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const connection_1 = require("./database/connection"); // correct
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/sites", site_routes_1.default);
app.use("/api/sites", page_routes_1.default);
app.use("/api/public", public_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/media", media_routes_1.default);
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/users", user_routes_1.default);
app.use("/api/seo", seo_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Démarrage serveur après initialisation DB
const startServer = async () => {
    try {
        await (0, connection_1.initializeDB)(); // ✅ Init DB avant tout
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error("❌ Échec du démarrage :", error);
        process.exit(1);
    }
};
startServer();
