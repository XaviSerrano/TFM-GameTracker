import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { MailService } from '../modules/mail/mail.service'
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string, username: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) throw new UnauthorizedException('Email already exists');
  
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create(email, hashedPassword, username);
  }


  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || null,
      displayName: user.displayName || user.username,
    };
  }

    // Solicitar reset
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    await this.userService.setResetToken(user.id, token);
    await this.mailService.sendPasswordReset(user.email, token);
  }

  // Confirmar reset
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userService.findByResetToken(token);

    if (!user || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashed);
  }

}
