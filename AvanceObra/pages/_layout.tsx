import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { busquedaAtom, draggedIdAtom } from '../store/atoms';
import { useEtapas, useCasas } from '../lib/dataverse';

export interface LayoutProps {
  w?: number;
  h?: number;
  unidadesJSON?: string;
}

const TABS = [
  { label: 'Tablero',   path: '/'          },
  { label: 'Lista',     path: '/lista'      },
  { label: 'Dashboard', path: '/dashboard'  },
] as const;

export default function Layout({ w, h }: LayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [busqueda, setBusqueda] = useAtom(busquedaAtom);
  const draggedId = useAtomValue(draggedIdAtom);

  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const casas   = casasQ.data ?? [];
  const total        = casas.length;
  const completadas  = casas.filter(c => c.estado === 'Completado').length;
  const pctGlobal    = total > 0
    ? Math.round(casas.reduce((a, c) => a + (c.avance ?? 0), 0) / total)
    : 0;
  void etapasQ;

  return (
    <div style={{
      fontFamily:    "'Segoe UI', system-ui, sans-serif",
      background:    '#f5f7f5',
      height:        h ? `${h}px` : '100%',
      color:         '#1a2535',
      display:       'flex',
      flexDirection: 'column',
      width:         w ? `${w}px` : '100%',
      overflow:      'hidden',
      position:      'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        padding:      '10px 20px',
        background:   '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 4px #00000010',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #ADD010, #8fb00c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>🏗</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a2535', lineHeight: 1 }}>Avance de Obra</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Control de construcción</div>
          </div>
        </div>

        {/* Progreso global */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '5px 12px',
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Avance</span>
          <div style={{ width: 100, height: 5, background: '#e2e8f0', borderRadius: 4 }}>
            <div style={{ width: `${pctGlobal}%`, height: '100%', background: 'linear-gradient(90deg,#ADD010,#8fb00c)', borderRadius: 4, transition: 'width .4s' }}/>
          </div>
          <span style={{ fontSize: 11, color: '#5a7400', fontWeight: 700 }}>{pctGlobal}%</span>
          <span style={{ fontSize: 11, color: '#cbd5e1' }}>·</span>
          <span style={{ fontSize: 11, color: '#0047FF', fontWeight: 700 }}>{completadas}/{total}</span>
        </div>

        {/* Acción */}
        <button style={{ background: '#ADD010', border: 'none', borderRadius: 9, padding: '7px 16px', color: '#1a2535', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#96b80e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ADD010')}
        >
          Sincronizar ↺
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: '0 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
        {TABS.map(tab => {
          const activo = location.pathname === tab.path;
          return (
            <button key={tab.label}
              onClick={() => navigate(tab.path)}
              style={{
                background:   'none', border: 'none',
                borderBottom: activo ? '2px solid #ADD010' : '2px solid transparent',
                padding:      '9px 16px',
                color:        activo ? '#5a7400' : '#64748b',
                fontSize:     13, cursor: 'pointer',
                fontWeight:   activo ? 700 : 400,
                transition:   'color .15s, border-color .15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ padding: '7px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
        {draggedId && (
          <span style={{ background: '#ADD01015', border: '1px solid #ADD01060', borderRadius: 8, padding: '4px 12px', color: '#5a7400', fontSize: 11, fontWeight: 600 }}>
            ↔ Arrastrando… suelta en la columna destino
          </span>
        )}
        <div style={{ flex: 1 }} />

        {/* Buscador */}
        <div style={{ position: 'relative' }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar lote..."
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9,
              padding: '5px 30px 5px 10px', color: '#1a2535', fontSize: 12,
              outline: 'none', width: 180,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#ADD01080'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          />
          <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>🔍</span>
        </div>

        {/* Refresh */}
        <button
          onClick={() => { casasQ.refetch(); }}
          disabled={casasQ.isFetching}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 11px', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
          title="Recargar datos"
        >
          {casasQ.isFetching ? '⌛' : '↺'}
        </button>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}


export interface LayoutProps {
  w?: number;
  h?: number;
  unidadesJSON?: string;
}

