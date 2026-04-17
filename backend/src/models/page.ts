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
import { Site } from "../models/site";
import { Seo } from "./Seo";

// Type pour les blocs de l'éditeur
export type Block = { type: string; content: string };

// Statuts possibles d'une page
export type PageStatus = 'draft' | 'published' | 'scheduled' | 'deleted';


@Table({
  tableName: "pages",
  timestamps: true,
  underscored: true, // هذي معناها الداتابيز فيها (_)
  // ✅ التصليح هوني: لازم نكتبوا site_id موش siteId لداخل الـ fields
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

  // 🛡️ الربط مع المستخدم
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id', // تأكيد الإسم في الداتابيز
  })
  userId!: number;

  @BelongsTo(() => User, 'user_id')
  author!: User;

  // 🛡️ الربط مع الموقع (هوني كانت العكّة)
  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'site_id', // تأكيد الإسم في الداتابيز
  })
  siteId!: number; 
  
  @BelongsTo(() => Site, 'site_id')
  site!: Site;

  @HasOne(() => Seo)
  seo!: Seo;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}