import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomList } from './custom-list.entity';
import { CustomListGame } from './custom-list-game.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CustomListsService {

  constructor(
    @InjectRepository(CustomList)
    private listRepo: Repository<CustomList>,

    @InjectRepository(CustomListGame)
    private gameRepo: Repository<CustomListGame>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getByUser(userId: number) {
    return this.listRepo.find({
      where: { user: { id: userId } },
      relations: ['games', 'user'],
    });
  }

  async create(userId: number, data: { title: string; description?: string }) {
  
    const user = await this.userRepo.findOneBy({ id: userId });
  
    if (!user) {
      throw new ForbiddenException('User not found');
    }
  
    const list = this.listRepo.create({
      title: data.title,
      description: data.description,
      user
    });
  
    return this.listRepo.save(list);
  }


  async toggleGame(userId: number, listId: number, game: any) {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
      relations: ['games']
    });

    if (!list) throw new ForbiddenException();

    const existing = list.games.find(g => g.gameId === game.id);

    if (existing) {
      await this.gameRepo.remove(existing);
      return { removed: true };
    }

    const entry = this.gameRepo.create({
      gameId: game.id,
      name: game.name,
      backgroundImage: game.backgroundImage,
      rating: game.rating ?? null,
      list
    });

    await this.gameRepo.save(entry);
    return { added: true };
  }

// GET listId para mostrar el detalle

  async getListById(listId: number, userId: number) {
    const list = await this.listRepo.findOne({
      where: {
        id: listId,
        user: { id: userId }
      },
      relations: ['user', 'games']
    });
  
    if (!list) {
      throw new ForbiddenException('List not found');
    }
  
    return list;
  }

  async updateList(
    listId: number,
    userId: number,
    data: { title: string; description?: string }
  ) {
    const list = await this.listRepo.findOne({
      where: {
        id: listId,
        user: { id: userId }
      }
    });
  
    if (!list) {
      throw new ForbiddenException('List not found');
    }
  
    list.title = data.title;
    list.description = data.description;
  
    await this.listRepo.save(list);

    return this.listRepo.findOne({
      where: { id: listId },
      relations: ['games', 'user']
    });
  }


  async deleteList(listId: number, userId: number) {
    const list = await this.listRepo.findOne({
      where: {
        id: listId,
        user: { id: userId }
      }
    });
    
    if (!list) {
      throw new ForbiddenException('List not found');
    }

    await this.listRepo.remove(list);
    return { deleted: true };

  }
  



}
