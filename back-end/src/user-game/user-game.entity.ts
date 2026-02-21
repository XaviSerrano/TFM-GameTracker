import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';

@Entity()
export class UserGame {
  @PrimaryGeneratedColumn()
  id: number; // 👈 ID INTERNO

  @ManyToOne(() => User, (user) => user.userGames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.userGames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column('varchar', { nullable: true })
  gameName: string;

  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ nullable: true })
  status: string;

  // ⭐ RATING DEL USUARIO
  @Column({ type: 'float', nullable: true })
  rating?: number;

  @Column({ type: 'float', nullable: true })
  playtime?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}