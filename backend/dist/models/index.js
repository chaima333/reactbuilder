"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seo = exports.Media = exports.ActivityLog = exports.Site = exports.Page = exports.Token = exports.User = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const token_1 = require("./token");
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return token_1.Token; } });
const page_1 = require("./page");
Object.defineProperty(exports, "Page", { enumerable: true, get: function () { return page_1.Page; } });
const site_1 = require("./site");
Object.defineProperty(exports, "Site", { enumerable: true, get: function () { return site_1.Site; } });
const activityLog_1 = require("./activityLog");
Object.defineProperty(exports, "ActivityLog", { enumerable: true, get: function () { return activityLog_1.ActivityLog; } });
const media_1 = require("./media");
Object.defineProperty(exports, "Media", { enumerable: true, get: function () { return media_1.Media; } });
const Seo_1 = require("./Seo");
Object.defineProperty(exports, "Seo", { enumerable: true, get: function () { return Seo_1.Seo; } });
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    models: [User_1.User, token_1.Token, page_1.Page, site_1.Site, activityLog_1.ActivityLog, media_1.Media, Seo_1.Seo],
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.sequelize = sequelize;
