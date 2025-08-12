import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BacktestConfigDto {
  @ApiProperty({
    description: 'Start date for backtesting (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for backtesting (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Time window in minutes for data aggregation',
    example: 15,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  timeWindow: number;

  @ApiProperty({
    description: 'Include competitor reaction simulation',
    example: true
  })
  @IsBoolean()
  includeCompetitorReactions: boolean;

  @ApiProperty({
    description: 'Include risk scenario generation',
    example: true
  })
  @IsBoolean()
  includeScenarios: boolean;

  @ApiProperty({
    description: 'Number of scenarios to generate',
    example: 1000,
    minimum: 100,
    maximum: 10000
  })
  @IsNumber()
  @Min(100)
  @Max(10000)
  scenarioCount: number;

  @ApiProperty({
    description: 'Confidence level for VaR/CVaR calculations (0-1)',
    example: 0.95,
    minimum: 0.5,
    maximum: 0.99
  })
  @IsNumber()
  @Min(0.5)
  @Max(0.99)
  confidenceLevel: number;

  @ApiProperty({
    description: 'Risk-free rate for Sharpe ratio calculation',
    example: 0.02
  })
  @IsNumber()
  riskFreeRate: number;
}

export class CreateBacktestDto {
  @ApiProperty({
    description: 'Name/identifier for the backtest',
    example: 'Q4-2024-Pricing-Strategy'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the backtest scenario',
    example: 'Testing new dynamic pricing strategy for Q4 2024'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Backtest configuration',
    type: BacktestConfigDto
  })
  @ValidateNested()
  @Type(() => BacktestConfigDto)
  config: BacktestConfigDto;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the backtest',
    example: ['pricing', 'q4-2024', 'dynamic-strategy']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Priority level for execution',
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH']
  })
  @IsOptional()
  @IsString()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class BacktestResultDto {
  @ApiProperty({
    description: 'Unique identifier for the backtest result'
  })
  id: string;

  @ApiProperty({
    description: 'Backtest name'
  })
  name: string;

  @ApiProperty({
    description: 'Execution status',
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']
  })
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({
    description: 'Execution start time'
  })
  startedAt: string;

  @ApiPropertyOptional({
    description: 'Execution completion time'
  })
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Error message if failed'
  })
  error?: string;

  @ApiProperty({
    description: 'Summary metrics',
    type: 'object'
  })
  summary: {
    totalPnL: number;
    totalRevenue: number;
    totalCost: number;
    averageMargin: number;
    stockOutRate: number;
    daysOfCover: number;
    turnoverSpeed: number;
  };

  @ApiProperty({
    description: 'Risk metrics',
    type: 'object'
  })
  riskMetrics: {
    var95: number;
    cvar95: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    volatility: number;
    skewness: number;
    kurtosis: number;
  };

  @ApiProperty({
    description: 'Daily performance metrics',
    type: 'array'
  })
  dailyMetrics: Array<{
    date: string;
    pnl: number;
    revenue: number;
    cost: number;
    margin: number;
    unitsSold: number;
    stockLevel: number;
    price: number;
  }>;

  @ApiProperty({
    description: 'Competitor analysis results',
    type: 'object'
  })
  competitorAnalysis: {
    reactionCount: number;
    averageReactionTime: number;
    pricePressure: number;
    marketShareImpact: number;
  };

  @ApiProperty({
    description: 'Scenario analysis results',
    type: 'object'
  })
  scenarioAnalysis: {
    bestCase: number;
    worstCase: number;
    expectedCase: number;
    confidenceInterval: { lower: number; upper: number };
    scenarioDistribution: Array<{ profit: number; probability: number }>;
  };

  @ApiProperty({
    description: 'Generated recommendations',
    type: 'array'
  })
  recommendations: Array<{
    type: 'PRICING' | 'INVENTORY' | 'COMPETITIVE' | 'RISK';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    expectedImpact: number;
    implementation: string;
  }>;
}

export class BacktestListDto {
  @ApiProperty({
    description: 'List of backtest results',
    type: [BacktestResultDto]
  })
  results: BacktestResultDto[];

  @ApiProperty({
    description: 'Total count of backtests'
  })
  total: number;

  @ApiProperty({
    description: 'Current page number'
  })
  page: number;

  @ApiProperty({
    description: 'Page size'
  })
  limit: number;
}

export class BacktestFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['pricing', 'q4-2024']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Filter by date range start',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range end',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size for pagination',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
