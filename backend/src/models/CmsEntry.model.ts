import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import { CmsCollection } from "./CmsCollection.model";
import { Site } from "./site";

export type CmsEntryStatus =
  | "draft"
  | "published";

@Table({
  tableName: "cms_entries",
  timestamps: true,
  underscored: true
})
export class CmsEntry extends Model {
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

  @ForeignKey(() => CmsCollection)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "collection_id"
  })
  collectionId!: number;

  @Column({
  type: DataType.STRING,
  allowNull: true
  })
  slug!: string;

  @BelongsTo(() => CmsCollection)
  collection!: CmsCollection;

  @Column({
    type: DataType.ENUM("draft", "published"),
    allowNull: false,
    defaultValue: "draft"
  })
  status!: CmsEntryStatus;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  data!: Record<string, any>;
}