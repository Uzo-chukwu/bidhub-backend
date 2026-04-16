import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Auction } from '../auctions/entities/auction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
