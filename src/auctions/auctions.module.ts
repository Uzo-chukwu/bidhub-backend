import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './entities/auction.entity';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [TypeOrmModule.forFeature([Auction]), forwardRef(() => BidsModule)],
  controllers: [AuctionsController],
  providers: [AuctionsService],
  exports: [AuctionsService, TypeOrmModule, forwardRef(() => BidsModule)],
})
export class AuctionsModule {}
