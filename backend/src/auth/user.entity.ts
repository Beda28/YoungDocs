import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 200, select: false })
  password!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
