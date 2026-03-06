import React, { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { busquedaAtom } from '../../store/atoms';
import type { Etapa, Casa } from '../../store/data';
import { TarjetaCasa } from './tarjeta-unidad';
import { BarraAvance } from '../ui/barra-avance';

export const ColumnaKanban: React.FC<{
  etapa: Etapa;
  casas: Casa[];
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (etapaId: string) => void;
}> = ({ etapa, casas, draggedId, onDragStart, onDragEnd, onDrop }) => {
  const busqueda = useAtomValue(busquedaAtom);
  const [isDragOver, setIsDragOver] = useState(false);

  const filtradas = busqueda.trim()
    ? casas.filter(c =>
        c.lote.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.proyecto?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : casas;

  const pctAvg = filtradas.length > 0
    ? Math.round(filtradas.reduce((acc, c) => acc + (c.avance ?? 0), 0) / filtradas.length)
    : 0;

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(etapa.id);
  }, [etapa.id, onDrop]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 268, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background:   isDragOver ? etapa.colorSoft : '#f8fafc',
        borderRadius: 14,
        border:       isDragOver ? `2px dashed ${etapa.color}90` : '2px solid #e2e8f0',
        transition:   'background .2s, border .2s',
        paddingBottom: 8,
      }}
    >
      {/* Header */}
      <div style={{
        padding:      '10px 12px 8px',
        borderBottom: `1px solid ${etapa.color}25`,
        background:   `linear-gradient(180deg, ${etapa.colorSoft}, transparent)`,
        borderRadius: '12px 12px 0 0',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: filtradas.length > 0 ? 6 : 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: etapa.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2535', flex: 1 }}>{etapa.nombre}</span>
          {filtradas.length > 0 && (
            <span style={{ background: `${etapa.color}22`, color: etapa.color, borderRadius: 12, padding: '1px 8px', fontSize: 11, fontWeight: 700, border: `1px solid ${etapa.color}30` }}>
              {filtradas.length}
            </span>
          )}
          {isDragOver && draggedId && (
            <span style={{ fontSize: 10, color: etapa.color, fontWeight: 600 }}>↓ Soltar</span>
          )}
        </div>
        {filtradas.length > 0 && <BarraAvance pct={pctAvg} color={etapa.color} />}
        {etapa.categoria && (
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            {etapa.categoria}
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', maxHeight: 'calc(100vh - 240px)', minHeight: 60 }}>
        {filtradas.map(casa => (
          <TarjetaCasa
            key={casa.id}
            casa={casa}
            etapa={etapa}
            isDragging={draggedId === casa.id}
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(casa.id); }}
            onDragEnd={onDragEnd}
          />
        ))}
        {filtradas.length === 0 && (
          <div style={{
            border:     `1.5px dashed ${isDragOver ? etapa.color : '#cbd5e1'}`,
            borderRadius: 10, padding: 16, textAlign: 'center',
            color:      isDragOver ? etapa.color : '#94a3b8',
            fontSize:   12, transition: 'all .2s', margin: '4px 0',
          }}>
            {isDragOver ? 'Mover aquí ↓' : 'Sin casas'}
          </div>
        )}
      </div>
    </div>
  );
};

