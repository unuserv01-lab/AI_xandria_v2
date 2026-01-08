import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CostService } from './cost.service';
import { IsString, IsEnum } from 'class-validator';

class CalculateCostDto {
  @IsString()
  prompt: string;
}

class BattleCostDto {
  @IsEnum(['CASUAL', 'RANKED', 'DEATHMATCH'])
  battleMode: 'CASUAL' | 'RANKED' | 'DEATHMATCH';
}

@Controller('api/cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post('calculate')
  async calculateCost(@Body() dto: CalculateCostDto) {
    return this.costService.calculatePersonaCreationCost(dto.prompt.length);
  }

  @Post('battle')
  async calculateBattleCost(@Body() dto: BattleCostDto) {
    return this.costService.calculateBattleCost(dto.battleMode);
  }

  @Get('pricing')
  async getPricing() {
    return this.costService.getPricingTable();
  }

  @Get('averages')
  async getAverageCosts() {
    return this.costService.getAverageCosts();
  }
}
