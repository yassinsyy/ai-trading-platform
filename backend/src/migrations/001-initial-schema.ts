import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем схему core
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "core"`);
    
    // Устанавливаем схему по умолчанию
    await queryRunner.query(`SET search_path TO "core", public`);
    
    // Создаем расширение для UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Создаем расширение для JSONB
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем схему (осторожно!)
    // await queryRunner.query(`DROP SCHEMA IF EXISTS "core" CASCADE`);
    
    // В продакшене лучше не удалять схему автоматически
    console.log('Migration down: Schema "core" preserved for safety');
  }
}
