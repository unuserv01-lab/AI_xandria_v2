import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { IsString, MinLength, IsOptional } from 'class-validator';

class EvaluatePromptDto {
  @IsString()
  @MinLength(10)
  prompt: string;
}

class CreatePersonaDto {
  @IsString()
  @MinLength(10)
  prompt: string;

  @IsString()
  userId: string;

  @IsString()
  walletAddress: string;
}

@Controller('api/personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post('evaluate-prompt')
  async evaluatePrompt(@Body() dto: EvaluatePromptDto) {
    return this.personasService.evaluatePrompt(dto.prompt);
  }

  @Post('create')
  async createPersona(@Body() dto: CreatePersonaDto) {
    return this.personasService.createPersona(dto);
  }

  @Get(':id')
  async getPersona(@Param('id') id: string) {
    return this.personasService.getPersona(id);
  }

  @Get()
  async listPersonas(
    @Query('tier') tier?: string,
    @Query('ownerId') ownerId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.personasService.listPersonas({
      tier,
      ownerId,
      limit: limit ? parseInt(limit) : 50,
    });
  }
}
