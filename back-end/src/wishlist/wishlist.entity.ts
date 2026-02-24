import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  gameName: string;

  @Column({ nullable: true })
  backgroundImage: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  // clave profesional
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  released?: string;

  @Column('simple-array', { nullable: true })
  genres?: string[];

  @Column('simple-array', { nullable: true })
  platforms?: string[];
}
