import {
  Table,
  Column,
  Model,
  DataType,
} from "sequelize-typescript";
@Table({
  tableName: "ai_activity_events",
  timestamps: true,
  underscored: true
})
export class AiActivityEvent extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  siteId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  pageId?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  generationId?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  eventType!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  details!: Record<string, any>;
}