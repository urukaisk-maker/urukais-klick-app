import { Global, Module } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Global()
@Module({
  providers: [TranslateService],
  exports: [TranslateService],
})
export class CommonModule {}