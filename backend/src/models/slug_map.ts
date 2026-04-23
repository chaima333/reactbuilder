import { Model, DataTypes } from "sequelize";
import { sequelize } from "../core/database/connection";
import { SlugMapAttributes } from "../modules/pages/types/slugMap.types";

export class SlugMap extends Model<SlugMapAttributes> implements SlugMapAttributes {
  public id!: number;
  public siteId!: number;
  public slug!: string;
  public pageId!: number;
  public type!: "page" | "redirect";
  public redirectTo?: string
  public isActive!: boolean; // 👈 لازم تزيدها هوني
  public readonly createdAt!: Date; // 👈 وزيد هذي برغم إنها Readonly
  toSlug: string;
}
SlugMap.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },

    siteId: { 
      type: DataTypes.INTEGER, 
      allowNull: false ,
      field: 'siteId'
    },

    slug: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    pageId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },

    type: { 
      type: DataTypes.ENUM("page", "redirect"), 
      allowNull: false 
    },

    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },

    redirectTo: {
      type: DataTypes.STRING,
      allowNull: true
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "slug_maps",
    indexes: [
      {
        unique: true,
        fields: ["siteId", "slug"]
      }
    ]
  }
);