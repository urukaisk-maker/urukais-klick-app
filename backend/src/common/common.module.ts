import { Global, Module } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { SessionCleanupService } from './tasks/session-cleanup.service';
import { EmailService } from './email/email.service';

@Global()
@Module({
  providers: [TranslateService, SessionCleanupService, EmailService],
  exports: [TranslateService, EmailService],
})
export class CommonModule {}
