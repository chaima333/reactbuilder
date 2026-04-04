import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Token extends Model<Token> {

    @Column({
        allowNull: false
    })
    token!: string;

    @Column({
        type: DataType.ENUM('access', 'refresh'),
        allowNull: false
    })
    type!: 'access' | 'refresh';

    @ForeignKey(() => User)
    @Column({
        allowNull: false
    })
    userId!: number;

    @BelongsTo(() => User)
    user!: User;
}