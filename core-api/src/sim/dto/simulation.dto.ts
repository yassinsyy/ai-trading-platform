import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationScenarioDto {
  @ApiProperty({ description: 'Name of the simulation scenario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the simulation scenario' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Simulation parameters' })
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Priority level' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  @ApiProperty({ description: 'Simulation horizon in hours', minimum: 1, maximum: 168 })
  @IsNumber()
  @Min(1)
  @Max(168) // 1 week
  horizon: number;

  @ApiProperty({ description: 'Step size in hours', minimum: 0.25, maximum: 24 })
  @IsNumber()
  @Min(0.25)
  @Max(24)
  stepSize: number;
}

export class CompetitorAnalysisDto {
  @ApiProperty({ description: 'Array of SKU IDs to analyze' })
  @IsString({ each: true })
  @IsNotEmpty()
  skuIds: string[];

  @ApiProperty({ description: 'Time range for analysis' })
  @IsObject()
  timeRange: {
    start: string;
    end: string;
  };
}

export class CompetitorSimulationDto {
  @ApiProperty({ description: 'SKU ID for simulation' })
  @IsString()
  @IsNotEmpty()
  skuId: string;

  @ApiProperty({ description: 'Price change percentage' })
  @IsNumber()
  priceChange: number;

  @ApiProperty({ description: 'Timestamp for simulation' })
  @IsString()
  @IsNotEmpty()
  timestamp: string;
}

export class SimulationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  scenarioId?: string;

  @ApiPropertyOptional()
  result?: any;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class SimulationStateDto {
  @ApiPropertyOptional()
  currentScenario: any;

  @ApiProperty()
  currentStep: number;

  @ApiProperty()
  totalSteps: number;

  @ApiPropertyOptional()
  startTime: string | null;

  @ApiPropertyOptional()
  lastUpdateTime: string | null;

  @ApiProperty({ enum: ['IDLE', 'RUNNING', 'PAUSED', 'COMPLETED'] })
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

  @ApiProperty({ minimum: 0, maximum: 100 })
  progress: number;

  @ApiPropertyOptional()
  error: string | null;
}
