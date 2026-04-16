// backend/src/models/Token.ts
import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  ForeignKey, 
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { User } from '../modules/users/User';

@Table({
  tableName: 'tokens',
  timestamps: true,
  underscored: true,
})
export class Token extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.ENUM('access', 'refresh'),
    allowNull: false,
    defaultValue: 'access',
  })
  type!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  })
  isRevoked!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_at',
  })
  expiresAt!: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}