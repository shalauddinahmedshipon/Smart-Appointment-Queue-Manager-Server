import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtGuard } from './common/guards/jwt.guard';
import { PrismaService } from './prisma/prisma.service';
import { setupSwagger } from './swagger/swagger.setup';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.enableCors({
    origin: ['http://localhost:3000','https://smart-appointment-queue-manager-cli.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const reflector = app.get(Reflector);
  const prisma = app.get(PrismaService);

  app.useGlobalGuards(
    new JwtGuard(reflector, prisma),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipUndefinedProperties: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

 setupSwagger(app);
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
