import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectAuctionDto {
  @ApiPropertyOptional({ example: 'Item does not meet platform guidelines' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
