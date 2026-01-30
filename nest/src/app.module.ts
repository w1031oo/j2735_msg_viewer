import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsnModule } from './asn/asn.module';

@Module({
  imports: [AsnModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
