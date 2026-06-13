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
  updatedAt: false,
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