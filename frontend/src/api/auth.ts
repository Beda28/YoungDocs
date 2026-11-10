import axios                                              from 'axios';
import client, { refresh }                                from './client';
import { clear, lock, ready, save, type Auth, type User } from './session';


type Credentials = { name: string; password: string };

export const login = (data: Credentials) => lock(async () => {
  const res = await client.post<Auth>('/api/auth/login', data);
  save(res.data);
});
export const signup = (data: Credentials) => lock(async () => {
  const res = await client.post<Auth>('/api/auth/signup', data);
  save(res.data);
});
export const logout = () => lock(async () => {
  await client.post('/api/auth/logout');
  clear();
});
export const me = async () => (await client.get<User>('/api/auth/me')).data;

let init: Promise<void> | null = null;

export const restore = () => init ??= refresh().then(me).then(() => {}).catch(error => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error;
}).finally(ready);
