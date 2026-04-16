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
import { User } from "../modules/users/User";
import { Site } from "../modules/sites/site";

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
  })
  filename!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  url!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'image',
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  size!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  alt!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'folder_id',
  })
  folderId!: number;

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