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
import { User } from "./User";
import { Site } from "./site";
@Table({
  tableName: "media",
  timestamps: true,
  underscored: true,
})
export class Media extends Model {

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'original_name'
  })
  originalName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  filename!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  url!: string;

  @Column({
    type: DataType.ENUM('image', 'video', 'file'),
    allowNull: false,
    defaultValue: 'image',
  })
  type!: 'image' | 'video' | 'file';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  size!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  alt!: string;

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
    allowNull: false,
    field: 'site_id',
  })
  siteId!: number;

  @BelongsTo(() => Site)
  site!: Site;

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