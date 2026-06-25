import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
} from "sequelize-typescript";

import { SitePlugin } from "./SitePlugin";

@Table({
  tableName: "plugins",
  timestamps: true,
})
export class Plugin extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: "key",
  })
  slug!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: "is_active",
  })
  isActive!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: "1.0.0",
  })
  version!: string;

  @Column(DataType.STRING)
  author?: string;

  @Column(DataType.STRING)
  category?: string;

  @Column(DataType.STRING)
  icon?: string;

  @Column(DataType.STRING)
  documentation?: string;

  @Column(DataType.STRING)
  repository?: string;

  @Column({
    type: DataType.ENUM("draft", "published", "deprecated"),
    defaultValue: "published",
  })
  status!: "draft" | "published" | "deprecated";

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  createdAt!: Date;

  @HasMany(() => SitePlugin)
  siteActivations!: SitePlugin[];
}

export default Plugin;