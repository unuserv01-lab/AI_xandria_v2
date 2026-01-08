import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { IsString, IsNumber, IsEnum, Min } from 'class-validator';

class WithdrawDto {
  @IsNumber()
  @Min(0.001)
  amount: number;

  @IsString()
  userId: string;

  @IsString()
  destinationWallet: string;
}

@Controller('api/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('persona/:personaId')
  async getPersonaWallet(@Param('personaId') personaId: string) {
    return this.walletService.getPersonaWallet(personaId);
  }

  @Post('persona/:personaId/withdraw')
  async withdrawEarnings(
    @Param('personaId') personaId: string,
    @Body() dto: WithdrawDto
  ) {
    return this.walletService.withdrawEarnings(
      personaId,
      dto.amount,
      dto.userId,
      dto.destinationWallet
    );
  }

  @Get('persona/:personaId/transactions')
  async getTransactionHistory(
    @Param('personaId') personaId: string,
    @Query('limit') limit?: string
  ) {
    return this.walletService.getTransactionHistory(
      personaId,
      limit ? parseInt(limit) : 100
    );
  }
}
