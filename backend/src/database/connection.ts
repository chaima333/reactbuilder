import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Token } from "../models/token";
import { Page } from "../models/page";
import { Site } from "../models/site";
import { ActivityLog } from "../models/activityLog";
import { Media } from "../models/media";
import { Seo } from "../models/Seo";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Erreur : DATABASE_URL manquante !");
  process.exit(1);
}

console.log("DATABASE_URL:", databaseUrl);


export const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
  models: [User, Token, Page, Site, ActivityLog, Media, Seo],

  dialectOptions: {
  ssl: process.env.NODE_ENV === "production" ? {
    require: true,
    rejectUnauthorized: false, // هذي تسمح بقبول self-signed
  } : false
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