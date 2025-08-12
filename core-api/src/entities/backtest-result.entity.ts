import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum BacktestStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum RecommendationType {
  PRICING = 'PRICING',
  INVENTORY = 'INVENTORY',
  COMPETITIVE = 'COMPETITIVE',
  RISK = 'RISK',
}

export enum RecommendationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('backtest_results')
@Index(['userId', 'status'])
@Index(['status', 'createdAt'])
@Index(['tags'])
export class BacktestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: BacktestStatus,
    default: BacktestStatus.PENDING,
  })
  status: BacktestStatus;

  @Column({ type: 'jsonb' })
  config: {
    startDate: string;
    endDate: string;
    timeWindow: number;
    includeCompetitorReactions: boolean;
    includeScenarios: boolean;
    scenarioCount: number;
    confidenceLevel: number;
    riskFreeRate: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  summary: {
    totalPnL: number;
    totalRevenue: number;
    totalCost: number;
    averageMargin: number;
    stockOutRate: number;
    daysOfCover: number;
    turnoverSpeed: number;
  };

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
  competitorAnalysis: {
    reactionCount: number;
    averageReactionTime: number;
    pricePressure: number;
    marketShareImpact: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  scenarioAnalysis: {
    bestCase: number;
    worstCase: number;
    expectedCase: number;
    confidenceInterval: { lower: number; upper: number };
    scenarioDistribution: Array<{ profit: number; probability: number }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  recommendations: Array<{
    type: RecommendationType;
    priority: RecommendationPriority;
    description: string;
    expectedImpact: number;
    implementation: string;
  }>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimatedCompletionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}
