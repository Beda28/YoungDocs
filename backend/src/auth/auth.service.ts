import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }                                           from '@nestjs/jwt';
import { InjectRepository }                                     from '@nestjs/typeorm';
import { Repository, QueryFailedError }                         from 'typeorm';
import { User }                                                 from './user.entity.js';
import { SessionService }                                       from './session.service.js';
import { hash, verify }                                         from './password.js';
import type { AuthDto }                                         from './auth.dto.js';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt:      JwtService,
    private readonly sessions: SessionService,
  ) {}
  private profile(user: User) { return { id: user.id, name: user.name }; }
  private async issue(user: User, session: { sid: string; token: string; ttl: number }) {
    const access = await this.jwt.signAsync({ sub: String(user.id), sid: session.sid, type: 'access' });

    return { access, user: this.profile(user), refresh: session.token, ttl: session.ttl };
  }
  async signup(data: AuthDto, old?: string) {
    const user = this.users.create({ ...data, password: await hash(data.password) });

    try { await this.users.save(user); }
    catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 가입된 아이디 / 닉네임입니다.');
      }
      throw error;
    }

    await this.sessions.revoke(old);

    return this.issue(user, await this.sessions.create(user.id));
  }
  async login(data: AuthDto, old?: string) {
    const user = await this.users.findOne({ where: { name: data.name }, select: { id: true, name: true, password: true } });
    const valid = await verify(data.password, user?.password);
    if (!user || !valid) throw new UnauthorizedException('아이디 / 닉네임 또는 비밀번호를 확인해주세요.');

    await this.sessions.revoke(old);

    return this.issue(user, await this.sessions.create(user.id));
  }
  async refresh(token?: string) {
    const session = await this.sessions.rotate(token);
    const user    = await this.users.findOneBy({ id: session.uid });

    if (!user) {
      await this.sessions.revoke(session.token);
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.issue(user, session);
  }
  async authenticate(token: string) {
    let data: { sub: string; sid: string; type: string };

    try { data = await this.jwt.verifyAsync(token); }
    catch { throw new UnauthorizedException('로그인이 필요합니다.'); }

    if (data.type !== 'access' || typeof data.sub !== 'string' || typeof data.sid !== 'string') throw new UnauthorizedException();
    if (!await this.sessions.active(data.sid, data.sub)) throw new UnauthorizedException('로그인이 만료되었습니다.');

    const user = await this.users.findOneBy({ id: Number(data.sub) });

    if (!user) throw new UnauthorizedException();

    return this.profile(user);
  }
  async logout(token?: string) { await this.sessions.revoke(token); }
}
