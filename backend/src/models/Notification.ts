import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

import { User } from "./User";
import { Site } from "./site";

@Table({
  tableName: "notifications",
  timestamps: true,
  underscored: true,
})
export class Notification extends Model {
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
    field: "user_id",
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "site_id",
  })
  siteId!: number | null;

  @BelongsTo(() => Site)
  site!: Site;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: "is_read",
  })
  isRead!: boolean;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  metadata!: any;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt!: Date;
}

export default Notification;