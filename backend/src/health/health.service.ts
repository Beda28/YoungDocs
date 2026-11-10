import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class HealthService {
  async check() {
    const url = process.env.FASTAPI_URL ?? 'http://localhost:8000';
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null);

    if (!res?.ok) throw new ServiceUnavailableException({ status: 503, fastapi: res?.status ?? null });

    return { status: 200, fastapi: res.status };
  }
}
