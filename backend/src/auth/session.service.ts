import { Injectable, Logger, ServiceUnavailableException, UnauthorizedException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { createHash, randomBytes, randomUUID }                                                                             from 'node:crypto';
import { createClient }                                                                                                    from 'redis';


@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(SessionService.name);
  private readonly db  = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379', disableOfflineQueue: true });

  async onModuleInit() {
    this.db.on('error', () => this.log.error('Redis connection failed'));
    await this.db.connect();
  }
  async onModuleDestroy() { if (this.db.isOpen) this.db.destroy(); }
  private digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
  private parse(token?: string) {
    if (typeof token !== 'string' || !/^[\da-f-]{36}\.[\da-f]{64}$/.test(token)) throw new UnauthorizedException('로그인이 필요합니다.');

    const [sid] = token.split('.');

    return { sid, key: `session:${sid}`, hash: this.digest(token) };
  }
  private async run<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.db.isReady) throw new ServiceUnavailableException('인증 서버에 연결할 수 없습니다.');

    try { return await fn(); }
    catch { throw new ServiceUnavailableException('인증 서버에 연결할 수 없습니다.'); }
  }
  async create(uid: number) {
    const sid   = randomUUID();
    const token = `${sid}.${randomBytes(32).toString('hex')}`;
    const ttl   = 7 * 24 * 60 * 60;

    await this.run(() => this.db.multi().hSet(`session:${sid}`, { uid: String(uid), hash: this.digest(token) }).expire(`session:${sid}`, ttl).exec());

    return { sid, token, ttl: ttl * 1000 };
  }
  async rotate(token?: string) {
    const data = this.parse(token);
    const next = `${data.sid}.${randomBytes(32).toString('hex')}`;

    const result = await this.run(() => this.db.eval(`
      local hash = redis.call('HGET', KEYS[1], 'hash')
      if not hash then return nil end
      if hash ~= ARGV[1] then redis.call('DEL', KEYS[1]); return nil end
      local uid = redis.call('HGET', KEYS[1], 'uid')
      local ttl = redis.call('PTTL', KEYS[1])
      if ttl <= 0 then redis.call('DEL', KEYS[1]); return nil end
      redis.call('HSET', KEYS[1], 'hash', ARGV[2])
      return {uid, ttl}
    `, { keys: [data.key], arguments: [data.hash, this.digest(next)] })) as [string, number] | null;

    if (!result) throw new UnauthorizedException('로그인이 만료되었습니다.');

    return { sid: data.sid, token: next, uid: Number(result[0]), ttl: result[1] };
  }
  async revoke(token?: string) {
    if (typeof token !== 'string' || !/^[\da-f-]{36}\.[\da-f]{64}$/.test(token)) return;

    const data = this.parse(token);

    await this.run(() => this.db.eval(`
      if redis.call('HGET', KEYS[1], 'hash') == ARGV[1] then return redis.call('DEL', KEYS[1]) end
      return 0
    `, { keys: [data.key], arguments: [data.hash] }));
  }
  async active(sid: string, uid: string) {
    return await this.run(() => this.db.hGet(`session:${sid}`, 'uid')) === uid;
  }
}
