import { Model, DataTypes } from "sequelize";
import { sequelize } from "../core/database/connection";
import { SlugMapAttributes } from "../modules/pages/types/slugMap.types";

export class SlugMap extends Model<SlugMapAttributes> implements SlugMapAttributes {
  public id!: number;
  public siteId!: number;
  public slug!: string;
  public pageId!: number;
  public type!: "page" | "redirect";
}

SlugMap.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    siteId: DataTypes.INTEGER,
    slug: DataTypes.STRING,
    pageId: DataTypes.INTEGER,
    type: DataTypes.ENUM("page", "redirect")
  },
  {
    sequelize,
    tableName: "slug_maps"
  }
);