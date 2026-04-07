import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  HasOne,
} from "sequelize-typescript";
import { User } from "./User";
import { Site } from "./site";
import { Seo } from "./Seo";

// Type pour les blocs de l'éditeur
export type Block = { type: string; content: string };

// Statuts possibles d'une page
export type PageStatus = 'draft' | 'published' | 'scheduled' | 'deleted';

@Table({
  tableName: "pages",
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['site_id', 'slug'] }],
})
export class Page extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: [],
  })
  blocks!: Block[];

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'meta_title',
  })
  metaTitle!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'meta_description',
  })
  metaDescription!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'meta_keywords',
  })
  metaKeywords!: string;

  @Column({
    type: DataType.ENUM('draft', 'published', 'scheduled', 'deleted'),
    defaultValue: 'draft',
  })
  status!: PageStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'published_at',
  })
  publishedAt!: Date;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'featured_image',
  })
  featuredImage!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  views!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  @BelongsTo(() => User)
  author!: User;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'site_id',
  })
  siteId!: number;

  @BelongsTo(() => Site)
  site!: Site;

  @HasOne(() => Seo)
  seo!: Seo;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt!: Date;
}