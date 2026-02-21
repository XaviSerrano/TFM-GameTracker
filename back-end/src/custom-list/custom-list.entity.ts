import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../user/user.entity';
import { CustomListGame } from './custom-list-game.entity';

@Entity()
export class CustomList {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, user => user.customLists, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => CustomListGame, clg => clg.list)
  games: CustomListGame[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'float', nullable: true })
  rating: number;
}
