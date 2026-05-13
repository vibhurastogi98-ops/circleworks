import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AtsModule } from './modules/ats/ats.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { TimeModule } from './modules/time/time.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';
import { QueuesModule } from './queues/queues.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RateLimitMiddleware } from './common/rate-limits/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    EmployeesModule,
    PayrollModule,
    AtsModule,
    OnboardingModule,
    BenefitsModule,
    TimeModule,
    ExpensesModule,
    PerformanceModule,
    ComplianceModule,
    ReportsModule,
    NotificationsModule,
    SearchModule,
    AutomationsModule,
    WebhooksModule,
    WebsocketsModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService, RateLimitMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
