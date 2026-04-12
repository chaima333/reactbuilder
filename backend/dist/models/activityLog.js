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
exports.ActivityLog = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
const site_1 = require("./site");
let ActivityLog = class ActivityLog extends sequelize_typescript_1.Model {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'user_id',
    }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], ActivityLog.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => site_1.Site),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'site_id',
    }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "siteId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => site_1.Site),
    __metadata("design:type", site_1.Site)
], ActivityLog.prototype, "site", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('site', 'page', 'user', 'media', 'plugin'),
        allowNull: false,
        field: 'entity_type',
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "entityType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'entity_id',
    }),
    __metadata("design:type", Number)
], ActivityLog.prototype, "entityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        defaultValue: {},
    }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "details", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(45),
        allowNull: true,
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "ip", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        field: 'user_agent',
    }),
    __metadata("design:type", String)
], ActivityLog.prototype, "userAgent", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
    }),
    __metadata("design:type", Date)
], ActivityLog.prototype, "createdAt", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "activity_logs",
        timestamps: true,
        underscored: true,
        updatedAt: false, // Pas de updated_at
    })
], ActivityLog);
