import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Page } from "./page";
import { Site } from "../modules/sites/site";

@Table({
  tableName: "seo",
  timestamps: true,
  underscored: true,
})
export class Seo extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => Page)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'page_id',
  })
  pageId!: number;

  @BelongsTo(() => Page)
  page!: Page;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'site_id',
  })
  siteId!: number;

  @BelongsTo(() => Site)
  site!: Site;

  // Meta tags de base
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
    type: DataType.STRING(255),
    allowNull: true,
    field: 'meta_keywords',
  })
  metaKeywords!: string;

  // Meta robots
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    defaultValue: 'index,follow',
    field: 'meta_robots',
  })
  metaRobots!: string;

  // Canonical URL
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'canonical_url',
  })
  canonicalUrl!: string;

  // Open Graph (Facebook, LinkedIn)
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'og_title',
  })
  ogTitle!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'og_description',
  })
  ogDescription!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'og_image',
  })
  ogImage!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'og_type',
    defaultValue: 'website',
  })
  ogType!: string;

  // Twitter Cards
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'twitter_card',
    defaultValue: 'summary_large_image',
  })
  twitterCard!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'twitter_title',
  })
  twitterTitle!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'twitter_description',
  })
  twitterDescription!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'twitter_image',
  })
  twitterImage!: string;

  // JSON-LD Schema
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'schema_org',
  })
  schemaOrg!: any;

  // Redirections
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'redirect_url',
  })
  redirectUrl!: string;

  @Column({
    type: DataType.ENUM('301', '302'),
    allowNull: true,
    field: 'redirect_type',
  })
  redirectType!: string;

  // Sitemap
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 0.5,
    field: 'sitemap_priority',
  })
  sitemapPriority!: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    defaultValue: 'weekly',
    field: 'sitemap_changefreq',
  })
  sitemapChangefreq!: string;

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