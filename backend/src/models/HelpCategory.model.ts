import {
  Table,
  Column,
  Model,
  DataType,
  HasMany
} from "sequelize-typescript";

import {
  HelpArticle
} from "./HelpArticle.model";

@Table({
  tableName: "help_categories",
  timestamps: true,
  underscored: true
})
export class HelpCategory extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(140),
    allowNull: false,
    unique: true
  })
  slug!: string;

  @Column({
    type: DataType.STRING(180),
    allowNull: false,
    field: "name_fr"
  })
  nameFr!: string;

  @Column({
    type: DataType.STRING(180),
    allowNull: false,
    field: "name_en"
  })
  nameEn!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "description_fr"
  })
  descriptionFr?: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "description_en"
  })
  descriptionEn?: string | null;

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
  active!: boolean;

  @HasMany(() => HelpArticle)
  articles?: HelpArticle[];
}
