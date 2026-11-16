import { useState } from 'react'
import './DashboardAnalitico.css'

export default function DashboardAnalitico({ filas, soles }) {
  const [filtroSede, setFiltroSede] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  // Lista de sedes y meses únicos para los filtros locales
  const sedesDisponibles = [...new Set(filas.map(f => f.sede))].filter(Boolean).sort()
  const mesesDisponibles = [...new Set(filas.map(f => f.fecha?.slice(0, 7)))].filter(Boolean).sort().reverse()

  // Filtrado de filas
  const filasFiltradas = filas.filter(f =>
    (!filtroSede || f.sede === filtroSede) &&
    (!filtroMes || f.fecha?.slice(0, 7) === filtroMes),
  )

  // 1. Cálculos de Totales y KPIs
  const totalPresupuesto = filasFiltradas.reduce((acc, f) => acc + (Number(f.total_a_pagar) || 0), 0)
  const totalBruto = filasFiltradas.reduce((acc, f) => acc + (Number(f.monto_bruto) || Number(f.total_a_pagar) || 0), 0)
  const totalRetenciones = filasFiltradas.reduce((acc, f) => acc + (Number(f.retencion) || 0), 0)

  const montoPagado = filasFiltradas
    .filter(f => f.estado === 'Pagado')
    .reduce((acc, f) => acc + (Number(f.total_a_pagar) || 0), 0)

  const montoProgramado = filasFiltradas
    .filter(f => f.estado === 'Programado')
    .reduce((acc, f) => acc + (Number(f.total_a_pagar) || 0), 0)

  const montoPendiente = filasFiltradas
    .filter(f => f.estado === 'Pendiente')
    .reduce((acc, f) => acc + (Number(f.total_a_pagar) || 0), 0)

  const montoPorPagar = montoProgramado + montoPendiente

  const pctPagado = totalPresupuesto > 0 ? (montoPagado / totalPresupuesto) * 100 : 0
  const pctProgramado = totalPresupuesto > 0 ? (montoProgramado / totalPresupuesto) * 100 : 0
  const pctPendiente = totalPresupuesto > 0 ? (montoPendiente / totalPresupuesto) * 100 : 0

  const ticketPromedio = filasFiltradas.length > 0 ? totalPresupuesto / filasFiltradas.length : 0

  // 2. Agrupación por Sede
  const sedesMap = filasFiltradas.reduce((acc, f) => {
    acc[f.sede] = (acc[f.sede] || 0) + (Number(f.total_a_pagar) || 0)
    return acc
  }, {})
  const rankingSedes = Object.entries(sedesMap)
    .map(([sede, monto]) => ({ sede, monto, pct: totalPresupuesto > 0 ? (monto / totalPresupuesto) * 100 : 0 }))
    .sort((a, b) => b.monto - a.monto)
  const maxSedeMonto = rankingSedes[0]?.monto || 1

  // 3. Agrupación por Categoría
  const categoriasMap = filasFiltradas.reduce((acc, f) => {
    acc[f.categoria] = (acc[f.categoria] || 0) + (Number(f.total_a_pagar) || 0)
    return acc
  }, {})
  const rankingCategorias = Object.entries(categoriasMap)
    .map(([categoria, monto]) => ({ categoria, monto, pct: totalPresupuesto > 0 ? (monto / totalPresupuesto) * 100 : 0 }))
    .sort((a, b) => b.monto - a.monto)
  const maxCatMonto = rankingCategorias[0]?.monto || 1

  // 4. Agrupación por Mes (Evolución Cronológica)
  const mesesMap = filasFiltradas.reduce((acc, f) => {
    const mes = f.fecha?.slice(0, 7) || 'Sin fecha'
    acc[mes] = (acc[mes] || 0) + (Number(f.total_a_pagar) || 0)
    return acc
  }, {})
  const evolucionMensual = Object.entries(mesesMap)
    .map(([mes, monto]) => ({ mes, monto }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
  const maxMesMonto = Math.max(...evolucionMensual.map(m => m.monto), 1)

  // 5. Top 5 Mayores Requerimientos
  const topRequerimientos = [...filasFiltradas]
    .sort((a, b) => (Number(b.total_a_pagar) || 0) - (Number(a.total_a_pagar) || 0))
    .slice(0, 5)

  // Geometría del Donut SVG (Radio = 64, Circunferencia = 2 * PI * 64 ≈ 402.12)
  const circ = 2 * Math.PI * 64
  const strokePagado = (pctPagado / 100) * circ
  const strokeProgramado = (pctProgramado / 100) * circ
  const strokePendiente = (pctPendiente / 100) * circ

  const offsetPagado = 0
  const offsetProgramado = -strokePagado
  const offsetPendiente = -(strokePagado + strokeProgramado)

  return (
    <div className="da-container">
      {/* Cabecera y Filtros Interactivos */}
      <header className="da-header">
        <div className="da-header-info">
          <h2 className="da-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb', flexShrink: 0 }}>
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span>Dashboard Analítico</span>
            <span className="da-title-badge">Control Financiero</span>
          </h2>
          <p className="da-subtitle">
            Métricas de ejecución, desglose de presupuestos y distribución por sede y categoría
          </p>
        </div>

        <div className="da-filters">
          <select
            value={filtroSede}
            onChange={e => setFiltroSede(e.target.value)}
            className="da-filter-select"
            aria-label="Filtrar por sede"
          >
            <option value="">🏢 Todas las sedes ({sedesDisponibles.length})</option>
            {sedesDisponibles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            className="da-filter-select"
            aria-label="Filtrar por mes"
          >
            <option value="">📅 Todos los periodos</option>
            {mesesDisponibles.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {(filtroSede || filtroMes) && (
            <button
              type="button"
              onClick={() => { setFiltroSede(''); setFiltroMes('') }}
              className="vt-btn-clear"
              style={{ height: '38px', padding: '0 12px' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </header>

      {/* KPI Ribbon (5 Tarjetas Métricas Clave) */}
      <section className="da-kpi-grid">
        {/* KPI 1: Presupuesto Total */}
        <div className="da-kpi-card">
          <div className="da-kpi-top">
            <span className="da-kpi-title">Presupuesto Total</span>
            <div className="da-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val">{soles.format(totalPresupuesto)}</div>
          <div className="da-kpi-footer">
            <span>{filasFiltradas.length} requerimientos</span>
            <span style={{ color: '#0284c7' }}>100% total</span>
          </div>
        </div>

        {/* KPI 2: Ejecutado / Pagado */}
        <div className="da-kpi-card">
          <div className="da-kpi-top">
            <span className="da-kpi-title">Monto Ejecutado</span>
            <div className="da-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val" style={{ color: '#16a34a' }}>{soles.format(montoPagado)}</div>
          <div className="da-kpi-progress">
            <div className="da-kpi-progress-bar" style={{ width: `${pctPagado}%`, background: '#16a34a' }} />
          </div>
          <div className="da-kpi-footer">
            <span>{pctPagado.toFixed(1)}% ejecutado</span>
            <span style={{ color: '#16a34a' }}>Pagado</span>
          </div>
        </div>

        {/* KPI 3: Por Pagar (Comprometido) */}
        <div className="da-kpi-card">
          <div className="da-kpi-top">
            <span className="da-kpi-title">Por Pagar</span>
            <div className="da-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val" style={{ color: '#d97706' }}>{soles.format(montoPorPagar)}</div>
          <div className="da-kpi-progress">
            <div className="da-kpi-progress-bar" style={{ width: `${(100 - pctPagado)}%`, background: '#f59e0b' }} />
          </div>
          <div className="da-kpi-footer">
            <span>Pendiente + Programado</span>
            <span>{(100 - pctPagado).toFixed(1)}%</span>
          </div>
        </div>

        {/* KPI 4: Retenciones */}
        <div className="da-kpi-card">
          <div className="da-kpi-top">
            <span className="da-kpi-title">Retenciones</span>
            <div className="da-kpi-icon" style={{ background: '#fdf4ff', color: '#a855f7' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val" style={{ color: '#9333ea' }}>{soles.format(totalRetenciones)}</div>
          <div className="da-kpi-footer">
            <span>Bruto: {soles.format(totalBruto)}</span>
          </div>
        </div>

        {/* KPI 5: Ticket Promedio */}
        <div className="da-kpi-card">
          <div className="da-kpi-top">
            <span className="da-kpi-title">Ticket Promedio</span>
            <div className="da-kpi-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val">{soles.format(ticketPromedio)}</div>
          <div className="da-kpi-footer">
            <span>Promedio por orden</span>
          </div>
        </div>
      </section>

      {/* Grilla Principal de Gráficos Analíticos */}
      <section className="da-charts-grid">
        {/* Gráfico 1: Donut de Ejecución por Estado */}
        <div className="da-chart-card">
          <div className="da-chart-header">
            <div>
              <h3 className="da-chart-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <span>Estado del Presupuesto</span>
              </h3>
              <p className="da-chart-desc">Proporción de ejecución financiera según estado de pago</p>
            </div>
          </div>

          <div className="da-donut-wrap">
            <div className="da-donut-svg-box">
              <svg width="170" height="170" viewBox="0 0 180 180">
                {/* Círculo base de fondo */}
                <circle cx="90" cy="90" r="64" fill="transparent" stroke="#f1f5f9" strokeWidth="22" />

                {/* Arco: Pagado (Verde) */}
                {strokePagado > 0 && (
                  <circle
                    cx="90"
                    cy="90"
                    r="64"
                    fill="transparent"
                    stroke="#16a34a"
                    strokeWidth="22"
                    strokeDasharray={`${strokePagado} ${circ}`}
                    strokeDashoffset={offsetPagado}
                    transform="rotate(-90 90 90)"
                    strokeLinecap="round"
                  />
                )}

                {/* Arco: Programado (Azul) */}
                {strokeProgramado > 0 && (
                  <circle
                    cx="90"
                    cy="90"
                    r="64"
                    fill="transparent"
                    stroke="#0284c7"
                    strokeWidth="22"
                    strokeDasharray={`${strokeProgramado} ${circ}`}
                    strokeDashoffset={offsetProgramado}
                    transform="rotate(-90 90 90)"
                  />
                )}

                {/* Arco: Pendiente (Ámbar) */}
                {strokePendiente > 0 && (
                  <circle
                    cx="90"
                    cy="90"
                    r="64"
                    fill="transparent"
                    stroke="#d97706"
                    strokeWidth="22"
                    strokeDasharray={`${strokePendiente} ${circ}`}
                    strokeDashoffset={offsetPendiente}
                    transform="rotate(-90 90 90)"
                  />
                )}
              </svg>

              <div className="da-donut-center">
                <span className="da-donut-center-pct">{pctPagado.toFixed(0)}%</span>
                <span className="da-donut-center-lbl">Pagado</span>
              </div>
            </div>

            <div className="da-donut-legend">
              <div className="da-legend-item">
                <div className="da-legend-name">
                  <span className="da-legend-dot" style={{ background: '#16a34a' }} />
                  <span>Pagado</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="da-legend-val">{soles.format(montoPagado)}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{pctPagado.toFixed(1)}%</small>
                </div>
              </div>

              <div className="da-legend-item">
                <div className="da-legend-name">
                  <span className="da-legend-dot" style={{ background: '#0284c7' }} />
                  <span>Programado</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="da-legend-val">{soles.format(montoProgramado)}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{pctProgramado.toFixed(1)}%</small>
                </div>
              </div>

              <div className="da-legend-item">
                <div className="da-legend-name">
                  <span className="da-legend-dot" style={{ background: '#d97706' }} />
                  <span>Pendiente</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="da-legend-val">{soles.format(montoPendiente)}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{pctPendiente.toFixed(1)}%</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Ranking de Gastos por Sede */}
        <div className="da-chart-card">
          <div className="da-chart-header">
            <div>
              <h3 className="da-chart-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                </svg>
                <span>Distribución por Sede</span>
              </h3>
              <p className="da-chart-desc">Sedes ordenadas por volumen de gasto asignado</p>
            </div>
          </div>

          <div className="da-bars-list">
            {rankingSedes.slice(0, 6).map((item, idx) => (
              <div key={item.sede} className="da-bar-row">
                <div className="da-bar-label-box">
                  <span className="da-bar-label">
                    <span style={{ color: '#64748b', fontSize: '0.75rem', width: '16px' }}>#{idx + 1}</span>
                    <span>{item.sede}</span>
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="da-bar-amount">{soles.format(item.monto)}</span>
                    <small style={{ color: '#64748b', marginLeft: '8px', fontSize: '0.75rem' }}>{item.pct.toFixed(1)}%</small>
                  </div>
                </div>
                <div className="da-bar-track">
                  <div
                    className="da-bar-fill"
                    style={{
                      width: `${(item.monto / maxSedeMonto) * 100}%`,
                      background: idx === 0
                        ? 'linear-gradient(90deg, #2563eb, #38bdf8)'
                        : idx === 1
                        ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                        : '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 3: Gastos por Categoría */}
        <div className="da-chart-card">
          <div className="da-chart-header">
            <div>
              <h3 className="da-chart-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>Gastos por Categoría</span>
              </h3>
              <p className="da-chart-desc">Rubros con mayor impacto en el presupuesto</p>
            </div>
          </div>

          <div className="da-bars-list">
            {rankingCategorias.slice(0, 6).map(item => (
              <div key={item.categoria} className="da-bar-row">
                <div className="da-bar-label-box">
                  <span className="da-bar-label">
                    <span className="vt-cat-pill">{item.categoria}</span>
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="da-bar-amount">{soles.format(item.monto)}</span>
                    <small style={{ color: '#64748b', marginLeft: '8px', fontSize: '0.75rem' }}>{item.pct.toFixed(1)}%</small>
                  </div>
                </div>
                <div className="da-bar-track">
                  <div
                    className="da-bar-fill"
                    style={{
                      width: `${(item.monto / maxCatMonto) * 100}%`,
                      background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 4: Evolución Cronológica / Mensual */}
        <div className="da-chart-card">
          <div className="da-chart-header">
            <div>
              <h3 className="da-chart-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Evolución Presupuestal por Periodo</span>
              </h3>
              <p className="da-chart-desc">Comportamiento del gasto a lo largo de los meses</p>
            </div>
          </div>

          <div className="da-monthly-chart-wrap">
            <div className="da-monthly-chart">
              {evolucionMensual.map(item => {
                const heightPct = Math.max(14, (item.monto / maxMesMonto) * 100)
                return (
                  <div key={item.mes} className="da-col-group">
                    <span className="da-col-val">{soles.format(item.monto)}</span>
                    <div className="da-col-bar" style={{ height: `${heightPct}%` }} title={`${item.mes}: ${soles.format(item.monto)}`} />
                    <span className="da-col-lbl">{item.mes}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Top 5 Requerimientos Más Grandes (Auditoría Rápida) */}
      <section className="da-chart-card" style={{ gridColumn: '1 / -1' }}>
        <div className="da-chart-header">
          <div>
            <h3 className="da-chart-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              <span>Top 5 Requerimientos con Mayor Monto</span>
            </h3>
            <p className="da-chart-desc">Principales compromisos financieros para seguimiento y control</p>
          </div>
        </div>

        {/* Tabla Desktop */}
        <div className="da-top-desktop-table">
          <table className="da-top-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sede</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Razón Social</th>
                <th>Total a Pagar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {topRequerimientos.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="vt-date-badge">
                      {r.fecha?.split('-').reverse().join('/')}
                    </span>
                  </td>
                  <td><strong>{r.sede}</strong></td>
                  <td><span className="vt-cat-pill">{r.categoria}</span></td>
                  <td style={{ maxWidth: '320px' }}>{r.descripcion}</td>
                  <td>{r.razon_social || '—'}</td>
                  <td><strong style={{ color: '#0f172a' }}>{soles.format(r.total_a_pagar)}</strong></td>
                  <td>
                    <span className={`vt-status-select vt-status-${r.estado.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      ● {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjetas Mobile para Top 5 (Zero Descuadre en Celulares) */}
        <div className="da-top-mobile-cards">
          {topRequerimientos.map((r, i) => (
            <div key={r.id} className="da-top-mobile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="vt-sede-badge">#{i + 1} {r.sede}</span>
                <span className={`vt-status-select vt-status-${r.estado.toLowerCase()}`}>
                  ● {r.estado}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                {r.descripcion}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
                <span className="vt-date-badge">{r.fecha?.split('-').reverse().join('/')}</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{soles.format(r.total_a_pagar)}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
