import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DailyRewardService } from './daily-reward.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DailyRewardService],
  exports: [DailyRewardService],
})
export class UsersModule {}
