import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User'; // ثبت في اسم المودل القديم متاعك
import { Site } from './site';

@Table({ tableName: 'site_members', timestamps: true })
export class SiteMember extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @ForeignKey(() => Site)
  @Column({ type: DataType.INTEGER, allowNull: false })
  siteId!: number;

  @Column({
    type: DataType.ENUM('OWNER', 'ADMIN', 'EDITOR', 'VIEWER'),
    allowNull: false,
    defaultValue: 'VIEWER',
  })
  role!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Site)
  site!: Site;
}
export default SiteMember;