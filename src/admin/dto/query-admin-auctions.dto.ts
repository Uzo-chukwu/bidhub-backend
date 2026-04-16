import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuctionStatus } from '../../common/enums/auction-status.enum';

export class QueryAdminAuctionsDto {
  @ApiPropertyOptional({
    enum: AuctionStatus,
    example: AuctionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;

  @ApiPropertyOptional({ example: 'seller-uuid' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  limit?: number = 10;
}
