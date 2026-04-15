import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Site } from './site'; // ثبت في اسم المودل القديم متاعك
import { Plugin } from './Plugin';

@Table({ tableName: 'site_plugins', timestamps: true })

export class SitePlugin extends Model {
  @ForeignKey(() => Site)
  @Column({ type: DataType.INTEGER, allowNull: false })
  siteId!: number;

  @ForeignKey(() => Plugin)
  @Column({ type: DataType.INTEGER, allowNull: false })
  pluginId!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isEnabled!: boolean;

  @BelongsTo(() => Plugin)
  plugin!: Plugin;

  @BelongsTo(() => Site)
  site!: Site;
}
export default SitePlugin;