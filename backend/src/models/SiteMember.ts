// src/models/SiteMember.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Site } from './site';

@Table({ 
  tableName: 'site_members', 
  timestamps: true,
  underscored: true // <--- هذا يخلي Sequelize يفهم إنو الأعمدة في الـ DB هي snake_case
})
export class SiteMember extends Model {
  
  @ForeignKey(() => User)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false,
    field: 'user_id' // <--- تحديد إسم العمود في الـ DB بالظبط
  })
  userId!: number;

  @ForeignKey(() => Site)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false,
    field: 'site_id' // <--- تحديد إسم العمود في الـ DB بالظبط
  })
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