import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TasksModule } from './tasks/tasks.module';
import { NotesModule } from './notes/notes.module';
import { AchievementsModule } from './achievements/achievements.module';
import { MascotModule } from './mascot/mascot.module';
import { ShopModule } from './shop/shop.module';
import { HabitsModule } from './habits/habits.module';
import { EventsModule } from './events/events.module';
import { AudiusModule } from './audius/audius.module';
import { RecipesModule } from './recipes/recipes.module';
import { MissionsModule } from './missions/missions.module';
import { StatsModule } from './stats/stats.module';
import { SearchModule } from './search/search.module';
import { GoalsModule } from './goals/goals.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 🕕 Cron jobs (limpieza automática)
    ScheduleModule.forRoot(),

    // 🛡️ Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TasksModule,
    NotesModule,
    AchievementsModule,
    MascotModule,
    ShopModule,
    HabitsModule,
    EventsModule,
    AudiusModule,
    RecipesModule,
    MissionsModule,
    StatsModule,
    SearchModule,
    GoalsModule,
    PomodoroModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
