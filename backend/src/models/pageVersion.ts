import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Page } from "./page";

@Table({ tableName: "page_versions", timestamps: true })
export class PageVersion extends Model { 
  @ForeignKey(() => Page)
  @Column({ type: DataType.INTEGER, allowNull: false })
  pageId!: number;
  @Column({ type: DataType.INTEGER, allowNull: false })
  siteId!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.JSON)
  blocks!: any;

  @Column(DataType.STRING)
  versionTag!: string;

  @Column(DataType.INTEGER)
  createdBy!: number;
}

export default PageVersion;