import client from './client';

export type Entry = { id: number; type: 'income' | 'expense'; title: string; amount: number; date: string };
export type Draft = Omit<Entry, 'id'>;

export const list   = async (month: string, signal?: AbortSignal) => (await client.get<Entry[]>('/api/entries', { params: { month }, signal })).data;
export const add    = async (data: Draft) => (await client.post<Entry>('/api/entries', data)).data;
export const remove = async (id: number) => { await client.delete(`/api/entries/${id}`); };
