import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token || client.handshake.headers['authorization']?.toString()?.replace(/^Bearer\s+/,'');
    if (!token) throw new WsException('Unauthorized');
    try {
      const payload = this.jwt.verify(token);
      (client as any).user = payload;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }
}
