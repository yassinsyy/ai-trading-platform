import { IsNumber, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPricingDto {
  @ApiProperty({ 
    description: 'New price to apply',
    example: 1200,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  newPrice: number;

  @ApiProperty({ 
    description: 'Reason for price change',
    example: 'Competitive pricing adjustment',
    required: false
  })
  @IsOptional()
  reason?: string;

  @ApiProperty({ 
    description: 'Priority level for price update',
    example: 1,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;
}
