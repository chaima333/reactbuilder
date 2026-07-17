import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeValidate,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import { Site } from "./site";
import { SiteVisitorSession } from "./SiteVisitorSession";

export type SiteVisitorStatus =
  | "active"
  | "pending_verification"
  | "suspended";

@Table({
  tableName: "site_visitors",
  timestamps: true,
  underscored: true
})
export class SiteVisitor extends Model<SiteVisitor> {
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

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    field: "full_name"
  })
  fullName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: "password_hash"
  })
  passwordHash!: string;

  @Column({
    type: DataType.ENUM(
      "active",
      "pending_verification",
      "suspended"
    ),
    allowNull: false,
    defaultValue: "active"
  })
  status!: SiteVisitorStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "email_verified_at"
  })
  emailVerifiedAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "last_login_at"
  })
  lastLoginAt!: Date | null;

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

  @HasMany(() => SiteVisitorSession, {
    foreignKey: "siteVisitorId",
    as: "sessions"
  })
  sessions!: SiteVisitorSession[];

  @BeforeValidate
  static normalizeVisitorEmail(
    visitor: SiteVisitor
  ): void {
    if (typeof visitor.email === "string") {
      visitor.email =
        visitor.email
          .trim()
          .toLowerCase();
    }

    if (typeof visitor.fullName === "string") {
      visitor.fullName =
        visitor.fullName.trim();
    }
  }

  toJSON() {
    const values = {
      ...this.get()
    } as Record<string, unknown>;

    delete values.passwordHash;

    return values;
  }
}

export default SiteVisitor;
