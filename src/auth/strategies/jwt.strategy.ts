import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // TODO: Добавить проверку существования пользователя в БД
    // const user = await this.userService.findById(payload.sub);
    // if (!user || !user.isActive) {
    //   throw new UnauthorizedException('Пользователь не найден или деактивирован');
    // }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      merchantId: payload.merchantId,
    };
  }
}
