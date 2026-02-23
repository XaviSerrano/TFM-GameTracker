import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from "typeorm";
import { CustomList } from "./custom-list.entity";


@Entity()
@Unique(['gameId', 'list'])

export class CustomListGame {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ type: 'float', nullable: true })
  rating?: number;

  @ManyToOne(() => CustomList, list => list.games, { onDelete: 'CASCADE' })
  list: CustomList;
}
