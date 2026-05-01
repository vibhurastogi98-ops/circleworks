import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
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

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
