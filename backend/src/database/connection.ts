import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import { User } from "../models/User";
import { Token } from "../models/token";
import { ActivityLog, Media, Page, Seo, Site } from "../models";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
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