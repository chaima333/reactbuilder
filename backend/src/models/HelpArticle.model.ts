import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import {
  HelpCategory
} from "./HelpCategory.model";

@Table({
  tableName: "help_articles",
  timestamps: true,
  underscored: true
})
export class HelpArticle extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @ForeignKey(() => HelpCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "category_id"
  })
  categoryId!: number;

  @BelongsTo(() => HelpCategory)
  category?: HelpCategory;

  @Column({
    type: DataType.STRING(160),
    allowNull: false,
    unique: true
  })
  slug!: string;

  @Column({
    type: DataType.STRING(220),
    allowNull: false,
    field: "title_fr"
  })
  titleFr!: string;

  @Column({
    type: DataType.STRING(220),
    allowNull: false,
    field: "title_en"
  })
  titleEn!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "summary_fr"
  })
  summaryFr!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "summary_en"
  })
  summaryEn!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "content_fr"
  })
  contentFr!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "content_en"
  })
  contentEn!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  keywords!: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: "display_order"
  })
  order!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  published!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active!: boolean;
}
