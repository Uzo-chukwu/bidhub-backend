import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Auction } from '../../auctions/entities/auction.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, (user) => user.bids, { eager: false })
  @JoinColumn({ name: 'bidder_id' })
  bidder: User;

  @Column({ name: 'bidder_id' })
  bidderId: string;

  @ManyToOne(() => Auction, (auction) => auction.bids, { eager: false })
  @JoinColumn({ name: 'auction_id' })
  auction: Auction;

  @Column({ name: 'auction_id' })
  auctionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
