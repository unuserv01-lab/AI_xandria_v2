import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SolanaService } from './solana.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private solana: SolanaService,
  ) {}

  async getPersonaWallet(personaId: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      include: { owner: true, creator: true },
    });

    if (!persona) throw new BadRequestException('Persona not found');

    const balance = await this.solana.getBalance(persona.walletPda);
    
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { personaId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const earnings = {
      battle: 0,
      marketplace: 0,
      chat: 0,
      tip: 0,
      total: 0,
    };

    transactions.forEach(tx => {
      if (tx.transactionType === 'DEPOSIT' && tx.earningType) {
        const amount = Number(tx.amount);
        earnings[tx.earningType.toLowerCase() as keyof typeof earnings] += amount;
        earnings.total += amount;
      }
    });

    const totalWithdrawn = transactions
      .filter(tx => tx.transactionType === 'WITHDRAWAL')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      personaId,
      walletPda: persona.walletPda,
      balance,
      earnings,
      totalWithdrawn,
      pendingBalance: earnings.total - totalWithdrawn,
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        earningType: tx.earningType,
        amount: Number(tx.amount),
        txSignature: tx.txSignature,
        createdAt: tx.createdAt,
      })),
    };
  }

  async depositEarnings(
    personaId: string,
    amount: number,
    earningType: 'BATTLE' | 'MARKETPLACE' | 'CHAT' | 'TIP',
    relatedBattleId?: string
  ) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) throw new BadRequestException('Persona not found');

    const { signature, success } = await this.solana.depositToPersonaWallet(
      persona.walletPda,
      amount,
      persona.ownerWallet || persona.mintAddress // Mock payer
    );

    if (!success) throw new BadRequestException('Blockchain deposit failed');

    const transaction = await this.prisma.walletTransaction.create({
      data: {
        personaId,
        walletPda: persona.walletPda,
        transactionType: 'DEPOSIT',
        earningType,
        amount,
        relatedBattleId,
        txSignature: signature,
      },
    });

    await this.prisma.persona.update({
      where: { id: personaId },
      data: { totalRevenue: { increment: amount } },
    });

    return transaction;
  }

  async withdrawEarnings(personaId: string, amount: number, userId: string, destinationWallet: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      include: { owner: true },
    });

    if (!persona) throw new BadRequestException('Persona not found');
    if (persona.ownerId !== userId) {
      throw new ForbiddenException('Only persona owner can withdraw');
    }

    const wallet = await this.getPersonaWallet(personaId);
    if (wallet.pendingBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const { signature, success } = await this.solana.withdrawFromPersonaWallet(
      persona.walletPda,
      amount,
      persona.owner.walletAddress,
      destinationWallet
    );

    if (!success) throw new BadRequestException('Blockchain withdrawal failed');

    const transaction = await this.prisma.walletTransaction.create({
      data: {
        personaId,
        walletPda: persona.walletPda,
        transactionType: 'WITHDRAWAL',
        amount,
        txSignature: signature,
      },
    });

    return {
      transaction,
      newBalance: wallet.pendingBalance - amount,
      signature,
    };
  }

  async getTransactionHistory(personaId: string, limit: number = 100) {
    return this.prisma.walletTransaction.findMany({
      where: { personaId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { relatedBattle: true },
    });
  }
}
