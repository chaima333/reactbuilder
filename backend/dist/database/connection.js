"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("../models/User");
const token_1 = require("../models/token");
const models_1 = require("../models");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("❌ Erreur : DATABASE_URL manquante !");
    process.exit(1);
}
// Forcer Sequelize à utiliser l'IPv4 (évite les timeouts sur IPv6)
const modifiedDatabaseUrl = databaseUrl.replace(/\[.*\]/, "197.11.135.47");
exports.sequelize = new sequelize_typescript_1.Sequelize(modifiedDatabaseUrl, {
    dialect: "postgres",
    logging: false,
    models: [User_1.User, token_1.Token, models_1.Page, models_1.Site, models_1.ActivityLog, models_1.Media, models_1.Seo],
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
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
