import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email пользователя' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'IP адрес', required: false })
  @IsString()
  @IsOptional()
  ip?: string;
}
