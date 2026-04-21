import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Page } from "./page";

@Table({ tableName: "page_versions", timestamps: true })
export class PageVersion extends Model { // 👈 الـ Model هذا توّة هو الصحيح
  @ForeignKey(() => Page)
  @Column({ type: DataType.INTEGER, allowNull: false })
  pageId!: number;

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