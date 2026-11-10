import client from './client';

export type Health = {
  status:  number;
  fastapi: number | null;
};

export const health = async (): Promise<Health> => {
  const res = await client.get<Health>('/health');
  return { status: res.status, fastapi: res.data.fastapi ?? null };
};
