import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // TODO: Добавить UserService и PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Реализовать поиск пользователя в БД
    // const user = await this.userService.findByEmail(email);
    // if (user && await bcrypt.compare(password, user.password)) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    // return null;
    
    // Временная заглушка для MVP
    if (email === 'admin@example.com' && password === 'password') {
      return {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'OWNER',
        merchantId: '1',
      };
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      merchantId: user.merchantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        merchantId: user.merchantId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // TODO: Реализовать регистрацию пользователя
    // Проверка существования email
    // Хеширование пароля
    // Создание пользователя в БД
    
    throw new Error('Регистрация пока не реализована');
  }

  async refreshToken(userId: string) {
    // TODO: Реализовать обновление токена
    // Проверка refresh token
    // Генерация нового access token
    
    throw new Error('Обновление токена пока не реализовано');
  }
}
