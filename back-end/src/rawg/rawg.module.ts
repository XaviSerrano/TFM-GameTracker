import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RawgService } from './rawg.service';
import { RawgController } from './rawg.controller';

@Module({
  imports: [HttpModule],
  controllers: [RawgController], // ← Importante
  providers: [RawgService],
})
export class RawgModule {} // ← Debe exportarse por defecto