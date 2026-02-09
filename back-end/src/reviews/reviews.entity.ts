import { CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Review {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> User, { onDelete: 'CASCADE' })
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