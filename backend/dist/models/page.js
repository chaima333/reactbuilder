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
exports.Page = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
const site_1 = require("./site");
const Seo_1 = require("./Seo");
let Page = class Page extends sequelize_typescript_1.Model {
};
exports.Page = Page;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    }),
    __metadata("design:type", Number)
], Page.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Page.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Page.prototype, "slug", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Page.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        defaultValue: [],
    }),
    __metadata("design:type", Array)
], Page.prototype, "blocks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        field: 'meta_title',
    }),
    __metadata("design:type", String)
], Page.prototype, "metaTitle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'meta_description',
    }),
    __metadata("design:type", String)
], Page.prototype, "metaDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'meta_keywords',
    }),
    __metadata("design:type", String)
], Page.prototype, "metaKeywords", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('draft', 'published', 'scheduled', 'deleted'),
        defaultValue: 'draft',
    }),
    __metadata("design:type", String)
], Page.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: 'published_at',
    }),
    __metadata("design:type", Date)
], Page.prototype, "publishedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: true,
        field: 'featured_image',
    }),
    __metadata("design:type", String)
], Page.prototype, "featuredImage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Page.prototype, "views", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'user_id',
    }),
    __metadata("design:type", Number)
], Page.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Page.prototype, "author", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => site_1.Site),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'site_id',
    }),
    __metadata("design:type", Number)
], Page.prototype, "siteId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => site_1.Site, {
        foreignKey: 'siteId',
        as: 'site'
    }),
    __metadata("design:type", site_1.Site)
], Page.prototype, "site", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Seo_1.Seo),
    __metadata("design:type", Seo_1.Seo)
], Page.prototype, "seo", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
    }),
    __metadata("design:type", Date)
], Page.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
    }),
    __metadata("design:type", Date)
], Page.prototype, "updatedAt", void 0);
exports.Page = Page = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "pages",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ['site_id', 'slug'] }],
    })
], Page);
