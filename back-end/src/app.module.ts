import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { UserGameModule } from './user-game/user-game.module';
import { GameModule } from './game/game.module';
import { FollowModule } from './follow/follow.module';
import { RatingModule } from './rating/rating.module';
import { CustomListModule } from './custom-list/custom-list.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { RawgModule } from './rawg/rawg.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // Variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // Rate limiting global: máx 100 peticiones por IP cada 60 segundos
    // Las rutas de auth tienen límite propio más estricto (ver auth.controller.ts)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: configService.get<string>('NODE_ENV') === 'production' 
              ? { rejectUnauthorized: false } 
              : false,
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'root',
          database: 'TFM-GT',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),

    UserModule,
    AuthModule,
    WishlistModule,
    UserGameModule,
    GameModule,
    FollowModule,
    RatingModule,
    CustomListModule,
    SuggestionsModule,
    RawgModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}