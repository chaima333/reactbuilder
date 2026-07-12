import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import { Site } from "./site";
import { Page } from "./page";
import { Form } from "./Form.model";

export type FormSubmissionStatus =
  | "new"
  | "read"
  | "archived"
  | "spam";

@Table({
  tableName: "form_submissions",
  timestamps: true,
  underscored: true
})
export class FormSubmission extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @ForeignKey(() => Form)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "form_id"
  })
  formId!: number;

  @BelongsTo(() => Form)
  form!: Form;

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
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  values!: Record<string, any>;

  @Column({
    type: DataType.ENUM(
      "new",
      "read",
      "archived",
      "spam"
    ),
    allowNull: false,
    defaultValue: "new"
  })
  status!: FormSubmissionStatus;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: "ip_address"
  })
  ipAddress?: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "user_agent"
  })
  userAgent?: string | null;
}