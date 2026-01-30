import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { AsnService } from './asn.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AsnGateway {
  constructor(private asnService: AsnService) {}

  @SubscribeMessage('decode-map')
  async handleDecode(
    @MessageBody() data: { uperData: string; fileName: string },
  ) {
    try {
      const jsonData = await this.asnService.decodeMapMessage(data.uperData);
      console.log('jsonData:', jsonData);

      return {
        event: 'map-decoded',
        data: {
          jsonData,
          fileName: data.fileName,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        event: 'decode-error',
        data: {
          error: message,
          fileName: data.fileName,
        },
      };
    }
  }
}
