import { useSyncExternalStore } from 'react';


export type User = { id: number; name: string };
export type Auth = { access: string; user: User };


let token = '';
let state = { user: null as User | null, ready: false };
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const snapshot  = () => state;
export const getToken   = () => token;
export const useSession = () => useSyncExternalStore(subscribe, snapshot);

export const save       = (auth: Auth | null) => {
  token = auth?.access ?? '';
  state = { user: auth?.user ?? null, ready: true };
  listeners.forEach(fn => fn());
};
export const ready = () => {
  state = { ...state, ready: true };
  listeners.forEach(fn => fn());
};
export const lock = <T,>(fn: () => Promise<T>): Promise<T> =>
  navigator.locks ? navigator.locks.request('youngdocs-auth', fn) : fn();

const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('youngdocs-auth');
if (channel) channel.onmessage = () => save(null);

export const clear = () => { save(null); channel?.postMessage('logout'); };
