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
import { Plugin } from "./Plugin";

@Table({
  tableName: "site_plugins",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class SitePlugin extends Model {
  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id",
  })
  siteId!: number;

  @ForeignKey(() => Plugin)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "plugin_id",
  })
  pluginId!: number;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  config!: any;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: "is_enabled",
  })
  isEnabled!: boolean;

  @Column({
    type: DataType.DATE,
    field: "installed_at",
  })
  installedAt?: Date;

  @Column({
    type: DataType.STRING,
    field: "installed_version",
  })
  installedVersion?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at",
  })
  updatedAt!: Date;

  @BelongsTo(() => Plugin, "pluginId")
  plugin!: Plugin;

  @BelongsTo(() => Site, "siteId")
  site!: Site;
}

export default SitePlugin;