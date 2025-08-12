import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsThrottlerGuard implements CanActivate {
  private readonly windowMs = 1000; // 1s окно
  private readonly max = 10;        // 10 событий/сек на соединение
  private readonly buckets = new Map<string, { ts:number; count:number }>();

  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient<Socket>();
    const key = client.id;
    const now = Date.now();
    const b = this.buckets.get(key);
    if (!b || now - b.ts > this.windowMs) {
      this.buckets.set(key, { ts: now, count: 1 });
      return true;
    }
    if (b.count >= this.max) throw new WsException('Too many events');
    b.count += 1;
    return true;
  }
}
