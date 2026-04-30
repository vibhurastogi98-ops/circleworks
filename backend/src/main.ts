import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sentry Integration
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.API_ENV || 'development',
    });
  }

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  // API Versioning
  app.setGlobalPrefix(`api/${process.env.API_VERSION || 'v1'}`);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CircleWorks API')
    .setDescription('HR & Payroll Platform REST API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' })
    .setContact('CircleWorks', 'https://circleworks.com', 'support@circleworks.com')
    .setLicense('MIT', 'https://github.com/circleworks/api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port, () => {
    console.log(`CircleWorks API running at http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/docs`);
  });
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
