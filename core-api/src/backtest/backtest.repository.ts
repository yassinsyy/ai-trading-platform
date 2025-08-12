import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BacktestResult, BacktestStatus } from '../entities/backtest-result.entity';
import { BacktestFiltersDto } from './dto';

@Injectable()
export class BacktestRepository {
  constructor(
    @InjectRepository(BacktestResult)
    private readonly backtestRepository: Repository<BacktestResult>,
  ) {}

  /**
   * Создание нового результата бэктестинга
   */
  async create(backtestData: Partial<BacktestResult>): Promise<BacktestResult> {
    const backtest = this.backtestRepository.create(backtestData);
    return await this.backtestRepository.save(backtest);
  }

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<BacktestResult | null> {
    return await this.backtestRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Поиск с фильтрацией и пагинацией
   */
  async findWithFilters(
    filters: BacktestFiltersDto,
    userId?: string,
  ): Promise<{ results: BacktestResult[]; total: number }> {
    const queryBuilder = this.createFilteredQuery(filters, userId);
    
    const [results, total] = await queryBuilder
      .orderBy('backtest.createdAt', 'DESC')
      .getManyAndCount();

    return { results, total };
  }

  /**
   * Обновление статуса
   */
  async updateStatus(
    id: string,
    status: BacktestStatus,
    additionalData?: Partial<BacktestResult>,
  ): Promise<BacktestResult | null> {
    const updateData: Partial<BacktestResult> = { status, ...additionalData };
    
    if (status === BacktestStatus.RUNNING) {
      updateData.startedAt = new Date();
    } else if (status === BacktestStatus.COMPLETED || status === BacktestStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    await this.backtestRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Обновление прогресса
   */
  async updateProgress(id: string, progress: number): Promise<void> {
    await this.backtestRepository.update(id, { progress });
  }

  /**
   * Обновление результатов
   */
  async updateResults(
    id: string,
    results: Partial<BacktestResult>,
  ): Promise<BacktestResult | null> {
    await this.backtestRepository.update(id, results);
    return await this.findById(id);
  }

  /**
   * Удаление
   */
  async delete(id: string): Promise<void> {
    await this.backtestRepository.delete(id);
  }

  /**
   * Получение метрик по всем бэктестам
   */
  async getMetricsSummary(userId?: string): Promise<{
    totalBacktests: number;
    completedBacktests: number;
    failedBacktests: number;
    averageExecutionTime: number;
    successRate: number;
    totalPnL: number;
    averageSharpeRatio: number;
  }> {
    const queryBuilder = this.backtestRepository
      .createQueryBuilder('backtest')
      .select([
        'COUNT(*) as totalBacktests',
        'COUNT(CASE WHEN backtest.status = :completedStatus THEN 1 END) as completedBacktests',
        'COUNT(CASE WHEN backtest.status = :failedStatus THEN 1 END) as failedBacktests',
        'AVG(CASE WHEN backtest.startedAt IS NOT NULL AND backtest.completedAt IS NOT NULL THEN EXTRACT(EPOCH FROM (backtest.completedAt - backtest.startedAt)) / 3600 END) as averageExecutionTime',
        'AVG(CASE WHEN backtest.summary IS NOT NULL THEN (backtest.summary->>\'totalPnL\')::numeric END) as totalPnL',
        'AVG(CASE WHEN backtest.riskMetrics IS NOT NULL THEN (backtest.riskMetrics->>\'sharpeRatio\')::numeric END) as averageSharpeRatio',
      ])
      .setParameters({
        completedStatus: BacktestStatus.COMPLETED,
        failedStatus: BacktestStatus.FAILED,
      });

    if (userId) {
      queryBuilder.andWhere('backtest.userId = :userId', { userId });
    }

    const result = await queryBuilder.getRawOne();

    const totalBacktests = parseInt(result.totalBacktests) || 0;
    const completedBacktests = parseInt(result.completedBacktests) || 0;
    const failedBacktests = parseInt(result.failedBacktests) || 0;
    const averageExecutionTime = parseFloat(result.averageExecutionTime) || 0;
    const totalPnL = parseFloat(result.totalPnL) || 0;
    const averageSharpeRatio = parseFloat(result.averageSharpeRatio) || 0;

    return {
      totalBacktests,
      completedBacktests,
      failedBacktests,
      averageExecutionTime,
      successRate: totalBacktests > 0 ? completedBacktests / totalBacktests : 0,
      totalPnL,
      averageSharpeRatio,
    };
  }

  /**
   * Создание запроса с фильтрами
   */
  private createFilteredQuery(
    filters: BacktestFiltersDto,
    userId?: string,
  ): SelectQueryBuilder<BacktestResult> {
    const queryBuilder = this.backtestRepository
      .createQueryBuilder('backtest')
      .leftJoinAndSelect('backtest.user', 'user');

    // Фильтр по статусу
    if (filters.status) {
      queryBuilder.andWhere('backtest.status = :status', { status: filters.status });
    }

    // Фильтр по тегам
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('backtest.tags && :tags', { tags: filters.tags });
    }

    // Фильтр по датам
    if (filters.dateFrom) {
      queryBuilder.andWhere('backtest.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('backtest.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Фильтр по пользователю
    if (userId) {
      queryBuilder.andWhere('backtest.userId = :userId', { userId });
    }

    // Пагинация
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    return queryBuilder;
  }

  /**
   * Поиск по имени (для проверки уникальности)
   */
  async findByName(name: string, userId?: string): Promise<BacktestResult | null> {
    const whereClause: any = { name };
    if (userId) {
      whereClause.userId = userId;
    }

    return await this.backtestRepository.findOne({ where: whereClause });
  }

  /**
   * Получение активных бэктестов
   */
  async findActiveBacktests(): Promise<BacktestResult[]> {
    return await this.backtestRepository.find({
      where: {
        status: BacktestStatus.RUNNING,
      },
      order: { priority: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Очистка старых результатов
   */
  async cleanupOldResults(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.backtestRepository
      .createQueryBuilder()
      .delete()
      .from(BacktestResult)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', {
        statuses: [BacktestStatus.COMPLETED, BacktestStatus.FAILED],
      })
      .execute();

    return result.affected || 0;
  }
}
