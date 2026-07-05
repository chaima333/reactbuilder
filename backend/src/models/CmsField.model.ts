import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import { CmsCollection } from "./CmsCollection.model";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "date"
  | "select";

@Table({
  tableName: "cms_fields",
  timestamps: true,
  underscored: true
})
export class CmsField extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @ForeignKey(() => CmsCollection)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "collection_id"
  })
  collectionId!: number;

  @BelongsTo(() => CmsCollection)
  collection!: CmsCollection;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  key!: string;

  @Column({
    type: DataType.ENUM(
      "text",
      "textarea",
      "number",
      "boolean",
      "image",
      "date",
      "select"
    ),
    allowNull: false,
    defaultValue: "text"
  })
  type!: CmsFieldType;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  required!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  order!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  settings!: Record<string, any>;
}