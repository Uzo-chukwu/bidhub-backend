import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuctionDto {
  @ApiPropertyOptional({ example: 'Updated Vintage Watch Collection' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: 150.00, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  startingPrice?: number;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
