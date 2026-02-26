import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";

// ─── Types ───────────────────────────────────────────────────────────────────
type Estado = "completado" | "en_progreso" | "retrasado" | "critico" | "sin_iniciar";

interface Actividad {
  id: string;
  nombre: string;
  bloques: Record<string, Estado>;
}

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  actividades: Actividad[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const BLOQUES = ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08"];

function mkEstado(vals: Estado[]): Record<string, Estado> {
  const r: Record<string, Estado> = {};
  BLOQUES.forEach((b, i) => { r[b] = vals[i] ?? "sin_iniciar"; });
  return r;
}

const CATEGORIAS_INIT: Categoria[] = [
  {
    id: "cim", nombre: "Cimentación", icono: "⬛",
    actividades: [
      { id: "c1", nombre: "Excavación", bloques: mkEstado(["completado","completado","completado","completado","completado","completado","en_progreso","sin_iniciar"]) },
      { id: "c2", nombre: "Acero de cimentación", bloques: mkEstado(["completado","completado","completado","completado","en_progreso","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "c3", nombre: "Concreto de cimentación", bloques: mkEstado(["completado","completado","completado","retrasado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
  {
    id: "est", nombre: "Estructura", icono: "🏗",
    actividades: [
      { id: "e1", nombre: "Columnas", bloques: mkEstado(["completado","completado","en_progreso","en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "e2", nombre: "Vigas", bloques: mkEstado(["completado","en_progreso","retrasado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "e3", nombre: "Losas", bloques: mkEstado(["completado","en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "e4", nombre: "Muros estructurales", bloques: mkEstado(["en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
  {
    id: "mam", nombre: "Mampostería", icono: "🧱",
    actividades: [
      { id: "m1", nombre: "Paredes interiores", bloques: mkEstado(["completado","retrasado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "m2", nombre: "Paredes exteriores", bloques: mkEstado(["critico","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
  {
    id: "ele", nombre: "Instalaciones Eléctricas", icono: "⚡",
    actividades: [
      { id: "el1", nombre: "Ductos y cableado", bloques: mkEstado(["completado","completado","en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "el2", nombre: "Tableros", bloques: mkEstado(["completado","en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "el3", nombre: "Iluminación", bloques: mkEstado(["en_progreso","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
  {
    id: "hid", nombre: "Instalaciones Hidrosanitarias", icono: "💧",
    actividades: [
      { id: "h1", nombre: "Tubería agua potable", bloques: mkEstado(["completado","en_progreso","retrasado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "h2", nombre: "Tubería aguas negras", bloques: mkEstado(["completado","completado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
  {
    id: "aca", nombre: "Acabados", icono: "🎨",
    actividades: [
      { id: "a1", nombre: "Repello y fino", bloques: mkEstado(["completado","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "a2", nombre: "Cerámica y pisos", bloques: mkEstado(["sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "a3", nombre: "Pintura", bloques: mkEstado(["sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
      { id: "a4", nombre: "Carpintería", bloques: mkEstado(["sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar","sin_iniciar"]) },
    ]
  },
];

const CICLO: Estado[] = ["sin_iniciar", "en_progreso", "completado", "retrasado", "critico"];

const ESTADO_CONFIG: Record<Estado, { label: string; bg: string; dot: string; text: string }> = {
  completado:   { label: "Completado",  bg: "#064e3b", dot: "#10b981", text: "#6ee7b7" },
  en_progreso:  { label: "En Progreso", bg: "#1e3a5f", dot: "#3b82f6", text: "#93c5fd" },
  retrasado:    { label: "Retrasado",   bg: "#4a1d1d", dot: "#f59e0b", text: "#fcd34d" },
  critico:      { label: "Crítico",     bg: "#5b1921", dot: "#ef4444", text: "#fca5a5" },
  sin_iniciar:  { label: "Sin Iniciar", bg: "#1a1f2e", dot: "#475569", text: "#64748b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcPct(cats: Categoria[]) {
  let total = 0, comp = 0, prog = 0, ret = 0, crit = 0;
  cats.forEach(c => c.actividades.forEach(a => {
    BLOQUES.forEach(b => {
      total++;
      const e = a.bloques[b];
      if (e === "completado") comp++;
      else if (e === "en_progreso") prog++;
      else if (e === "retrasado") ret++;
      else if (e === "critico") crit++;
    });
  }));
  return { total, comp, prog, ret, crit, pct: total > 0 ? Math.round((comp / total) * 100) : 0 };
}

// ─── App ──────────────────────────────────────────────────────────────────────
function AvanceObraApp() {
  const [cats, setCats] = useState<Categoria[]>(CATEGORIAS_INIT);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["cim", "est"]));
  const [busqueda, setBusqueda] = useState("");
  const [compact, setCompact] = useState(false);
  const [tooltip, setTooltip] = useState<{ catId: string; actId: string; bloque: string } | null>(null);

  const stats = calcPct(cats);

  function toggleCat(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  }

  function cycleEstado(catId: string, actId: string, bloque: string) {
    setCats(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        actividades: c.actividades.map(a => {
          if (a.id !== actId) return a;
          const cur = a.bloques[bloque];
          const idx = CICLO.indexOf(cur);
          const next = CICLO[(idx + 1) % CICLO.length];
          return { ...a, bloques: { ...a.bloques, [bloque]: next } };
        })
      };
    }));
  }

  const filteredCats = cats.map(c => ({
    ...c,
    actividades: c.actividades.filter(a =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  })).filter(c => c.actividades.length > 0 || busqueda === "");

  const cellH = compact ? 28 : 36;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>📊 Avance de Obra</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Control de progreso por bloque y actividad</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="🔍 Buscar actividad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", width: 200 }}
          />
          <button
            onClick={() => setCompact(c => !c)}
            style={{ background: compact ? "#3b82f6" : "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "7px 14px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}
          >
            {compact ? "Vista Normal" : "Vista Compacta"}
          </button>
          <button
            onClick={() => setExpanded(new Set(cats.map(c => c.id)))}
            style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "7px 14px", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
          >Expandir Todo</button>
          <button
            onClick={() => setExpanded(new Set())}
            style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "7px 14px", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
          >Colapsar Todo</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Completado", val: stats.comp, total: stats.total, color: "#10b981", pct: stats.pct },
          { label: "En Progreso", val: stats.prog, total: stats.total, color: "#3b82f6", pct: Math.round((stats.prog/stats.total)*100) },
          { label: "Retrasado",   val: stats.ret,  total: stats.total, color: "#f59e0b", pct: Math.round((stats.ret/stats.total)*100) },
          { label: "Crítico",     val: stats.crit, total: stats.total, color: "#ef4444", pct: Math.round((stats.crit/stats.total)*100) },
        ].map(s => (
          <div key={s.label} style={{ background: "#1a1f2e", borderRadius: 10, padding: "12px 16px", border: "1px solid #2d3748" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.pct}%</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{s.val} / {s.total} celdas</div>
            <div style={{ marginTop: 8, background: "#0f1117", borderRadius: 4, height: 4 }}>
              <div style={{ width: `${s.pct}%`, background: s.color, height: "100%", borderRadius: 4, transition: "width .4s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.entries(ESTADO_CONFIG) as [Estado, typeof ESTADO_CONFIG[Estado]][]).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.dot }} />
            {v.label}
          </div>
        ))}
        <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>Haz clic en una celda para cambiar estado</span>
      </div>

      {/* Grid */}
      <div style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 12, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "280px repeat(8, 1fr)", background: "#111827", borderBottom: "1px solid #2d3748" }}>
          <div style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748b" }}>ACTIVIDAD</div>
          {BLOQUES.map(b => (
            <div key={b} style={{ padding: "10px 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "center", borderLeft: "1px solid #1e2535" }}>{b}</div>
          ))}
        </div>

        {/* Categories */}
        {filteredCats.map((cat, ci) => {
          const isOpen = expanded.has(cat.id);
          const catStats = calcPct([cat]);
          return (
            <div key={cat.id} style={{ borderBottom: ci < filteredCats.length - 1 ? "1px solid #1e2535" : "none" }}>
              {/* Category header */}
              <div
                onClick={() => toggleCat(cat.id)}
                style={{
                  display: "grid", gridTemplateColumns: "280px repeat(8, 1fr)",
                  background: "#111827", cursor: "pointer",
                  transition: "background .2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1f2e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
              >
                <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{cat.icono}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{cat.nombre}</span>
                  <span style={{ fontSize: 11, color: "#475569" }}>({cat.actividades.length})</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#10b981" }}>{catStats.pct}%</span>
                  <span style={{ color: "#475569", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {BLOQUES.map(b => {
                  const counts = new Map<Estado, number>();
                  cat.actividades.forEach(a => {
                    const e = a.bloques[b];
                    counts.set(e, (counts.get(e) ?? 0) + 1);
                  });
                  const dom = [...counts.entries()].sort((x, y) => y[1] - x[1])[0];
                  const cfg = dom ? ESTADO_CONFIG[dom[0]] : ESTADO_CONFIG["sin_iniciar"];
                  return (
                    <div key={b} style={{
                      borderLeft: "1px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center",
                      background: cfg.bg, fontSize: 10, color: cfg.text, fontWeight: 600
                    }}>
                      {dom ? dom[0].substring(0, 3).toUpperCase() : "—"}
                    </div>
                  );
                })}
              </div>

              {/* Activities */}
              {isOpen && cat.actividades.map((act, ai) => (
                <div key={act.id} style={{
                  display: "grid", gridTemplateColumns: "280px repeat(8, 1fr)",
                  borderTop: "1px solid #1e2535",
                  background: ai % 2 === 0 ? "#141921" : "#12161f",
                }}>
                  <div style={{ padding: `0 16px 0 36px`, display: "flex", alignItems: "center", height: cellH, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {act.nombre}
                  </div>
                  {BLOQUES.map(b => {
                    const est = act.bloques[b];
                    const cfg = ESTADO_CONFIG[est];
                    const isHov = tooltip?.catId === cat.id && tooltip?.actId === act.id && tooltip?.bloque === b;
                    return (
                      <div
                        key={b}
                        title={cfg.label}
                        onClick={() => cycleEstado(cat.id, act.id, b)}
                        onMouseEnter={() => setTooltip({ catId: cat.id, actId: act.id, bloque: b })}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          borderLeft: "1px solid #1e2535", height: cellH, display: "flex", alignItems: "center", justifyContent: "center",
                          background: isHov ? cfg.bg + "dd" : cfg.bg,
                          cursor: "pointer", transition: "all .15s", position: "relative",
                          transform: isHov ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "#374151", textAlign: "right" }}>
        Adelante · Avance de Obra v1.0
      </div>
    </div>
  );
}

export function renderApp(container: HTMLDivElement, _value: string): Root {
  const root = createRoot(container);
  root.render(<AvanceObraApp />);
  return root;
}
