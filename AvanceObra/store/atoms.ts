import { atom } from 'jotai';
import type { Casa } from './data';

export const seleccionadaAtom = atom<Casa | null>(null);
export const busquedaAtom     = atom<string>('');
export const vistaAtom        = atom<'tablero' | 'lista'>('tablero');
export const draggedIdAtom    = atom<string | null>(null);
