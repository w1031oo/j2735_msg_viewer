import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 모든 origin 허용
  await app.listen(process.env.PORT ?? 3301);
}
bootstrap();
