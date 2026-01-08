import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { PersonasModule } from '../personas/personas.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PersonasModule, WalletModule],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
