import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class AsnService {
  private readonly logger = new Logger(AsnService.name);

  async decodeUper(hexData: string): Promise<any> {
    // NestJS 루트를 기준으로 파이썬 경로 설정
    const pythonPath = path.join(
      process.cwd(),
      'python',
      'venv',
      'Scripts',
      'python.exe',
    );
    const scriptPath = path.join(process.cwd(), 'python', 'decode.py');

    //명령어 실행
    // 데이터가 많을 수 있으므로 maxBuffer를 기본값(200KB)보다 크게 설정하는 것이 안전합니다.
    const { stdout, stderr } = await execAsync(
      `"${pythonPath}" "${scriptPath}" ${hexData}`,
      {
        maxBuffer: 1024 * 1024 * 10, // 10MB까지 허용 (큰 MAP 데이터 대비)
      },
    );

    if (stderr) {
      this.logger.warn(`Python Warning/Stderr: ${stderr}`);
    }

    // 파이썬이 print(json.dumps(...)) 한 내용을 파싱
    return JSON.parse(stdout);
  }
  // async decodeUper(hexData: string): Promise<any> {
  //   try {
  //     // 파이썬 실행 경로와 스크립트 경로 지정
  //     // venv를 사용 중이라면 venv 안의 python.exe 경로를 입력해야 합니다.
  //     const pythonPath = './backend/venv/Scripts/python.exe';
  //     const scriptPath = './backend/decode.py';

  //     const { stdout, stderr } = await execAsync(
  //       `"${pythonPath}" "${scriptPath}" ${hexData}`,
  //     );

  //     if (stderr) {
  //       console.error('Python Error:', stderr);
  //     }

  //     return JSON.parse(stdout);
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Unknown error';
  //     console.log('Decoding error:', message);
  //     throw new Error(`UPER decode failed: ${message}`);
  //   }
  // }

  async decodeMapMessage(uperData: string) {
    try {
      // 프로젝트 루트 기준 경로
      const scriptPath = path.join(process.cwd(), 'scripts', 'decode_uper.py');
      console.log('Executing script at:', scriptPath);

      const { stdout } = await execAsync(`python ${scriptPath} ${uperData}`);
      console.log('Script output:', stdout);

      return JSON.parse(stdout);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log('Decoding error:', message);
      throw new Error(`UPER decode failed: ${message}`);
    }
  }

  private parseMapData(asn1Result: any) {
    // J2735 MAP 메시지 구조 파싱
    const values = asn1Result.valueBlock.value;

    return {
      msgID: this.getInteger(values[0]),
      timeStamp: this.getInteger(values[1]),
      intersections: this.parseIntersections(values[2]),
    };
  }

  private parseIntersections(data: any) {
    const intersections: any[] = [];
    const items = data.valueBlock.value;

    for (const item of items) {
      intersections.push({
        id: this.getInteger(item.valueBlock.value[0]),
        refPoint: this.parsePosition(item.valueBlock.value[1]),
        laneSet: this.parseLanes(item.valueBlock.value[2]),
      });
    }

    return intersections;
  }

  private parseLanes(data: any) {
    // Lane 데이터 파싱
    return data.valueBlock.value.map((lane) => ({
      laneID: this.getInteger(lane.valueBlock.value[0]),
      nodes: this.parseNodes(lane.valueBlock.value[1]),
    }));
  }

  private parsePosition(data: any) {
    return {
      lat: this.getInteger(data.valueBlock.value[0]) / 10000000,
      lon: this.getInteger(data.valueBlock.value[1]) / 10000000,
    };
  }

  private parseNodes(data: any) {
    return data.valueBlock.value.map((node) => ({
      x: this.getInteger(node.valueBlock.value[0]),
      y: this.getInteger(node.valueBlock.value[1]),
    }));
  }

  private getInteger(data: any): number {
    return data.valueBlock.valueDec || 0;
  }
}
