import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/exceptionFilters/general.filter';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { OutputInterceptor } from './common/interceptors/output.interceptor';
import bodyParser from 'body-parser';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.enableCors();
  app.use(helmet());

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(Logger)),
    new OutputInterceptor(),
    new IdempotencyInterceptor(app.get(CACHE_MANAGER)),
  );
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));

  const config = new DocumentBuilder()
    .setTitle('Booking Backend')
    .setDescription('API Options')
    .setVersion('1.0')
    .addTag('Backend')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  await app.listen(3000);
}
bootstrap();
