import {
  Table,
  Column,
  Model,
  DataType
} from "sequelize-typescript";

@Table({
  tableName: "ai_generations",
  timestamps: true
})
export class AiGeneration extends Model {

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
    type: DataType.TEXT,
    allowNull: false
  })
  prompt!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  category!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  pagesGenerated!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: "success"
  })
  status!: string;
}