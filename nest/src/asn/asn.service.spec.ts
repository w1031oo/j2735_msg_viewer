import { Test, TestingModule } from '@nestjs/testing';
import { AsnService } from './asn.service';

describe('AsnService', () => {
  let service: AsnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsnService],
    }).compile();

    service = module.get<AsnService>(AsnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
