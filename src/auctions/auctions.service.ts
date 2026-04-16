import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';

import { Auction } from './entities/auction.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { QueryAuctionsDto } from './dto/query-auctions.dto';
import { AuctionStatus } from '../common/enums/auction-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,
  ) {}

  async create(
    createAuctionDto: CreateAuctionDto,
    seller: User,
  ): Promise<Auction> {
    // Validate endTime is in the future
    const endTime = new Date(createAuctionDto.endTime);
    if (endTime <= new Date()) {
      throw new BadRequestException('End time must be in the future');
    }

    const auction = this.auctionsRepository.create({
      ...createAuctionDto,
      currentPrice: createAuctionDto.startingPrice,
      status: AuctionStatus.PENDING,
      seller,
    });

    return this.auctionsRepository.save(auction);
  }

  async findAllPublic(
    queryDto: QueryAuctionsDto,
  ): Promise<{ data: Auction[]; total: number }> {
    const { search, sellerId, page = 1, limit = 10 } = queryDto;

    const where: any = { status: AuctionStatus.APPROVED };

    if (search) {
      where.title = Like(`%${search}%`);
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const [data, total] = await this.auctionsRepository.findAndCount({
      where,
      relations: ['seller', 'bids', 'bids.bidder'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string, user?: User): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['seller', 'bids', 'bids.bidder'],
      order: { bids: { createdAt: 'ASC' } },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Check auto-close
    this.checkAndMarkExpired(auction);

    // Public users can only view APPROVED auctions
    if (!user && auction.status !== AuctionStatus.APPROVED) {
      throw new NotFoundException('Auction not found');
    }

    // Non-admin and non-seller can only view APPROVED auctions
    if (
      user &&
      auction.status !== AuctionStatus.APPROVED &&
      user.id !== auction.sellerId &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException('You do not have access to this auction');
    }

    return auction;
  }

  async findMyListings(user: User): Promise<Auction[]> {
    return this.auctionsRepository.find({
      where: { sellerId: user.id },
      relations: ['seller', 'bids'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateAuctionDto: UpdateAuctionDto,
    user: User,
  ): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['bids'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Only seller can update
    if (auction.sellerId !== user.id) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    // Only PENDING auctions can be updated
    if (auction.status !== AuctionStatus.PENDING) {
      throw new ForbiddenException(
        'You can only update auctions that are pending',
      );
    }

    // Validate endTime if provided
    if (updateAuctionDto.endTime) {
      const endTime = new Date(updateAuctionDto.endTime);
      if (endTime <= new Date()) {
        throw new BadRequestException('End time must be in the future');
      }
      auction.endTime = endTime;
    }

    // Update other fields
    if (updateAuctionDto.title) {
      auction.title = updateAuctionDto.title;
    }
    if (updateAuctionDto.description) {
      auction.description = updateAuctionDto.description;
    }
    if (updateAuctionDto.imageUrl !== undefined) {
      auction.imageUrl = updateAuctionDto.imageUrl;
    }

    // If startingPrice changes and no bids exist, update currentPrice
    if (updateAuctionDto.startingPrice) {
      if (auction.bids && auction.bids.length > 0) {
        throw new BadRequestException(
          'Cannot update starting price after bids have been placed',
        );
      }
      auction.startingPrice = updateAuctionDto.startingPrice;
      auction.currentPrice = updateAuctionDto.startingPrice;
    }

    return this.auctionsRepository.save(auction);
  }

  async remove(id: string, user: User): Promise<void> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['bids'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Admin can delete any auction
    if (user.role === 'ADMIN') {
      await this.auctionsRepository.remove(auction);
      return;
    }

    // Seller can only delete PENDING auctions with no bids
    if (auction.sellerId !== user.id) {
      throw new ForbiddenException('You can only delete your own auctions');
    }

    if (auction.status !== AuctionStatus.PENDING) {
      throw new ForbiddenException(
        'You can only delete auctions that are pending',
      );
    }

    if (auction.bids && auction.bids.length > 0) {
      throw new ForbiddenException(
        'Cannot delete an auction that has bids',
      );
    }

    await this.auctionsRepository.remove(auction);
  }

  async checkAndMarkExpired(auction: Auction): Promise<void> {
    if (
      auction.status === AuctionStatus.APPROVED &&
      auction.endTime < new Date()
    ) {
      auction.status = AuctionStatus.CLOSED;
      await this.auctionsRepository.save(auction);
    }
  }
}
