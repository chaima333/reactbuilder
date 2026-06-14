import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Site } from "./site";

@Table({
  tableName: "contact_submissions",
  timestamps: true,
  underscored: true,
})
export class ContactSubmission extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id",
  })
  siteId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "page_id",
  })
  pageId?: number;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(180),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: "is_read",
  })
  isRead!: boolean;

  @BelongsTo(() => Site, {
    foreignKey: "siteId",
    as: "site",
  })
  site!: Site;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt!: Date;
}