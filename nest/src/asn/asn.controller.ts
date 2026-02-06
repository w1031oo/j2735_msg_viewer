/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AsnService } from './asn.service';

@Controller('asn')
export class AsnController {
  logger = new Logger(AsnController.name);

  constructor(private readonly uperService: AsnService) {}

  @Post('decode')
  async decodeUper(@Body() body: { hexData: string; fileName: string }) {
    this.logger.log(`Try to decoded data for file ${body.fileName}`);

    const result = await this.uperService.decodeUper(body.hexData);

    this.logger.log(`Successfully decoded data for file ${body.fileName}`);

    return { jsonData: result, fileName: body.fileName };
  }

  @Get('files/:folder')
  getFileList(@Param('folder') folder: string) {
    try {
      const folderPath = path.join(
        process.cwd(),
        '..',
        'vue',
        'public',
        'map',
        folder,
      );
      const files = fs.readdirSync(folderPath);

      return files.map((name) => ({
        name,
        path: `/map/${folder}/${name}`,
      }));
    } catch (error) {
      return [];
    }
  }
}
