import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProductSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  SKU = 'sku',
  BRAND = 'brand',
  CATEGORY = 'category',
}

export enum ProductSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class ProductFiltersDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ProductSortField)
  sortBy?: ProductSortField = ProductSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(ProductSortOrder)
  sortOrder?: ProductSortOrder = ProductSortOrder.DESC;

  @IsOptional()
  @IsString()
  search?: string;
}
