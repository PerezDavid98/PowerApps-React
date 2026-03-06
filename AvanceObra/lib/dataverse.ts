import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorForIndex, colorSoftForIndex, type Etapa, type Casa } from '../store/data';

// ─── DATOS MOCK ───────────────────────────────────────────────────────────────

const MOCK_ETAPAS: Etapa[] = [
  { id: 'e1', nombre: 'Preliminares',       orden: 1, categoria: 'Obra gris',   color: colorForIndex(0), colorSoft: colorSoftForIndex(0) },
  { id: 'e2', nombre: 'Cimentación',        orden: 2, categoria: 'Obra gris',   color: colorForIndex(1), colorSoft: colorSoftForIndex(1) },
  { id: 'e3', nombre: 'Estructura',         orden: 3, categoria: 'Obra gris',   color: colorForIndex(2), colorSoft: colorSoftForIndex(2) },
  { id: 'e4', nombre: 'Paredes',            orden: 4, categoria: 'Obra gris',   color: colorForIndex(3), colorSoft: colorSoftForIndex(3) },
  { id: 'e5', nombre: 'Instalaciones',      orden: 5, categoria: 'Acabados',    color: colorForIndex(4), colorSoft: colorSoftForIndex(4) },
  { id: 'e6', nombre: 'Acabados',           orden: 6, categoria: 'Acabados',    color: colorForIndex(5), colorSoft: colorSoftForIndex(5) },
  { id: 'e7', nombre: 'Entrega',            orden: 7, categoria: 'Cierre',      color: colorForIndex(6), colorSoft: colorSoftForIndex(6) },
];

let mockCasas: Casa[] = [
  // Preliminares
  { id: 'c1',  lote: 'L-01', modelo: 'Modelo A', proyecto: 'Residencial Los Robles',   vendedor: 'Carlos Mora',    comprador: 'Ana Jiménez',    etapaId: 'e1', estado: 'En proceso',  avance: 35,  fechaInicio: '2026-01-15', fechaFinEsperada: '2026-04-30' },
  { id: 'c2',  lote: 'L-02', modelo: 'Modelo B', proyecto: 'Residencial Los Robles',   vendedor: 'Carlos Mora',    comprador: 'Pedro Solís',    etapaId: 'e1', estado: 'Pendiente',   avance: 10,  fechaInicio: '2026-02-01', fechaFinEsperada: '2026-05-15' },
  // Cimentación
  { id: 'c3',  lote: 'L-03', modelo: 'Modelo A', proyecto: 'Residencial Los Robles',   vendedor: 'María Vargas',   comprador: 'Luis Herrera',   etapaId: 'e2', estado: 'En proceso',  avance: 55,  fechaInicio: '2025-12-01', fechaFinEsperada: '2026-03-20' },
  { id: 'c4',  lote: 'L-04', modelo: 'Modelo C', proyecto: 'Condominio Vista Azul',    vendedor: 'María Vargas',   comprador: 'Rosa Méndez',    etapaId: 'e2', estado: 'Retrasado',   avance: 40,  fechaInicio: '2025-11-15', fechaFinEsperada: '2026-02-28' },
  // Estructura
  { id: 'c5',  lote: 'L-05', modelo: 'Modelo B', proyecto: 'Condominio Vista Azul',    vendedor: 'Jorge Arias',    comprador: 'Daniel Rojas',   etapaId: 'e3', estado: 'En proceso',  avance: 70,  fechaInicio: '2025-10-10', fechaFinEsperada: '2026-03-15' },
  { id: 'c6',  lote: 'L-06', modelo: 'Modelo A', proyecto: 'Residencial Los Robles',   vendedor: 'Jorge Arias',    comprador: 'Marta Soto',     etapaId: 'e3', estado: 'En proceso',  avance: 65,  fechaInicio: '2025-10-20', fechaFinEsperada: '2026-03-30' },
  { id: 'c7',  lote: 'L-07', modelo: 'Modelo C', proyecto: 'Condominio Vista Azul',    vendedor: 'Carlos Mora',    comprador: undefined,         etapaId: 'e3', estado: 'Pendiente',   avance: 50,  fechaInicio: '2025-11-01', fechaFinEsperada: '2026-04-10' },
  // Paredes
  { id: 'c8',  lote: 'L-08', modelo: 'Modelo B', proyecto: 'Residencial Los Robles',   vendedor: 'María Vargas',   comprador: 'Sofía Campos',   etapaId: 'e4', estado: 'En proceso',  avance: 80,  fechaInicio: '2025-09-15', fechaFinEsperada: '2026-02-28' },
  { id: 'c9',  lote: 'L-09', modelo: 'Modelo A', proyecto: 'Torres del Valle',         vendedor: 'Jorge Arias',    comprador: 'Andrés Quesada', etapaId: 'e4', estado: 'Retrasado',   avance: 60,  fechaInicio: '2025-08-20', fechaFinEsperada: '2026-01-31' },
  // Instalaciones
  { id: 'c10', lote: 'L-10', modelo: 'Modelo C', proyecto: 'Torres del Valle',         vendedor: 'Carlos Mora',    comprador: 'Laura Chaves',   etapaId: 'e5', estado: 'En proceso',  avance: 85,  fechaInicio: '2025-07-10', fechaFinEsperada: '2026-02-15' },
  { id: 'c11', lote: 'L-11', modelo: 'Modelo A', proyecto: 'Residencial Los Robles',   vendedor: 'María Vargas',   comprador: 'Fernando Brenes',etapaId: 'e5', estado: 'En proceso',  avance: 90,  fechaInicio: '2025-07-01', fechaFinEsperada: '2026-01-31' },
  // Acabados
  { id: 'c12', lote: 'L-12', modelo: 'Modelo B', proyecto: 'Torres del Valle',         vendedor: 'Jorge Arias',    comprador: 'Carmen Alfaro',  etapaId: 'e6', estado: 'En proceso',  avance: 95,  fechaInicio: '2025-05-15', fechaFinEsperada: '2026-01-15' },
  // Entrega
  { id: 'c13', lote: 'L-13', modelo: 'Modelo A', proyecto: 'Condominio Vista Azul',    vendedor: 'Carlos Mora',    comprador: 'Roberto Fallas', etapaId: 'e7', estado: 'Completado',  avance: 100, fechaInicio: '2025-03-01', fechaFinEsperada: '2025-12-15', fechaCompletado: '2025-12-10' },
  { id: 'c14', lote: 'L-14', modelo: 'Modelo C', proyecto: 'Residencial Los Robles',   vendedor: 'María Vargas',   comprador: 'Isabel Monge',   etapaId: 'e7', estado: 'Completado',  avance: 100, fechaInicio: '2025-02-15', fechaFinEsperada: '2025-11-30', fechaCompletado: '2025-11-28' },
];

// ─── HOOKS (datos mock) ───────────────────────────────────────────────────────

export function useEtapas() {
  return useQuery<Etapa[]>({
    queryKey: ['etapas'],
    queryFn: async () => MOCK_ETAPAS,
    staleTime: Infinity,
  });
}

export function useCasas() {
  return useQuery<Casa[]>({
    queryKey: ['casas'],
    queryFn: async () => [...mockCasas],
    staleTime: 2 * 60 * 1000,
  });
}

export function useMoverCasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ casaId, etapaId }: { casaId: string; etapaId: string }) => {
      mockCasas = mockCasas.map(c => c.id === casaId ? { ...c, etapaId } : c);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['casas'] });
    },
  });
}

