import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const cost   = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const derive = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, cost, (error, key) => error ? reject(error) : resolve(key));
});

export const hash = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const key  = await derive(password, salt);
  return `${salt}:${key.toString('hex')}`;
};

export const verify = async (password: string, stored?: string) => {
  const [salt, value] = stored?.split(':') ?? ['0'.repeat(32), '0'.repeat(128)];
  const key          = await derive(password, salt);
  const expected     = Buffer.from(value, 'hex');
  return expected.length === key.length && timingSafeEqual(expected, key);
};
