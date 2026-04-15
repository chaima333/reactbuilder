import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "./User";
import { Page } from "./page";
import { ActivityLog } from "./activityLog";

@Table({
  tableName: "sites",
  timestamps: true,
  underscored: true,
})
export class Site extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  subdomain!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  favicon!: string;

  @Column({
    type: DataType.STRING(10),
    defaultValue: "fr",
  })
  language!: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: "Europe/Paris",
  })
  timezone!: string;


  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'views',
  })
  views!: number;

  @Column({
    type: DataType.ENUM('active', 'suspended', 'deleted'),
    defaultValue: 'active',
    field: 'status',
  })
  status!: 'active' | 'suspended' | 'deleted';

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  settings!: any;

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

  // Associations
  @HasMany(() => Page, {
    foreignKey: 'siteId',
    as: 'pages'
  })
  pages!: Page[];

  @HasMany(() => ActivityLog, {
    foreignKey: 'siteId',
    as: 'activities'
  })
  activities!: ActivityLog[];
}