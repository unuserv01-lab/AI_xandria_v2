import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from './ai.service';
import { GachaService } from './gacha.service';
import { Keypair, PublicKey } from '@solana/web3.js';

@Injectable()
export class PersonasService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    private gacha: GachaService,
  ) {}

  async evaluatePrompt(prompt: string) {
    if (!prompt || prompt.length < 10) {
      throw new BadRequestException('Prompt too short (min 10 characters)');
    }

    const { score, usage } = await this.ai.evaluatePrompt(prompt);
    const { scoreTier, probabilities } = this.gacha.calculateProbabilitiesFromScore(score.total);

    const estimatedCost = this.calculateEstimatedCost();

    return {
      score,
      scoreTier,
      tierProbabilities: probabilities,
      estimatedCost,
      aiCost: usage.totalCost,
    };
  }

  async createPersona(dto: {
    prompt: string;
    userId: string;
    walletAddress: string;
  }) {
    // 1. Evaluate prompt
    const evaluation = await this.evaluatePrompt(dto.prompt);

    // 2. Roll tier
    const rolledTier = this.gacha.rollTier(evaluation.tierProbabilities);

    // 3. Generate persona with AI
    const { persona, usage } = await this.ai.generatePersona(dto.prompt, rolledTier);

    // 4. Generate avatar image
    const imageResult = await this.ai.generateImage(persona.name);

    // 5. Create on-chain (mock for now - will integrate Solana later)
    const mintAddress = Keypair.generate().publicKey.toString();
    const walletPda = Keypair.generate().publicKey.toString();

    // 6. Calculate total cost
    const totalCost = evaluation.aiCost + usage.totalCost + imageResult.cost + 0.002; // +blockchain

    // 7. Save to database
    const createdPersona = await this.prisma.persona.create({
      data: {
        mintAddress,
        walletPda,
        name: persona.name,
        tier: rolledTier.toUpperCase() as any,
        avatarUrl: imageResult.imageUrl,
        description: persona.description,
        intelligence: persona.traits.intelligence,
        creativity: persona.traits.creativity,
        persuasion: persona.traits.persuasion,
        empathy: persona.traits.empathy,
        technical: persona.traits.technical,
        ownerId: dto.userId,
        creatorId: dto.userId,
        promptText: dto.prompt,
        promptScore: evaluation.score,
        generationCost: totalCost,
      },
    });

    // 8. Save cost breakdown
    await this.prisma.generationCost.create({
      data: {
        personaId: createdPersona.id,
        promptEvaluationCost: evaluation.aiCost,
        textGenerationCost: usage.totalCost,
        imageGenerationCost: imageResult.cost,
        blockchainCost: 0.002,
        platformFee: totalCost * 0.1,
        totalUsd: totalCost,
        totalSol: totalCost / 150, // Mock SOL price
        solPriceUsd: 150,
      },
    });

    return {
      persona: createdPersona,
      tier: rolledTier,
      cost: totalCost,
    };
  }

  async getPersona(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        owner: true,
        creator: true,
        generationCostRecord: true,
      },
    });

    if (!persona) throw new BadRequestException('Persona not found');
    return persona;
  }

  async listPersonas(filters?: { tier?: string; ownerId?: string; limit?: number }) {
    return this.prisma.persona.findMany({
      where: {
        ...(filters?.tier && { tier: filters.tier as any }),
        ...(filters?.ownerId && { ownerId: filters.ownerId }),
      },
      take: filters?.limit || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: true,
        creator: true,
      },
    });
  }

  private calculateEstimatedCost(): {
    evaluation: number;
    generation: number;
    image: number;
    blockchain: number;
    platform: number;
    totalUsd: number;
    totalSol: number;
  } {
    const evaluation = 0.0005;
    const generation = 0.035;
    const image = 0.008;
    const blockchain = 0.002;
    const subtotal = evaluation + generation + image + blockchain;
    const platform = subtotal * 0.1;
    const totalUsd = subtotal + platform;
    const totalSol = totalUsd / 150; // Mock price

    return {
      evaluation,
      generation,
      image,
      blockchain,
      platform,
      totalUsd,
      totalSol,
    };
  }
}
