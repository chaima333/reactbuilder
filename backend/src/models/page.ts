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

export type Block = { type: string; content: string };

export type PageStatus = 'draft' | 'published' | 'scheduled' | 'deleted';

export type PageVisibility = | "public" | "members_only";

export type PageSystemType =
  | "visitor_login"
  | "visitor_register";

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

  @Column({ type: DataType.STRING(255), allowNull: false })
  title!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  slug!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  content!: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  blocks!: Block[];

  @Column({ type: DataType.ENUM('draft', 'published', 'scheduled', 'deleted'), defaultValue: 'draft' })
  status!: PageStatus;

  @Column({
  type: DataType.ENUM(
    "public",
    "members_only"
  ),
  allowNull: false,
  defaultValue: "public"
})
visibility!: PageVisibility;

  @Column({
  type: DataType.ENUM(
    "visitor_login",
    "visitor_register"
  ),
  allowNull: true,
  field: "system_type"
})
systemType!: PageSystemType | null;

  @Column({
  type: DataType.BOOLEAN,
  allowNull:false,
  defaultValue: false,
  field: "is_homepage"
})
isHomepage!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  @BelongsTo(() => User, 'userId')
  author!: User;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'site_id',
  })
  siteId!: number; 
  
  @BelongsTo(() => Site, 'siteId')
  site!: Site;

  @HasOne(() => Seo)
  seo!: Seo;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  @Column({
  type: DataType.DATE,
  allowNull: true,
  field: "published_at"
})
publishedAt!: Date;

@Column({
  type: DataType.JSONB, 
  field: "meta_data", 
  defaultValue: {}
})
metaData: any; 

@Column({
  type: DataType.INTEGER,
  allowNull: false,
  defaultValue: 0,
  field: 'views' 
})
views!: number;
}
