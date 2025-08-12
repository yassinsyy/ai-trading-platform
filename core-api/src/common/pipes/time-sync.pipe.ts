import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CompetitorSnapshot } from '../../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';

export interface TimeSyncConfig {
  maxTimeWindowSeconds: number; // Maximum allowed time difference between snapshots
  timezone: string; // Default timezone for synchronization
}

@Injectable()
export class TimeSyncPipe implements PipeTransform {
  private readonly config: TimeSyncConfig = {
    maxTimeWindowSeconds: 300, // 5 minutes default
    timezone: 'UTC',
  };

  transform(value: any): any {
    if (this.isSnapshotData(value)) {
      return this.synchronizeTimestamp(value);
    }
    return value;
  }

  private isSnapshotData(value: any): boolean {
    return value instanceof CompetitorSnapshot || 
           value instanceof StockSnapshot ||
           (value && typeof value === 'object' && 'ts' in value);
  }

  private synchronizeTimestamp(snapshot: any): any {
    const now = new Date();
    const snapshotTime = new Date(snapshot.ts);
    
    // Ensure timestamp is in UTC
    if (snapshotTime.getTimezoneOffset() !== 0) {
      snapshot.ts = new Date(snapshotTime.getTime() - snapshotTime.getTimezoneOffset() * 60000);
    }

    // Add metadata about time synchronization
    if (!snapshot.metadata) {
      snapshot.metadata = {};
    }
    
    snapshot.metadata.timeSync = {
      originalTimestamp: snapshot.ts,
      synchronizedAt: now,
      timezone: this.config.timezone,
      maxWindowSeconds: this.config.maxTimeWindowSeconds,
    };

    return snapshot;
  }

  /**
   * Validate that multiple snapshots are within the allowed time window
   */
  validateTimeWindow(snapshots: Array<{ ts: Date }>): boolean {
    if (snapshots.length < 2) return true;

    const timestamps = snapshots.map(s => new Date(s.ts).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeDiff = (maxTime - minTime) / 1000; // Convert to seconds

    return timeDiff <= this.config.maxTimeWindowSeconds;
  }

  /**
   * Mark snapshots as incomplete if they don't meet time synchronization requirements
   */
  markIncompleteIfNeeded(snapshots: Array<{ ts: Date; metadata?: any }>): void {
    if (!this.validateTimeWindow(snapshots)) {
      snapshots.forEach(snapshot => {
        if (!snapshot.metadata) snapshot.metadata = {};
        snapshot.metadata.incomplete = true;
        snapshot.metadata.incompleteReason = 'Time window exceeded';
        snapshot.metadata.timeWindowExceeded = true;
      });
    }
  }

  /**
   * Filter out incomplete snapshots for training/testing datasets
   */
  filterCompleteSnapshots<T extends { metadata?: any }>(snapshots: T[]): T[] {
    return snapshots.filter(snapshot => 
      !snapshot.metadata?.incomplete && 
      !snapshot.metadata?.timeWindowExceeded
    );
  }
}
