import { Controller, Get, Header, Param, ParseUUIDPipe, Post, Req, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor }                                                                                                    from '@nestjs/platform-express';
import { AuthGuard, type AuthRequest }                                                                                        from '../auth/auth.guard.js';
import { ReceiptsService }                                                                                                    from './receipts.service.js';


@Controller('api/receipts')
@UseGuards(AuthGuard)
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 } }))
  process(@Req() req: AuthRequest, @UploadedFile() file?: Express.Multer.File) { return this.service.process(req.user.id, file); }

  @Post(':id/ocr')
  @Header('Cache-Control', 'private, no-store')
  recognize(@Req() req: AuthRequest, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.service.recognize(req.user.id, id); }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async read(@Req() req: AuthRequest, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return new StreamableFile(await this.service.read(req.user.id, id), { type: 'image/png', disposition: `inline; filename="${id}.png"` });
  }

  @Get(':id/original')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async original(@Req() req: AuthRequest, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const { data, type, ext } = await this.service.original(req.user.id, id);
    return new StreamableFile(data, { type, disposition: `inline; filename="${id}.original.${ext}"` });
  }
}
