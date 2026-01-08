import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { IsString, IsNumber, Min } from 'class-validator';

class ListPersonaDto {
  @IsString()
  personaId: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsString()
  userId: string;
}

class BuyPersonaDto {
  @IsString()
  buyerId: string;

  @IsString()
  buyerWallet: string;
}

@Controller('api/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('list')
  async listPersona(@Body() dto: ListPersonaDto) {
    return this.marketplaceService.listPersona(dto.personaId, dto.price, dto.userId);
  }

  @Delete('listing/:listingId')
  async cancelListing(
    @Param('listingId') listingId: string,
    @Body('userId') userId: string
  ) {
    return this.marketplaceService.cancelListing(listingId, userId);
  }

  @Post('listing/:listingId/buy')
  async buyPersona(
    @Param('listingId') listingId: string,
    @Body() dto: BuyPersonaDto
  ) {
    return this.marketplaceService.buyPersona(listingId, dto.buyerId, dto.buyerWallet);
  }

  @Get('listings')
  async getActiveListings(
    @Query('tier') tier?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'price' | 'rating' | 'recent',
    @Query('limit') limit?: string
  ) {
    return this.marketplaceService.getActiveListings({
      tier,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('listing/:listingId')
  async getListingById(@Param('listingId') listingId: string) {
    return this.marketplaceService.getListingById(listingId);
  }

  @Get('stats')
  async getMarketplaceStats() {
    return this.marketplaceService.getMarketplaceStats();
  }
}
