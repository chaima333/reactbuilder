// src/models/PageVersion.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../core/database/connection";

export class PageVersion extends Model {
  public id!: number;
  public pageId!: number;
  public title!: string;
  public content!: string;
  public blocks!: any;
  public versionTag!: string;
  public createdBy!: number;
}

PageVersion.init({
  pageId: DataTypes.INTEGER,
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  blocks: DataTypes.JSON,
  versionTag: DataTypes.STRING,
  createdBy: DataTypes.INTEGER,
}, { sequelize, modelName: 'page_version' });

export default PageVersion;