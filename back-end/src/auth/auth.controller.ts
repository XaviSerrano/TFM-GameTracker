import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.username);
  }

  
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  async findAll() {
    return this.userService['userRepo'].find();
  }

  // ✅ NUEVOS ENDPOINTS
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    // Siempre responde igual para no revelar si el email existe
    return { message: 'Si el email existe, recibirás un enlace de recuperación.' };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.authService.resetPassword(token, password);
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
