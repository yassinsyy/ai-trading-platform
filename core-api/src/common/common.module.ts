import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TimeSyncPipe } from './pipes/time-sync.pipe';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TimeSyncPipe],
  exports: [ConfigModule, TimeSyncPipe],
})
export class CommonModule {}
