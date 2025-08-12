import { Repository, DeepPartial, FindOptionsWhere, FindOneOptions } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

export class BaseService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data as DeepPartial<T>);
    return await this.repository.save(entity as DeepPartial<T>) as T;
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update({ id } as any, data as any);
    return await this.findById(id);
  }

  async bulkCreate(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = data.map(item => this.repository.create(item));
    return await this.repository.save(entities as any) as T[];
  }

  async bulkUpdate(ids: string[], data: DeepPartial<T>): Promise<number> {
    const result = await this.repository.update(ids as any, data as any);
    return result.affected ?? 0;
  }
}
