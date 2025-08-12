import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { kaspiConfig } from '../config/kaspi.config';

@Injectable()
export class PriceFeedPublisher {
  private readonly logger = new Logger(PriceFeedPublisher.name);
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: kaspiConfig.storage.endpoint,
      region: kaspiConfig.storage.region,
      credentials: {
        accessKeyId: kaspiConfig.storage.accessKeyId,
        secretAccessKey: kaspiConfig.storage.secretAccessKey
      },
      forcePathStyle: kaspiConfig.storage.forcePathStyle
    });
  }

  /**
   * Публикует XML фид в S3/MinIO и возвращает публичный URL
   */
  async publish(xml: string, merchantId: string): Promise<{ url: string; revision: string; key: string }> {
    try {
      // Создаем ревизию на основе содержимого XML
      const revision = this.generateRevision(xml);
      
      // Формируем ключ для S3
      const key = this.generateS3Key(merchantId, revision);
      
      // Проверяем, не публикуем ли мы тот же контент
      if (await this.isDuplicateContent(key, xml)) {
        this.logger.debug(`Duplicate content detected for merchant ${merchantId}, skipping upload`);
        const url = this.generatePublicUrl(key);
        return { url, revision, key };
      }

      // Загружаем XML в S3
      await this.uploadToS3(key, xml);
      
      // Генерируем публичный URL
      const url = this.generatePublicUrl(key);
      
      this.logger.log(`Price feed published successfully for merchant ${merchantId}: ${url}`);
      
      return { url, revision, key };
    } catch (error) {
      this.logger.error(`Failed to publish price feed for merchant ${merchantId}:`, error);
      throw new Error(`Price feed publication failed: ${error.message}`);
    }
  }

  /**
   * Генерирует ревизию на основе содержимого XML
   */
  private generateRevision(xml: string): string {
    return crypto.createHash('sha1').update(xml).digest('hex').slice(0, 10);
  }

  /**
   * Генерирует ключ для S3
   */
  private generateS3Key(merchantId: string, revision: string): string {
    const prefix = kaspiConfig.priceFeed.prefix.replace(/\/+$/, '');
    return `${prefix}${merchantId}/pricefeed-${revision}.xml`;
  }

  /**
   * Генерирует публичный URL для доступа к файлу
   */
  private generatePublicUrl(key: string): string {
    const baseUrl = kaspiConfig.priceFeed.publicBaseUrl.replace(/\/+$/, '');
    return `${baseUrl}/${key}`;
  }

  /**
   * Проверяет, не является ли контент дубликатом
   */
  private async isDuplicateContent(key: string, xml: string): Promise<boolean> {
    try {
      // Проверяем, существует ли объект с таким ключом
      await this.s3.send(new HeadObjectCommand({
        Bucket: kaspiConfig.storage.bucket,
        Key: key
      }));
      
      // Если объект существует, можно добавить дополнительную проверку содержимого
      // Для простоты считаем, что если ключ совпадает, то контент тот же
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      // Если ошибка не связана с отсутствием объекта, логируем и продолжаем
      this.logger.warn(`Error checking duplicate content for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Загружает XML в S3
   */
  private async uploadToS3(key: string, xml: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: kaspiConfig.storage.bucket,
      Key: key,
      Body: Buffer.from(xml, 'utf8'),
      ContentType: 'application/xml',
      CacheControl: 'public, max-age=300', // 5 минут кэша
      Metadata: {
        'generated-at': new Date().toISOString(),
        'content-type': 'price-feed',
        'marketplace': 'kaspi'
      }
    });

    await this.s3.send(command);
  }

  /**
   * Удаляет старые версии фидов (очистка)
   */
  async cleanupOldFeeds(merchantId: string, keepLast: number = 5): Promise<void> {
    try {
      // TODO: Реализовать очистку старых версий
      // Это можно сделать через S3 lifecycle policies или программно
      this.logger.debug(`Cleanup requested for merchant ${merchantId}, keeping last ${keepLast} feeds`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup old feeds for merchant ${merchantId}:`, error);
    }
  }

  /**
   * Проверяет доступность хранилища
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Простая проверка - пытаемся получить информацию о бакете
      await this.s3.send(new HeadObjectCommand({
        Bucket: kaspiConfig.storage.bucket,
        Key: 'health-check'
      }));
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        // Бакет доступен, но файл не найден - это нормально
        return true;
      }
      this.logger.error('Storage health check failed:', error);
      return false;
    }
  }
}
