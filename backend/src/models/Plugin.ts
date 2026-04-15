import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { SitePlugin } from "./SitePlugin";

@Table({ tableName: "plugins", timestamps: true })
export class Plugin extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @Column(DataType.TEXT)
  description?: string;

  @HasMany(() => SitePlugin)
  siteActivations!: SitePlugin[];
}
export default Plugin;