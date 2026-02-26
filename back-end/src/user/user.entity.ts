import { Wishlist } from '../wishlist/wishlist.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserGame } from '../user-game/user-game.entity';
import { Follow } from '../follow/follow.entity';
import { CustomList } from '../custom-list/custom-list.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;
  
  @Column()
  password: string;
  
  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist[];
  
  @OneToMany(() => UserGame, (userGame) => userGame.user)
  userGames: UserGame[];
  
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
  @Column({ default: '' })
  displayName: string;

  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(() => Follow, follow => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followers: Follow[];

  @OneToMany(() => CustomList, list => list.user)
  customLists: CustomList[];


  @Column({ nullable: true })
  resetPasswordToken: string;


  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date;

}
