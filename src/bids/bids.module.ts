import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid } from './entities/bid.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Auction]),
    forwardRef(() => AuctionsModule),
  ],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService, TypeOrmModule],
})
export class BidsModule {}
