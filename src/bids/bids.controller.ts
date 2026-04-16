import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { BidsService } from './bids.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Bid } from './entities/bid.entity';

@ApiTags('Bids')
@Controller('auctions/:auctionId/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Place a bid on an auction' })
  async placeBid(
    @Param('auctionId') auctionId: string,
    @Body() placeBidDto: PlaceBidDto,
    @Req() req: { user: User },
  ): Promise<Bid> {
    return this.bidsService.placeBid(auctionId, placeBidDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids for an auction' })
  async getBids(@Param('auctionId') auctionId: string): Promise<Bid[]> {
    return this.bidsService.getBidsForAuction(auctionId);
  }
}
