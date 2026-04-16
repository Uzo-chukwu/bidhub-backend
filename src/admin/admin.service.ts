import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auction } from '../auctions/entities/auction.entity';
import { AuctionStatus } from '../common/enums/auction-status.enum';
import { QueryAdminAuctionsDto } from './dto/query-admin-auctions.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,
  ) {}

  async getPendingAuctions(): Promise<Auction[]> {
    return this.auctionsRepository.find({
      where: { status: AuctionStatus.PENDING },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveAuction(id: string): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== AuctionStatus.PENDING) {
      throw new BadRequestException(
        'Can only approve auctions with PENDING status',
      );
    }

    auction.status = AuctionStatus.APPROVED;
    auction.approvedAt = new Date();

    return this.auctionsRepository.save(auction);
  }

  async rejectAuction(id: string, rejectionReason?: string): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== AuctionStatus.PENDING) {
      throw new BadRequestException(
        'Can only reject auctions with PENDING status',
      );
    }

    auction.status = AuctionStatus.REJECTED;
    auction.rejectedAt = new Date();
    auction.rejectionReason = rejectionReason || null;

    return this.auctionsRepository.save(auction);
  }

  async getAllAuctions(
    queryDto: QueryAdminAuctionsDto,
  ): Promise<{ data: Auction[]; total: number }> {
    const { status, sellerId, page = 1, limit = 10 } = queryDto;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const [data, total] = await this.auctionsRepository.findAndCount({
      where,
      relations: ['seller', 'bids'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
