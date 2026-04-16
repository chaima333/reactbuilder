import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
} from "sequelize-typescript";
import { User } from "../modules/users/User";
import { Site } from "./site";

@Table({
  tableName: "activity_logs",
  timestamps: true,
  underscored: true,
  updatedAt: false, // Pas de updated_at
})
export class ActivityLog extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'site_id',
  })
  siteId!: number;

  @BelongsTo(() => Site)
  site!: Site;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.ENUM('site', 'page', 'user', 'media', 'plugin'),
    allowNull: false,
    field: 'entity_type',
  })
  entityType!: 'site' | 'page' | 'user' | 'media' | 'plugin';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'entity_id',
  })
  entityId!: number;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  details!: any;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  ip!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'user_agent',
  })
  userAgent!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;
}