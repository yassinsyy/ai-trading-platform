import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DevGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>() as any;
    const isProd = process.env.NODE_ENV === 'production';
    const devKey = process.env.DEV_KEY || 'dev';
    const ok = !isProd || req.headers['x-dev-key'] === devKey;
    if (!ok) throw new ForbiddenException('Dev endpoint blocked');
    return ok;
  }
}
