import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import { User } from "./User";
import { Site } from "./site";

@Table({
  tableName: "site_invitations",
  timestamps: true,
  underscored: true
})
export class SiteInvitation extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
    type: DataType.STRING(255),
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.ENUM(
      "ADMIN",
      "EDITOR",
      "VIEWER"
    ),
    allowNull: false,
    defaultValue: "VIEWER"
  })
  role!: "ADMIN" | "EDITOR" | "VIEWER";

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true
  })
  token!: string;

  @Column({
    type: DataType.ENUM(
      "PENDING",
      "ACCEPTED",
      "CANCELLED",
      "EXPIRED"
    ),
    allowNull: false,
    defaultValue: "PENDING"
  })
  status!:
    | "PENDING"
    | "ACCEPTED"
    | "CANCELLED"
    | "EXPIRED";

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "invited_by"
  })
  invitedBy!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "accepted_by"
  })
  acceptedBy!: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expires_at"
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "accepted_at"
  })
  acceptedAt!: Date | null;

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
}

export default SiteInvitation;