import { Module } from '@nestjs/common';
import { AsnService } from './asn.service';
import { AsnController } from './asn.controller';
import { AsnGateway } from './asn.gateway';

@Module({
  providers: [AsnService, AsnGateway],
  controllers: [AsnController]
})
export class AsnModule {}
