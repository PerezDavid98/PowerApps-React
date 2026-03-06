import React, { useCallback, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { draggedIdAtom, seleccionadaAtom, busquedaAtom } from '../store/atoms';
import { useEtapas, useCasas, useMoverCasa } from '../lib/dataverse';
import { ColumnaKanban } from '../components/kanban/columna-kanban';
import { PanelDetalle } from '../components/kanban/panel-detalle';
import { toast } from 'sonner';

export default function HomePage() {
  const [draggedId, setDraggedId]   = useAtom(draggedIdAtom);
  const setSeleccionada              = useSetAtom(seleccionadaAtom);
  const busqueda                     = useMemo(() => '', []);
  void busqueda;

  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const mover   = useMoverCasa();

  const etapas = etapasQ.data ?? [];
  const casas  = casasQ.data  ?? [];

  const handleDragStart = useCallback((id: string) => setDraggedId(id), [setDraggedId]);
  const handleDragEnd   = useCallback(() => setDraggedId(null), [setDraggedId]);

  const handleDrop = useCallback((etapaId: string) => {
    if (!draggedId) return;
    mover.mutate(
      { casaId: draggedId, etapaId },
      {
        onSuccess: () => {
          setSeleccionada(prev =>
            prev?.id === draggedId ? { ...prev, etapaId } : prev
          );
          toast.success('Casa movida correctamente');
        },
        onError: () => toast.error('Error al mover la casa'),
      }
    );
    setDraggedId(null);
  }, [draggedId, mover, setDraggedId, setSeleccionada]);

  // ─── Loading / Error ─────────────────────────────────────────────────────────
  if (etapasQ.isPending || casasQ.isPending) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: '#64748b' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#ADD010', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13 }}>Cargando datos…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (etapasQ.isError) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 14 }}>
        Error al cargar etapas: {String(etapasQ.error)}
      </div>
    );
  }

  return (
    <>
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 10, padding: '14px 16px', alignItems: 'flex-start', background: '#f5f7f5' }}>
        {etapas.map(etapa => (
          <ColumnaKanban
            key={etapa.id}
            etapa={etapa}
            casas={casas.filter(c => c.etapaId === etapa.id)}
            draggedId={draggedId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
        {etapas.length === 0 && !etapasQ.isPending && (
          <div style={{ flex: 1, textAlign: 'center', color: '#94a3b8', fontSize: 14, paddingTop: 40 }}>
            No hay etapas configuradas en Dataverse.
          </div>
        )}
      </div>

      <PanelDetalle etapas={etapas} />
    </>
  );
}

