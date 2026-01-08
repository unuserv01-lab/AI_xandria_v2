import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller';
import { PersonasService } from './personas.service';
import { AIService } from './ai.service';
import { GachaService } from './gacha.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'persona-generation',
    }),
  ],
  controllers: [PersonasController],
  providers: [PersonasService, AIService, GachaService],
  exports: [PersonasService, AIService],
})
export class PersonasModule {}
