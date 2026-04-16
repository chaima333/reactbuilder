import { Sequelize } from "sequelize-typescript";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL manquante");
  process.exit(1);
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,

  models: [
    require("../../modules/users/User").User,
    require("../../models/token").Token,
    require("../../models/page").Page,
    require("../../models/site").Site,
    require("../../models/activityLog").ActivityLog,
    require("../../models/media").Media,
    require("../../models/Seo").Seo,
    require("../../models/Plugin").Plugin,
    require("../../models/SiteMember").SiteMember,
    require("../../models/SitePlugin").SitePlugin,
  ],

  dialectOptions: process.env.NODE_ENV === "production"
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