import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bid } from './entities/bid.entity';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Auction } from '../auctions/entities/auction.entity';
import { AuctionsService } from '../auctions/auctions.service';
import { AuctionStatus } from '../common/enums/auction-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,
    private readonly auctionsService: AuctionsService,
  ) {}

  async placeBid(
    auctionId: string,
    placeBidDto: PlaceBidDto,
    bidder: User,
  ): Promise<Bid> {
    // Get auction with relations
    const auction = await this.auctionsService.findOne(auctionId, bidder);

    // Check auction status is APPROVED
    if (auction.status !== AuctionStatus.APPROVED) {
      throw new BadRequestException(
        'Can only bid on approved auctions',
      );
    }

    // Check auction hasn't ended
    if (auction.endTime < new Date()) {
      throw new BadRequestException('Auction has ended');
    }

    // Check bidder is not the seller
    if (auction.sellerId === bidder.id) {
      throw new ForbiddenException('You cannot bid on your own auction');
    }

    // Check bid amount is greater than current price
    const currentPrice = parseFloat(String(auction.currentPrice));
    if (placeBidDto.amount <= currentPrice) {
      throw new BadRequestException(
        `Bid amount must be greater than current price ($${currentPrice})`,
      );
    }

    // Create the bid
    const bid = this.bidsRepository.create({
      amount: placeBidDto.amount,
      bidder,
      auction: { id: auction.id } as any,
    });

    const savedBid = await this.bidsRepository.save(bid);

    // Update auction current price
    auction.currentPrice = placeBidDto.amount;
    await this.auctionsRepository.save(auction);

    return savedBid;
  }

  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    // Verify auction exists and is approved
    const auction = await this.auctionsService.findOne(auctionId);

    if (auction.status !== AuctionStatus.APPROVED) {
      throw new NotFoundException('Auction not found');
    }

    return this.bidsRepository.find({
      where: { auctionId },
      relations: ['bidder'],
      order: { createdAt: 'ASC' },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        bidder: {
          id: true,
          username: true,
        },
      },
    });
  }
}
