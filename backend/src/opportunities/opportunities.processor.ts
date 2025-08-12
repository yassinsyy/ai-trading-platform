import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('opportunities')
export class OpportunitiesProcessor {
  @Process('process-opportunity')
  async handleProcessOpportunity(job: Job) {
    // Process opportunity logic here
    console.log('Processing opportunity:', job.data);
  }
}
