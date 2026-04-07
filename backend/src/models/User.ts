import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table({ 
  tableName: "users",
  timestamps: true,
  underscored: true
})
export class User extends Model<User> {

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.ENUM('Admin', 'Editor', 'Viewer'),
    allowNull: false,
    defaultValue: 'Viewer'
  })
  role!: 'Admin' | 'Editor' | 'Viewer';  

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  avatar!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_approved'
  })
  isApproved!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt!: Date;

  // Méthodes utilitaires
  isAdmin(): boolean {
    return this.role === 'Admin';
  }

  isEditor(): boolean {
    return this.role === 'Editor';
  }

  canEditPage(pageUserId: number): boolean {
    if (this.isAdmin()) return true;
    if (this.isEditor() && this.id === pageUserId) return true;
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      avatar: this.avatar,
      createdAt: this.createdAt
    };
  }
}