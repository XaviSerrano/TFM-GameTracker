import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { UserGameModule } from './user-game/user-game.module';
import { GameModule } from './game/game.module';
import { FollowModule } from './follow/follow.module';
import { RatingModule } from './rating/rating.module';
import { UserReviewsModule } from './user-reviews/user-reviews.module';
import { CustomListModule } from './custom-list/custom-list.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { RawgModule } from './rawg/rawg.module';

@Module({
  imports: [
    // Configurar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        // Si tenemos DATABASE_URL, úsala (para Render/Producción)
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: configService.get<string>('NODE_ENV') === 'production' 
              ? { rejectUnauthorized: false } 
              : false,
            autoLoadEntities: true,
            synchronize: true,
            // synchronize: configService.get<string>('NODE_ENV') !== 'production',
          };
        }
        // Configuración para desarrollo local (fallback)
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
    UserReviewsModule,
    CustomListModule,
    SuggestionsModule,
    RawgModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}