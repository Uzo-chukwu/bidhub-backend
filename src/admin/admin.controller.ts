import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { RejectAuctionDto } from './dto/reject-auction.dto';
import { QueryAdminAuctionsDto } from './dto/query-admin-auctions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Auction } from '../auctions/entities/auction.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('auctions/pending')
  @ApiOperation({ summary: 'Get all pending auctions (admin only)' })
  async getPendingAuctions(): Promise<Auction[]> {
    return this.adminService.getPendingAuctions();
  }

  @Get('auctions')
  @ApiOperation({ summary: 'Get all auctions with filters (admin only)' })
  async getAllAuctions(
    @Query() queryDto: QueryAdminAuctionsDto,
  ): Promise<{ data: Auction[]; total: number }> {
    return this.adminService.getAllAuctions(queryDto);
  }

  @Patch('auctions/:id/approve')
  @ApiOperation({ summary: 'Approve a pending auction (admin only)' })
  async approveAuction(
    @Param('id') id: string,
  ): Promise<Auction> {
    return this.adminService.approveAuction(id);
  }

  @Patch('auctions/:id/reject')
  @ApiOperation({ summary: 'Reject a pending auction (admin only)' })
  async rejectAuction(
    @Param('id') id: string,
    @Body() rejectAuctionDto: RejectAuctionDto,
  ): Promise<Auction> {
    return this.adminService.rejectAuction(
      id,
      rejectAuctionDto.rejectionReason,
    );
  }
}
