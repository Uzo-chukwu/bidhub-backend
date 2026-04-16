import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Bid } from '../../bids/entities/bid.entity';
import { AuctionStatus } from '../../common/enums/auction-status.enum';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'starting_price' })
  startingPrice: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'current_price' })
  currentPrice: number;

  @Column({ nullable: true, name: 'image_url', type: 'varchar' })
  imageUrl: string | null;

  @Column({ type: 'timestamp', name: 'end_time' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.PENDING,
  })
  status: AuctionStatus;

  @ManyToOne(() => User, (user) => user.auctions, { eager: false })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'seller_id' })
  sellerId: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @Column({ nullable: true, name: 'approved_at', type: 'timestamp' })
  approvedAt: Date | null;

  @Column({ nullable: true, name: 'rejected_at', type: 'timestamp' })
  rejectedAt: Date | null;

  @Column({ nullable: true, name: 'rejection_reason', type: 'varchar' })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
