import { BadGatewayException, BadRequestException, GatewayTimeoutException, HttpException, Injectable, NotFoundException, ServiceUnavailableException, UnsupportedMediaTypeException } from '@nestjs/common';
import { randomUUID }                                                                                                                                                                  from 'node:crypto';
import { access, mkdir, readFile, unlink, writeFile }                                                                                                                                  from 'node:fs/promises';
import { join, resolve }                                                                                                                                                               from 'node:path';


@Injectable()
export class ReceiptsService {
  private readonly root = resolve('uploads');

  async process(userId: number, file?: Express.Multer.File) {
    if (!file?.buffer.length) throw new BadRequestException('이미지를 선택해주세요.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) throw new UnsupportedMediaTypeException('JPG, PNG, WebP 이미지만 사용할 수 있습니다.');

    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), 'receipt');

    const url = process.env.FASTAPI_URL ?? 'http://localhost:8000';
    let data: { result?: unknown; detail?: unknown };
    let res: Response;

    try {
      res = await fetch(`${url}/process`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
      data = await res.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') throw new GatewayTimeoutException('이미지 처리 시간이 초과되었습니다. 다시 시도해주세요.');
      throw new ServiceUnavailableException('이미지 처리 서버에 연결할 수 없습니다.');
    }

    if (!res.ok) {
      const status = [400, 413, 415, 422, 503].includes(res.status) ? res.status : 502;
      throw new HttpException(typeof data.detail === 'string' ? data.detail : '이미지를 처리하지 못했습니다.', status);
    }

    if (typeof data.result !== 'string' || data.result.length > 24 * 1024 * 1024) throw new BadGatewayException('잘못된 이미지 처리 결과입니다.');

    const result = Buffer.from(data.result, 'base64');
    if (!result.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw new BadGatewayException('잘못된 이미지 처리 결과입니다.');

    const id   = randomUUID();
    const dir  = join(this.root, String(userId));
    const path = join(dir, `${id}.png`);

    await mkdir(dir, { recursive: true });

    try { await writeFile(path, result, { flag: 'wx' }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') await unlink(path).catch(() => {});
      throw error;
    }

    return { result: id };
  }
  async path(userId: number, id: string) {
    if (!/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) throw new NotFoundException('사진을 찾을 수 없습니다.');

    const path = join(this.root, String(userId), `${id}.png`);

    try { await access(path); }
    catch { throw new NotFoundException('사진을 찾을 수 없습니다.'); }

    return path;
  }
  async read(userId: number, id: string) { return readFile(await this.path(userId, id)); }
}
