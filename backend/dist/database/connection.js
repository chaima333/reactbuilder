"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("../models/User");
const token_1 = require("../models/token");
const page_1 = require("../models/page");
const site_1 = require("../models/site");
const activityLog_1 = require("../models/activityLog");
const media_1 = require("../models/media");
const Seo_1 = require("../models/Seo");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("❌ Erreur : DATABASE_URL manquante !");
    process.exit(1);
}
console.log("DATABASE_URL:", databaseUrl);
exports.sequelize = new sequelize_typescript_1.Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    models: [User_1.User, token_1.Token, page_1.Page, site_1.Site, activityLog_1.ActivityLog, media_1.Media, Seo_1.Seo],
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    ssl: true,
});
const initializeDB = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log("✅ Connexion à PostgreSQL établie");
        await exports.sequelize.sync({ alter: true });
        console.log("✅ Modèles synchronisés");
    }
    catch (error) {
        console.error("❌ Erreur Sequelize:", error);
        process.exit(1);
    }
};
exports.initializeDB = initializeDB;
