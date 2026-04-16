import { Sequelize } from "sequelize-typescript";
import { User, Token, Page, Site, ActivityLog, Media } from "../../models"; // تأكد من الـ index.ts في models
import { Seo } from "../../models/Seo";
import { Plugin } from "../../models/Plugin";
import { SiteMember } from "../../models/SiteMember";
import { SitePlugin } from "../../models/SitePlugin";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL manquante");
  process.exit(1);
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
  
  // استعمل الأسماء المباشرة للموديلات توة
  models: [
    User,
    Token,
    Page,
    Site,
    ActivityLog,
    Media,
    Seo,
    Plugin,
    SiteMember,
    SitePlugin,
  ],

  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},

  protocol: "postgres",
  native: false,
});