import { Sequelize } from "sequelize-typescript";
import { User } from "./User";
import { Token } from "./token";
import { Page } from "./page";
import { Site } from "./site";
import { ActivityLog } from "./activityLog";
import { Media } from "./media";
import { Seo } from "./Seo";
import { SitePlugin } from "./SitePlugin";
import Plugin from "./Plugin";
import { SiteMember } from "./SiteMember";
import PageVersion from "./pageVersion"; 
import PageSlug from "./pageSlug"; 

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  models: [
    User, Token, Page, Site, ActivityLog, Media, 
    Seo, Plugin, SitePlugin, SiteMember, 
    PageVersion, PageSlug 
  ],
  logging: false,
});

export { 
  sequelize, User, Token, Page, Site, 
  ActivityLog, Media, Seo, Plugin, 
  SitePlugin, SiteMember, PageVersion, PageSlug 
};