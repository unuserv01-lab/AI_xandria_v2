import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString } from 'class-validator';

class AuthWalletDto {
  @IsString()
  walletAddress: string;

  @IsString()
  signature: string;

  @IsString()
  message: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wallet')
  async authenticateWallet(@Body() dto: AuthWalletDto) {
    return this.authService.authenticateWallet(
      dto.walletAddress,
      dto.signature,
      dto.message
    );
  }
}
