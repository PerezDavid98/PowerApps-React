import React from 'react';
import { useAtom } from 'jotai';
import { seleccionadaAtom } from '../../store/atoms';
import { BarraAvance } from '../ui/barra-avance';
import { ESTADO_STYLES } from '../../store/data';
import type { Etapa } from '../../store/data';
import { useMoverCasa } from '../../lib/dataverse';
import { toast } from 'sonner';

const campo = (label: string, value?: string | number | null, accent = '#ADD010') => (
  value != null && value !== '' ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
      <div style={{ width: 130, fontSize: 11, color: '#94a3b8', flexShrink: 0, paddingTop: 1, textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#1a2535', fontWeight: 600 }}>{value}</div>
    </div>
  ) : null
);

export const PanelDetalle: React.FC<{ etapas?: Etapa[] }> = ({ etapas = [] }) => {
  const [seleccionada, setSeleccionada] = useAtom(seleccionadaAtom);
  const mover = useMoverCasa();

  if (!seleccionada) return null;
  const c = seleccionada;
  const etapa = etapas.find(e => e.id === c.etapaId);
  const accent = etapa?.color ?? '#ADD010';
  const estadoStyle = ESTADO_STYLES[c.estado] ?? ESTADO_STYLES['Pendiente'];

  function handleMover(etapaId: string) {
    mover.mutate(
      { casaId: c.id, etapaId },
      {
        onSuccess: () => {
          toast.success(`Casa ${c.lote} movida a nueva etapa`);
          setSeleccionada(null);
        },
        onError: () => toast.error('Error al mover la casa'),
      }
    );
  }

  return (
    <div style={{
      width: 400, background: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 8,
        background: `linear-gradient(135deg, ${accent}12, #ffffff)`,
      }}>
        <div style={{ width: 5, height: 22, borderRadius: 3, background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: '#1a2535', flex: 1 }}>{c.lote}</span>
        <span style={{
          background: estadoStyle.bg, color: estadoStyle.color, border: `1px solid ${estadoStyle.border}`,
          borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700,
        }}>{c.estado}</span>
        <button
          onClick={() => setSeleccionada(null)}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '5px 10px', color: '#64748b', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Barra accent */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40, transparent)` }} />

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 0' }}>
        {/* Etapa actual */}
        {etapa && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, background: etapa.colorSoft, border: `1px solid ${accent}30`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: accent, flex: 1 }}>{etapa.nombre}</span>
            {c.avance != null && <BarraAvance pct={c.avance} color={accent} />}
          </div>
        )}

        {campo('Modelo', c.modelo)}
        {campo('Proyecto', c.proyecto)}
        {campo('Comprador', c.comprador)}
        {campo('Vendedor', c.vendedor)}
        {campo('Fecha inicio', c.fechaInicio?.slice(0, 10))}
        {campo('Fecha estimada', c.fechaFinEsperada?.slice(0, 10))}
        {campo('Fecha completado', c.fechaCompletado?.slice(0, 10))}
        {c.observaciones && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600, marginBottom: 4 }}>Observaciones</div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px' }}>
              {c.observaciones}
            </div>
          </div>
        )}

        {/* Mover a otra etapa */}
        {etapas.length > 1 && (
          <>
            <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0 12px' }} />
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600, marginBottom: 8 }}>
              Mover a etapa
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {etapas
                .filter(e => e.id !== c.etapaId)
                .sort((a, b) => a.orden - b.orden)
                .map(e => (
                  <button
                    key={e.id}
                    disabled={mover.isPending}
                    onClick={() => handleMover(e.id)}
                    style={{
                      background: `${e.color}15`, border: `1px solid ${e.color}40`,
                      borderRadius: 8, padding: '4px 12px', color: e.color,
                      fontSize: 11, cursor: 'pointer', fontWeight: 600,
                      opacity: mover.isPending ? 0.6 : 1,
                    }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = `${e.color}30`)}
                    onMouseLeave={ev => (ev.currentTarget.style.background = `${e.color}15`)}
                  >
                    {e.nombre}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '10px 16px', background: '#f8fafc', display: 'flex', gap: 8 }}>
        <button
          style={{ flex: 1, background: '#ADD010', border: 'none', borderRadius: 9, padding: '8px 0', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#96b80e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ADD010')}
        >
          ✓ Completar
        </button>
        <button
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '8px 14px', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
        >
          ✎ Editar
        </button>
      </div>
    </div>
  );
};

