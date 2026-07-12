import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

import { Site } from "./site";
import { Page } from "./page";
import { FormSubmission } from "./FormSubmission.model";

@Table({
  tableName: "forms",
  timestamps: true,
  underscored: true
})
export class Form extends Model {
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

  @ForeignKey(() => Page)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "page_id"
  })
  pageId?: number | null;

  @BelongsTo(() => Page)
  page?: Page | null;

  @Column({
    type: DataType.STRING(120),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(140),
    allowNull: false
  })
  slug!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  schema!: Record<string, any>[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  settings!: Record<string, any>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active"
  })
  isActive!: boolean;

  @HasMany(() => FormSubmission)
  submissions?: FormSubmission[];
}