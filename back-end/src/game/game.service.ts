// src/game/game.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private repo: Repository<Game>,
  ) {}

  // Encuentra o crea un juego
  async findOrCreate(data: Partial<Game>): Promise<Game> {
    let game = await this.repo.findOne({ where: { id: data.id } });

    if (!game) {
      game = this.repo.create(data);
    } else {
      // Actualizar campos si vienen informados
      if (data.rating != null) game.rating = data.rating;
      if (data.backgroundImage) game.backgroundImage = data.backgroundImage;
      if (data.name) game.name = data.name;
      if (data.released) game.released = data.released;
    }

    return this.repo.save(game);
  }
  // Guarda o actualiza un juego existente
  async save(game: Game): Promise<Game> {
    return this.repo.save(game);
  }
}
