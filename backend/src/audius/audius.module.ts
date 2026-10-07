import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AudiusService } from './audius.service';
import { AudiusController } from './audius.controller';

@Module({
  imports: [HttpModule],
  controllers: [AudiusController],
  providers: [AudiusService],
  exports: [AudiusService],
})
export class AudiusModule {}
