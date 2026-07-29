import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import { Site } from "./site";
import { User } from "./User";

@Table({
  tableName: "block_patterns",
  timestamps: true,
  underscored: true
})
export class BlockPattern extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id"
  })
  siteId!: number;

  @BelongsTo(() => Site)
  site!: Site;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "created_by"
  })
  createdBy?: number | null;

  @BelongsTo(() => User, "createdBy")
  creator?: User | null;

  @Column({
    type: DataType.STRING(120),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(160),
    allowNull: false
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description?: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    field: "root_block"
  })
  rootBlock!: Record<string, any>;

  @Column({
    type: DataType.STRING(60),
    allowNull: false,
    defaultValue: "section",
    field: "block_type"
  })
  blockType!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  metadata!: Record<string, any>;
}
