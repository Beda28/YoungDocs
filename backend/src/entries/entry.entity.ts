import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ unsigned: true })
  userId!: number;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type!: 'income' | 'expense';

  @Column({ length: 100 })
  title!: string;

  @Column({ unsigned: true })
  amount!: number;

  @Column({ type: 'date' })
  date!: string;
}
