import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column('text')
  review: string;

  @Column({ type: 'float', nullable: true })
  rating?: number;

  @CreateDateColumn()
  createdAt: Date;
}
