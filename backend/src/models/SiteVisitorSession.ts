import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import { Site } from "./site";
import { SiteVisitor } from "./SiteVisitor";

@Table({
  tableName: "site_visitor_sessions",
  timestamps: true,
  underscored: true
})
export class SiteVisitorSession
  extends Model<SiteVisitorSession> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  })
  id!: number;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id"
  })
  siteId!: number;

  @ForeignKey(() => SiteVisitor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_visitor_id"
  })
  siteVisitorId!: number;

  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    field: "token_hash"
  })
  tokenHash!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expires_at"
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "revoked_at"
  })
  revokedAt!: Date | null;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: "ip_address"
  })
  ipAddress!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "user_agent"
  })
  userAgent!: string | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at"
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at"
  })
  updatedAt!: Date;

  @BelongsTo(() => Site, {
    foreignKey: "siteId",
    as: "site"
  })
  site!: Site;

  @BelongsTo(() => SiteVisitor, {
    foreignKey: "siteVisitorId",
    as: "visitor"
  })
  visitor!: SiteVisitor;
}

export default SiteVisitorSession;
