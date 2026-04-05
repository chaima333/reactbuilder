import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Token } from "../models/token";
import { ActivityLog, Media, Page, Seo, Site } from "../models";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Erreur : DATABASE_URL manquante !");
  process.exit(1);
}

// Forcer Sequelize à utiliser l'IPv4 (évite les timeouts sur IPv6)
const modifiedDatabaseUrl = databaseUrl.replace(/\[.*\]/, "197.11.135.47");

export const sequelize = new Sequelize(modifiedDatabaseUrl, {
  dialect: "postgres",
  logging: false,
  models: [User, Token, Page, Site, ActivityLog, Media, Seo],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à PostgreSQL établie");
    await sequelize.sync({ alter: true });
    console.log("✅ Modèles synchronisés");
  } catch (error) {
    console.error("❌ Erreur Sequelize:", error);
    process.exit(1);
  }
};