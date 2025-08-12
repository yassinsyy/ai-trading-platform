import { IsString, IsOptional, IsObject, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsObject()
  attributes?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    color?: string;
    material?: string;
    size?: string;
    [key: string]: any;
  };

  @IsOptional()
  @IsObject()
  compliance?: {
    requiresCertification?: boolean;
    restrictedWords?: string[];
    forbiddenClaims?: string[];
    requiredDocs?: string[];
    [key: string]: any;
  };

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    tags?: string[];
    certifications?: string[];
    documents?: string[];
    [key: string]: any;
  };

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;
}
