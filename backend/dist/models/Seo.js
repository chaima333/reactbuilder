"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seo = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const page_1 = require("./page");
const site_1 = require("./site");
let Seo = class Seo extends sequelize_typescript_1.Model {
};
exports.Seo = Seo;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    }),
    __metadata("design:type", Number)
], Seo.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => page_1.Page),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'page_id',
    }),
    __metadata("design:type", Number)
], Seo.prototype, "pageId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => page_1.Page),
    __metadata("design:type", page_1.Page)
], Seo.prototype, "page", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => site_1.Site),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'site_id',
    }),
    __metadata("design:type", Number)
], Seo.prototype, "siteId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => site_1.Site),
    __metadata("design:type", site_1.Site)
], Seo.prototype, "site", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'meta_title',
    }),
    __metadata("design:type", String)
], Seo.prototype, "metaTitle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'meta_description',
    }),
    __metadata("design:type", String)
], Seo.prototype, "metaDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'meta_keywords',
    }),
    __metadata("design:type", String)
], Seo.prototype, "metaKeywords", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        defaultValue: 'index,follow',
        field: 'meta_robots',
    }),
    __metadata("design:type", String)
], Seo.prototype, "metaRobots", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: true,
        field: 'canonical_url',
    }),
    __metadata("design:type", String)
], Seo.prototype, "canonicalUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'og_title',
    }),
    __metadata("design:type", String)
], Seo.prototype, "ogTitle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'og_description',
    }),
    __metadata("design:type", String)
], Seo.prototype, "ogDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: true,
        field: 'og_image',
    }),
    __metadata("design:type", String)
], Seo.prototype, "ogImage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'og_type',
        defaultValue: 'website',
    }),
    __metadata("design:type", String)
], Seo.prototype, "ogType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'twitter_card',
        defaultValue: 'summary_large_image',
    }),
    __metadata("design:type", String)
], Seo.prototype, "twitterCard", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'twitter_title',
    }),
    __metadata("design:type", String)
], Seo.prototype, "twitterTitle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'twitter_description',
    }),
    __metadata("design:type", String)
], Seo.prototype, "twitterDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: true,
        field: 'twitter_image',
    }),
    __metadata("design:type", String)
], Seo.prototype, "twitterImage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        field: 'schema_org',
    }),
    __metadata("design:type", Object)
], Seo.prototype, "schemaOrg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: true,
        field: 'redirect_url',
    }),
    __metadata("design:type", String)
], Seo.prototype, "redirectUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('301', '302'),
        allowNull: true,
        field: 'redirect_type',
    }),
    __metadata("design:type", String)
], Seo.prototype, "redirectType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        allowNull: true,
        defaultValue: 0.5,
        field: 'sitemap_priority',
    }),
    __metadata("design:type", Number)
], Seo.prototype, "sitemapPriority", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: true,
        defaultValue: 'weekly',
        field: 'sitemap_changefreq',
    }),
    __metadata("design:type", String)
], Seo.prototype, "sitemapChangefreq", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
    }),
    __metadata("design:type", Date)
], Seo.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
    }),
    __metadata("design:type", Date)
], Seo.prototype, "updatedAt", void 0);
exports.Seo = Seo = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "seo",
        timestamps: true,
        underscored: true,
    })
], Seo);
