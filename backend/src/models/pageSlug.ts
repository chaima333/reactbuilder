import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Page } from "./page";

@Table({ tableName: "page_slugs", timestamps: true })
export class PageSlug extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => Page)
  @Column({ type: DataType.INTEGER, allowNull: false })
  pageId!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  siteId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  slug!: string;
}

export default PageSlug;