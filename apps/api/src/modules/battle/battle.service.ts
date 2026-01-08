import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../personas/ai.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class BattleService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    private wallet: WalletService,
  ) {}

  async createBattle(dto: {
    persona1Id: string;
    persona2Id: string;
    topic: string;
    mode: 'CASUAL' | 'RANKED' | 'DEATHMATCH';
    initiatorId: string;
  }) {
    const [p1, p2] = await Promise.all([
      this.prisma.persona.findUnique({ where: { id: dto.persona1Id } }),
      this.prisma.persona.findUnique({ where: { id: dto.persona2Id } }),
    ]);

    if (!p1 || !p2) throw new BadRequestException('Persona not found');
    if (p1.isWounded || p2.isWounded) throw new BadRequestException('Persona is wounded');

    const entryFees = { CASUAL: 0, RANKED: 0.5, DEATHMATCH: 2 };
    const entryFee = entryFees[dto.mode];

    const battle = await this.prisma.battle.create({
      data: {
        battleMode: dto.mode,
        topic: dto.topic,
        persona1Id: dto.persona1Id,
        persona2Id: dto.persona2Id,
        initiatorId: dto.initiatorId,
        entryFee,
        status: 'PENDING',
      },
      include: { persona1: true, persona2: true },
    });

    return battle;
  }

  async startBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { persona1: true, persona2: true },
    });

    if (!battle) throw new BadRequestException('Battle not found');
    if (battle.status !== 'PENDING') throw new BadRequestException('Battle already started');

    const [arg1, arg2] = await Promise.all([
      this.ai.generateBattleArgument(battle.persona1, battle.topic),
      this.ai.generateBattleArgument(battle.persona2, battle.topic),
    ]);

    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        persona1Argument: arg1.argument.argument,
        persona2Argument: arg2.argument.argument,
        status: 'ARGUING',
      },
    });

    return {
      persona1Argument: arg1.argument,
      persona2Argument: arg2.argument,
    };
  }

  async judgeBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { persona1: true, persona2: true },
    });

    if (!battle || !battle.persona1Argument || !battle.persona2Argument) {
      throw new BadRequestException('Battle not ready for judgment');
    }

    const { result } = await this.ai.judgeBattle(
      battle.topic,
      battle.persona1,
      battle.persona1Argument,
      battle.persona2,
      battle.persona2Argument,
    );

    const winnerId = result.winner === 'persona1' ? battle.persona1Id : battle.persona2Id;
    const loserId = result.winner === 'persona1' ? battle.persona2Id : battle.persona1Id;

    const rewards = this.calculateRewards(battle.battleMode, Number(battle.entryFee));

    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        winnerId,
        judgeResult: result as any,
        winnerReward: rewards.winner,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update stats
    await Promise.all([
      this.prisma.persona.update({
        where: { id: winnerId },
        data: {
          battlesWon: { increment: 1 },
          eloRating: { increment: battle.battleMode === 'RANKED' ? 25 : 10 },
        },
      }),
      this.prisma.persona.update({
        where: { id: loserId },
        data: {
          battlesLost: { increment: 1 },
          eloRating: { decrement: battle.battleMode === 'CASUAL' ? 20 : 30 },
          isWounded: battle.battleMode === 'RANKED',
          woundedUntil: battle.battleMode === 'RANKED' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
            : null,
        },
      }),
    ]);

    // Distribute earnings
    if (rewards.winner > 0) {
      await this.wallet.depositEarnings(winnerId, rewards.winner, 'BATTLE', battleId);
    }

    return { winner: winnerId, result, rewards };
  }

  private calculateRewards(mode: string, entryFee: number) {
    const totalPool = entryFee * 2;
    if (mode === 'CASUAL') return { winner: 0, creator: 0, platform: 0 };

    const winnerShare = mode === 'DEATHMATCH' ? 0.8 : 0.7;
    const winner = totalPool * winnerShare;
    const creator = winner * 0.2;
    const platform = totalPool - winner;

    return { winner, creator, platform };
  }

  async getLeaderboard(limit: number = 50) {
    return this.prisma.persona.findMany({
      take: limit,
      orderBy: { eloRating: 'desc' },
      include: { owner: true },
    });
  }

  async getBattleById(battleId: string) {
    return this.prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        persona1: true,
        persona2: true,
        winner: true,
        initiator: true,
      },
    });
  }

  async getPersonaBattleHistory(personaId: string, limit: number = 20) {
    return this.prisma.battle.findMany({
      where: {
        OR: [
          { persona1Id: personaId },
          { persona2Id: personaId },
        ],
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      include: {
        persona1: true,
        persona2: true,
        winner: true,
      },
    });
  }
}
