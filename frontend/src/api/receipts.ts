import client from './client';

export const process = async (file: File, signal: AbortSignal) => {
  const form = new FormData();
  form.append('file', file);
  return (await client.post<{ result: string }>('/api/receipts', form, { timeout: 90000, signal })).data.result;
};
export const read = async (id: string, signal: AbortSignal) => (await client.get<Blob>(`/api/receipts/${id}`, { responseType: 'blob', timeout: 15000, signal })).data;
