import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // 모든 라우트에 'api' 접두사 추가
  app.enableCors(); // 모든 origin 허용
  await app.listen(process.env.PORT ?? 3301);
}
bootstrap();
