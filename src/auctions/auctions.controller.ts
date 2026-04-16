import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { QueryAuctionsDto } from './dto/query-auctions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Auction } from './entities/auction.entity';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new auction (requires auth)' })
  async create(
    @Body() createAuctionDto: CreateAuctionDto,
    @Req() req: { user: User },
  ): Promise<Auction> {
    return this.auctionsService.create(createAuctionDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all approved public auctions' })
  async findAll(@Query() queryDto: QueryAuctionsDto) {
    return this.auctionsService.findAllPublic(queryDto);
  }

  @Get('my/listings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my auction listings' })
  async findMyListings(@Req() req: { user: User }): Promise<Auction[]> {
    return this.auctionsService.findMyListings(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single auction by ID' })
  async findOne(
    @Param('id') id: string,
    @Req() req?: { user: User },
  ): Promise<Auction> {
    return this.auctionsService.findOne(id, req?.user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an auction (seller only, PENDING status)' })
  async update(
    @Param('id') id: string,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @Req() req: { user: User },
  ): Promise<Auction> {
    return this.auctionsService.update(id, updateAuctionDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an auction (seller or admin)' })
  async remove(
    @Param('id') id: string,
    @Req() req: { user: User },
  ): Promise<void> {
    return this.auctionsService.remove(id, req.user);
  }
}
