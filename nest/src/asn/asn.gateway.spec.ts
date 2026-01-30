import { Test, TestingModule } from '@nestjs/testing';
import { AsnGateway } from './asn.gateway';

describe('AsnGateway', () => {
  let gateway: AsnGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsnGateway],
    }).compile();

    gateway = module.get<AsnGateway>(AsnGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
