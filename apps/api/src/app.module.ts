import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { PersonasModule } from './modules/personas/personas.module';
import { BattleModule } from './modules/battle/battle.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CostModule } from './modules/cost/cost.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    PersonasModule,
    BattleModule,
    MarketplaceModule,
    WalletModule,
    CostModule,
  ],
})
export class AppModule {}
