import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModuleOptions, BullOptionsFactory } from '@nestjs/bull';

@Injectable()
export class RedisConfig implements BullOptionsFactory {
  constructor(private configService: ConfigService) {}

  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        db: this.configService.get('REDIS_DB', 0),
      },
      defaultJobOptions: {
        removeOnComplete: 100, // удалять завершённые задачи после 100
        removeOnFail: 50, // удалять неудачные задачи после 50
        attempts: 3, // количество попыток
        backoff: {
          type: 'exponential',
          delay: 2000, // начальная задержка 2 секунды
        },
      },
      limiter: {
        max: 1000, // максимальное количество задач в секунду
        duration: 1000,
      },
    };
  }
}
