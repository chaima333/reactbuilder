import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import { User } from "./User";
import { Site } from "./site";

@Table({
  tableName: "figma_imports",
  timestamps: true,
  underscored: true
})
export class FigmaImport extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false
  })
  payload!: any;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "figma-plugin"
  })
  source!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "user_id"
  })
  userId!: number;

  @BelongsTo(() => User, "user_id")
  user!: User;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id"
  })
  siteId!: number;

  @BelongsTo(() => Site, "site_id")
  site!: Site;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt!: Date;
}