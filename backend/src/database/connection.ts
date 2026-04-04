import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import { User } from "../models/User";
import { Token } from "../models/token";
import { ActivityLog, Media, Page, Seo, Site } from "../models";

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: console.log,
  models: [User, Token, Page, Site, ActivityLog, Media, Seo],
  dialectOptions: {
    ssl: {
      require: true,          // ✅ Obligatoire pour Supabase
      rejectUnauthorized: false, // ✅ Ignore les certificats auto-signés
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