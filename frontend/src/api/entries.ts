import client from './client';


export type Entry = { id: number; type: 'income' | 'expense'; title: string; amount: number; date: string; receiptId: string | null };
export type Draft = Omit<Entry, 'id' | 'receiptId'> & { receiptId?: string | null };

export const list   = async (month: string, signal?: AbortSignal) => (await client.get<Entry[]>('/api/entries', { params: { month }, signal })).data;

export const get    = async (id: number, signal?: AbortSignal) => (await client.get<Entry>(`/api/entries/${id}`, { signal })).data;

export const add    = async (data: Draft) => (await client.post<Entry>('/api/entries', data)).data;

export const update = async (id: number, data: Draft) => (await client.put<Entry>(`/api/entries/${id}`, data)).data;

export const remove = async (id: number) => { await client.delete(`/api/entries/${id}`); };
