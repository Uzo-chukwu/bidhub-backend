import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserRole } from '../../common/enums/user-role.enum';
import { Auction } from '../../auctions/entities/auction.entity';
import { Bid } from '../../bids/entities/bid.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Auction, (auction) => auction.seller)
  auctions: Auction[];

  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[];
}
