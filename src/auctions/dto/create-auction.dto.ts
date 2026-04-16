import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({ example: 'Vintage Watch Collection' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'A rare vintage watch from the 1960s in excellent condition' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 100.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  startingPrice: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
