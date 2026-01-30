import { Test, TestingModule } from '@nestjs/testing';
import { AsnController } from './asn.controller';

describe('AsnController', () => {
  let controller: AsnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsnController],
    }).compile();

    controller = module.get<AsnController>(AsnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
