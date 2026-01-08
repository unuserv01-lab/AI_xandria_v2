import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async listPersona(personaId: string, price: number, userId: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) throw new BadRequestException('Persona not found');
    if (persona.ownerId !== userId) {
      throw new ForbiddenException('Only owner can list persona');
    }

    const existingListing = await this.prisma.marketplaceListing.findFirst({
      where: { personaId, status: 'ACTIVE' },
    });

    if (existingListing) {
      throw new BadRequestException('Persona already listed');
    }

    const listing = await this.prisma.marketplaceListing.create({
      data: {
        personaId,
        price,
        status: 'ACTIVE',
      },
      include: {
        persona: {
          include: { owner: true, creator: true },
        },
      },
    });

    return listing;
  }

  async cancelListing(listingId: string, userId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { persona: true },
    });

    if (!listing) throw new BadRequestException('Listing not found');
    if (listing.persona.ownerId !== userId) {
      throw new ForbiddenException('Only owner can cancel listing');
    }

    return this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    });
  }

  async buyPersona(listingId: string, buyerId: string, buyerWallet: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        persona: {
          include: { owner: true, creator: true },
        },
      },
    });

    if (!listing) throw new BadRequestException('Listing not found');
    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing not active');
    }

    const price = Number(listing.price);
    const platformFee = price * 0.025; // 2.5% platform fee
    const creatorRoyalty = price * 0.05; // 5% creator royalty
    const sellerAmount = price - platformFee - creatorRoyalty;

    // Update persona ownership
    await this.prisma.persona.update({
      where: { id: listing.personaId },
      data: { ownerId: buyerId },
    });

    // Update listing
    await this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        status: 'SOLD',
        soldAt: new Date(),
      },
    });

    // Record marketplace earnings for persona wallet
    await this.walletService.depositEarnings(
      listing.personaId,
      sellerAmount,
      'MARKETPLACE'
    );

    return {
      success: true,
      newOwner: buyerId,
      price,
      breakdown: {
        total: price,
        seller: sellerAmount,
        creator: creatorRoyalty,
        platform: platformFee,
      },
    };
  }

  async getActiveListings(filters?: {
    tier?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'rating' | 'recent';
    limit?: number;
  }) {
    const where: any = { status: 'ACTIVE' };

    if (filters?.tier) {
      where.persona = { tier: filters.tier };
    }

    if (filters?.minPrice !== undefined) {
      where.price = { gte: filters.minPrice };
    }

    if (filters?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice };
    }

    const orderBy: any = {};
    if (filters?.sortBy === 'price') orderBy.price = 'asc';
    else if (filters?.sortBy === 'recent') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    return this.prisma.marketplaceListing.findMany({
      where,
      orderBy,
      take: filters?.limit || 50,
      include: {
        persona: {
          include: { owner: true, creator: true },
        },
      },
    });
  }

  async getListingById(listingId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        persona: {
          include: {
            owner: true,
            creator: true,
            generationCostRecord: true,
          },
        },
      },
    });

    if (!listing) throw new BadRequestException('Listing not found');
    return listing;
  }

  async getMarketplaceStats() {
    const [totalListings, totalSold, avgPrice] = await Promise.all([
      this.prisma.marketplaceListing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.marketplaceListing.count({ where: { status: 'SOLD' } }),
      this.prisma.marketplaceListing.aggregate({
        where: { status: 'SOLD' },
        _avg: { price: true },
      }),
    ]);

    const volumeByTier = await this.prisma.marketplaceListing.groupBy({
      by: ['personaId'],
      where: { status: 'SOLD' },
      _sum: { price: true },
    });

    return {
      totalListings,
      totalSold,
      averagePrice: avgPrice._avg.price || 0,
      totalVolume: volumeByTier.reduce((sum, item) => sum + Number(item._sum.price || 0), 0),
    };
  }
}
