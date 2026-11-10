import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getToken, lock, save, type Auth }        from './session';


const client = axios.create({
  baseURL:         '/',
  timeout:         7000,
  withCredentials: true,
  headers:         { 'X-Requested-With': 'XMLHttpRequest' },
});


const publicPaths = new Set(['/api/auth/login', '/api/auth/signup', '/api/auth/refresh', '/api/auth/logout']);
let pending: Promise<string> | null = null;

export const refresh = (): Promise<string> => {
  pending ??= lock(async () => {
    try {
      const { data } = await client.post<Auth>('/api/auth/refresh');
      save(data);
      return data.access;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) save(null);
      throw error;
    }
  }).finally(() => { pending = null; });

  return pending;
};

client.interceptors.request.use(config => {
  const token = getToken();
  if (token && !publicPaths.has(config.url ?? '')) config.headers.Authorization = `Bearer ${token}`;

  return config;
});


client.interceptors.response.use(res => res, async error => {
  const config = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !config || config.retried || publicPaths.has(config.url ?? '')) throw error;

  config.retried = true;
  config.headers.Authorization = `Bearer ${await refresh()}`;

  return client(config);
});

export const message = (error: unknown) => {
  if (!axios.isAxiosError(error))    return '요청을 처리하지 못했습니다.';
  if (!error.response)               return '서버에 연결할 수 없습니다.';
  if (error.response.status === 413) return '10MB 이하의 이미지를 올려주세요.';
  if (error.response.status === 404) return '요청한 자료를 찾을 수 없습니다.';
  if (error.response.status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';

  const text = error.response.data?.message;
  return typeof text === 'string' ? text : '입력값을 확인해주세요.';
};

export default client;
