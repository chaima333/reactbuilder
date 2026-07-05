import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

import { CmsField } from "./CmsField.model";
import { CmsEntry } from "./CmsEntry.model";
import { Site } from "./site";

@Table({
  tableName: "cms_collections",
  timestamps: true,
  underscored: true
})
export class CmsCollection extends Model {
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

  @BelongsTo(() => Site)
  site!: Site;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description?: string;

  @HasMany(() => CmsField)
  fields!: CmsField[];

  @HasMany(() => CmsEntry)
  entries!: CmsEntry[];
}