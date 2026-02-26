import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(email: string, hashedPassword: string, username: string): Promise<User> {
    const user = this.userRepo.create({
      email,
      username,
      password: hashedPassword,
    });
    return this.userRepo.save(user);
  }


  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(userId: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async findByIdWithRelations(userId: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['followers', 'following'],
    });
  }

  async updateProfile(userId: number, data: Partial<User>) {
    await this.userRepo.update(userId, data);
    return this.findById(userId);
  }

  async deleteUser(userId: number) {
    const result = await this.userRepo.delete(userId);
    return (result.affected ?? 0) > 0;
  }

  async searchUsers(query: string): Promise<User[]> {
    const qb = this.userRepo.createQueryBuilder('user');

    if (query) {
      const lowerQuery = query.toLowerCase();
      qb.where('LOWER(user.username) LIKE :q', { q: `%${lowerQuery}%` })
        .orWhere('LOWER(user.displayName) LIKE :q', { q: `%${lowerQuery}%` });
    }

    return qb
      .take(5)
      .getMany();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { username },
      relations: ['followers', 'following'],
    });
  }


  // RESET PASSWORD
  async setResetToken(userId: number, token: string): Promise<void> {
    await this.userRepo.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hora
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { resetPasswordToken: token } });
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepo.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
