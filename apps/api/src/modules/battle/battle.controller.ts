import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { BattleService } from './battle.service';
import { IsString, IsEnum } from 'class-validator';

class CreateBattleDto {
  @IsString()
  persona1Id: string;

  @IsString()
  persona2Id: string;

  @IsString()
  topic: string;

  @IsEnum(['CASUAL', 'RANKED', 'DEATHMATCH'])
  mode: 'CASUAL' | 'RANKED' | 'DEATHMATCH';

  @IsString()
  initiatorId: string;
}

@Controller('api/battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('create')
  async createBattle(@Body() dto: CreateBattleDto) {
    return this.battleService.createBattle(dto);
  }

  @Post(':battleId/start')
  async startBattle(@Param('battleId') battleId: string) {
    return this.battleService.startBattle(battleId);
  }

  @Post(':battleId/judge')
  async judgeBattle(@Param('battleId') battleId: string) {
    return this.battleService.judgeBattle(battleId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.battleService.getLeaderboard(limit ? parseInt(limit) : 50);
  }

  @Get(':battleId')
  async getBattle(@Param('battleId') battleId: string) {
    return this.battleService.getBattleById(battleId);
  }

  @Get('persona/:personaId/history')
  async getPersonaBattleHistory(
    @Param('personaId') personaId: string,
    @Query('limit') limit?: string
  ) {
    return this.battleService.getPersonaBattleHistory(
      personaId,
      limit ? parseInt(limit) : 20
    );
  }
}
