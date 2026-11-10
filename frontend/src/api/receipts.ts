import axios  from 'axios';
import client from './client';

export const process = async (file: File, signal: AbortSignal) => {
  const form = new FormData();
  form.append('file', file);
  return (await client.post<{ result: string }>('/api/receipts', form, { timeout: 90000, signal })).data.result;
};

export const read = async (id: string, signal: AbortSignal) => (await client.get<Blob>(`/api/receipts/${id}`, { responseType: 'blob', timeout: 15000, signal })).data;

export const original = async (id: string, signal: AbortSignal) => {
  try { return (await client.get<Blob>(`/api/receipts/${id}/original`, { responseType: 'blob', timeout: 15000, signal })).data; }
  catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};
