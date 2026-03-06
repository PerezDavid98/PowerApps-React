import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePcfContext } from './pcf-context';
import {
  dvEtapaToEtapa, dvCasaToInternal,
  type DvEtapa, type DvCasa, type DvAvance,
  type Etapa, type Casa,
} from '../store/data';

// ─── ETAPAS ───────────────────────────────────────────────────────────────────
export function useEtapas() {
  const ctx = usePcfContext();
  return useQuery<Etapa[]>({
    queryKey: ['etapas'],
    queryFn: async () => {
      const r = await ctx.webAPI.retrieveMultipleRecords(
        'cr8f2_etapas',
        '?$select=cr8f2_etapasid,cr8f2_nombreetapa,cr8f2_ordenetapa,cr8f2_categoria,cr8f2_descripcion&$orderby=cr8f2_ordenetapa asc'
      );
      return (r.entities as DvEtapa[]).map((e, i) => dvEtapaToEtapa(e, i));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── AVANCES ─────────────────────────────────────────────────────────────────
export function useAvances() {
  const ctx = usePcfContext();
  return useQuery<DvAvance[]>({
    queryKey: ['avances'],
    queryFn: async () => {
      const r = await ctx.webAPI.retrieveMultipleRecords(
        'cr8f2_avanceconstruccion',
        '?$select=cr8f2_avanceconstruccionid,_cr8f2_casaid_value,_cr8f2_etapaid_value,cr8f2_porcentajeavance,cr8f2_estado,cr8f2_fechainicio,cr8f2_fechafinEsperada,cr8f2_fechacompletado'
      );
      return r.entities as DvAvance[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ─── CASAS ────────────────────────────────────────────────────────────────────
export function useCasas() {
  const ctx = usePcfContext();
  const avancesQuery = useAvances();

  return useQuery<Casa[]>({
    queryKey: ['casas'],
    queryFn: async () => {
      const r = await ctx.webAPI.retrieveMultipleRecords(
        'cr8f2_casas',
        '?$select=cr8f2_casasid,cr8f2_numerodelope,cr8f2_modelocasa,cr8f2_proyecto,cr8f2_nombrevendedor,cr8f2_nombrecomprador,cr8f2_estadogeneral,cr8f2_observaciones,_cr8f2_etapaactual_value'
      );
      const avances = avancesQuery.data ?? [];
      return (r.entities as DvCasa[]).map(c => dvCasaToInternal(c, avances));
    },
    enabled: avancesQuery.isSuccess || avancesQuery.isError,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── MOVER CASA A OTRA ETAPA ─────────────────────────────────────────────────
export function useMoverCasa() {
  const ctx = usePcfContext();
  const qc  = useQueryClient();
  return useMutation({
    mutationFn: ({ casaId, etapaId }: { casaId: string; etapaId: string }) =>
      ctx.webAPI.updateRecord('cr8f2_casas', casaId, {
        'cr8f2_etapaactual@odata.bind': `/cr8f2_etapases(${etapaId})`,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['casas'] });
      qc.invalidateQueries({ queryKey: ['avances'] });
    },
  });
}

