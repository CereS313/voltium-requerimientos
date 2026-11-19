import { useState } from 'react'
import './DashboardAnalitico.css'

export default function DashboardAnalitico({ filas, soles }) {
  const [filtroSede, setFiltroSede] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [seccionActiva, setSeccionActiva] = useState('todas') // 'todas' | 'flujo' | 'sedes' | 'proveedores' | 'temporal'

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

  // 2. Agrupación por Sede (Volumen y Eficiencia)
  const sedesMap = filasFiltradas.reduce((acc, f) => {
    if (!acc[f.sede]) {
      acc[f.sede] = { total: 0, pagado: 0, porPagar: 0, count: 0 }
    }
    const monto = Number(f.total_a_pagar) || 0
    acc[f.sede].total += monto
    acc[f.sede].count += 1
    if (f.estado === 'Pagado') {
      acc[f.sede].pagado += monto
    } else {
      acc[f.sede].porPagar += monto
    }
    return acc
  }, {})

  const rankingSedes = Object.entries(sedesMap)
    .map(([sede, data]) => ({
      sede,
      monto: data.total,
      pagado: data.pagado,
      porPagar: data.porPagar,
      pctTotal: totalPresupuesto > 0 ? (data.total / totalPresupuesto) * 100 : 0,
      pctPagado: data.total > 0 ? (data.pagado / data.total) * 100 : 0,
      count: data.count,
    }))
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

  // 4. Concentración de Proveedores / Razones Sociales (Top Contratistas)
  const proveedoresMap = filasFiltradas.reduce((acc, f) => {
    const prov = (f.razon_social || '').trim()
    if (prov) {
      acc[prov] = (acc[prov] || 0) + (Number(f.total_a_pagar) || 0)
    }
    return acc
  }, {})
  const rankingProveedores = Object.entries(proveedoresMap)
    .map(([proveedor, monto]) => ({
      proveedor,
      monto,
      pct: totalPresupuesto > 0 ? (monto / totalPresupuesto) * 100 : 0,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 6)
  const maxProveedorMonto = rankingProveedores[0]?.monto || 1

  // 5. Segmentación por Rango de Montos (Distribución de Tickets / Histograma)
  const RANGOS_CONFIG = [
    { id: 'menor', label: '< S/ 500', desc: 'Gastos Menores / Caja Chica', min: 0, max: 500, colorClass: 'cyan' },
    { id: 'medio', label: 'S/ 500 - 2,500', desc: 'Operativos Regulares', min: 500, max: 2500, colorClass: 'green' },
    { id: 'alto', label: 'S/ 2,500 - 10,000', desc: 'Servicios Clave / Combustible', min: 2500, max: 10000, colorClass: 'amber' },
    { id: 'critico', label: '> S/ 10,000', desc: 'Alto Impacto / Contratos', min: 10000, max: Infinity, colorClass: 'orange' },
  ]
  const distribucionTickets = RANGOS_CONFIG.map(r => {
    const items = filasFiltradas.filter(f => {
      const val = Number(f.total_a_pagar) || 0
      return val >= r.min && (r.max === Infinity ? true : val < r.max)
    })
    const monto = items.reduce((acc, f) => acc + (Number(f.total_a_pagar) || 0), 0)
    return {
      ...r,
      count: items.length,
      monto,
      pctMonto: totalPresupuesto > 0 ? (monto / totalPresupuesto) * 100 : 0,
      pctCount: filasFiltradas.length > 0 ? (items.length / filasFiltradas.length) * 100 : 0,
    }
  })
  const maxTicketCount = Math.max(...distribucionTickets.map(t => t.count), 1)

  // 6. Análisis por Día de la Semana (Ritmo de Gasto de Lun a Dom)
  const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const diasSemanaMap = [0, 1, 2, 3, 4, 5, 6].map(d => ({
    diaNum: d,
    nombre: diasSemanaNombres[d],
    monto: 0,
    count: 0,
  }))
  filasFiltradas.forEach(f => {
    if (f.fecha) {
      const p = f.fecha.split('-').map(Number)
      if (p.length === 3) {
        const fechaObj = new Date(p[0], p[1] - 1, p[2])
        const dia = fechaObj.getDay()
        diasSemanaMap[dia].monto += Number(f.total_a_pagar) || 0
        diasSemanaMap[dia].count += 1
      }
    }
  })
  // Ordenar de Lunes a Domingo para presentación empresarial
  const diasSemanaOrdenados = [
    diasSemanaMap[1], // Lun
    diasSemanaMap[2], // Mar
    diasSemanaMap[3], // Mié
    diasSemanaMap[4], // Jue
    diasSemanaMap[5], // Vie
    diasSemanaMap[6], // Sáb
    diasSemanaMap[0], // Dom
  ]
  const maxDiaMonto = Math.max(...diasSemanaOrdenados.map(d => d.monto), 1)

  // 7. Agrupación por Mes (Evolución Cronológica)
  const mesesMap = filasFiltradas.reduce((acc, f) => {
    const mes = f.fecha?.slice(0, 7) || 'Sin fecha'
    acc[mes] = (acc[mes] || 0) + (Number(f.total_a_pagar) || 0)
    return acc
  }, {})
  const evolucionMensual = Object.entries(mesesMap)
    .map(([mes, monto]) => ({ mes, monto }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
  const maxMesMonto = Math.max(...evolucionMensual.map(m => m.monto), 1)

  // 8. Top 5 Mayores Requerimientos
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
      {/* =====================================================================
          1. CABECERA & FILTROS (Command Header)
          ===================================================================== */}
      <header className="da-header">
        <div className="da-header-info">
          <h2 className="da-title">
            <span className="da-title-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </span>
            <span>Dashboard Analítico</span>
            <span className="da-title-badge">CONTROL FINANCIERO 360°</span>
          </h2>
          <p className="da-subtitle">
            Telemetría presupuestaria avanzada, diagnóstico de liquidez y análisis multidimensional
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
              className="da-btn-clear"
            >
              Restablecer
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          BARRA DE NAVEGACIÓN MODULAR (Filtros de Enfoque Analítico)
          ===================================================================== */}
      <div className="da-nav-chips" role="tablist" aria-label="Dimensiones de análisis">
        <button
          type="button"
          onClick={() => setSeccionActiva('todas')}
          className={`da-nav-chip ${seccionActiva === 'todas' ? 'active' : ''}`}
        >
          <span>📊 Tablero Integral 360°</span>
          <span className="da-chip-count">{filasFiltradas.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('flujo')}
          className={`da-nav-chip ${seccionActiva === 'flujo' ? 'active' : ''}`}
        >
          <span>⚡ Flujo & Tickets</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('sedes')}
          className={`da-nav-chip ${seccionActiva === 'sedes' ? 'active' : ''}`}
        >
          <span>🏢 Sedes & Eficiencia</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('proveedores')}
          className={`da-nav-chip ${seccionActiva === 'proveedores' ? 'active' : ''}`}
        >
          <span>💼 Proveedores & Rubros</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('temporal')}
          className={`da-nav-chip ${seccionActiva === 'temporal' ? 'active' : ''}`}
        >
          <span>📅 Cronología & Días</span>
        </button>
      </div>

      {/* =====================================================================
          2. CINTA KPI EJECUTIVA (5 Métricas Clave de Comando)
          ===================================================================== */}
      <section className="da-kpi-grid">
        {/* KPI 1: Presupuesto Total */}
        <div className="da-kpi-card da-kpi-card-amber">
          <div className="da-kpi-top">
            <span className="da-kpi-title">PRESUPUESTO TOTAL</span>
            <div className="da-kpi-icon da-icon-amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val da-val-amber">{soles.format(totalPresupuesto)}</div>
          <div className="da-kpi-footer">
            <span>{filasFiltradas.length} requerimientos</span>
            <span className="da-tag-amber">100% total</span>
          </div>
        </div>

        {/* KPI 2: Ejecutado / Pagado */}
        <div className="da-kpi-card da-kpi-card-green">
          <div className="da-kpi-top">
            <span className="da-kpi-title">MONTO EJECUTADO</span>
            <div className="da-kpi-icon da-icon-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val da-val-green">{soles.format(montoPagado)}</div>
          <div className="da-kpi-progress">
            <div className="da-kpi-progress-bar da-fill-green" style={{ width: `${pctPagado}%` }} />
          </div>
          <div className="da-kpi-footer">
            <span>{pctPagado.toFixed(1)}% ejecutado</span>
            <span className="da-tag-green">Pagado</span>
          </div>
        </div>

        {/* KPI 3: Por Pagar (Comprometido) */}
        <div className="da-kpi-card da-kpi-card-orange">
          <div className="da-kpi-top">
            <span className="da-kpi-title">POR PAGAR</span>
            <div className="da-kpi-icon da-icon-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val da-val-orange">{soles.format(montoPorPagar)}</div>
          <div className="da-kpi-progress">
            <div className="da-kpi-progress-bar da-fill-orange" style={{ width: `${(100 - pctPagado)}%` }} />
          </div>
          <div className="da-kpi-footer">
            <span>Pendiente + Programado</span>
            <span className="da-tag-orange">{(100 - pctPagado).toFixed(1)}%</span>
          </div>
        </div>

        {/* KPI 4: Retenciones */}
        <div className="da-kpi-card da-kpi-card-purple">
          <div className="da-kpi-top">
            <span className="da-kpi-title">RETENCIONES</span>
            <div className="da-kpi-icon da-icon-purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val da-val-purple">{soles.format(totalRetenciones)}</div>
          <div className="da-kpi-footer">
            <span>Bruto: {soles.format(totalBruto)}</span>
          </div>
        </div>

        {/* KPI 5: Ticket Promedio */}
        <div className="da-kpi-card da-kpi-card-cyan">
          <div className="da-kpi-top">
            <span className="da-kpi-title">TICKET PROMEDIO</span>
            <div className="da-kpi-icon da-icon-cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="da-kpi-val da-val-cyan">{soles.format(ticketPromedio)}</div>
          <div className="da-kpi-footer">
            <span>Promedio por orden</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. MATRIZ DE GRÁFICOS ANALÍTICOS (8 Dimensiones de Diagnóstico)
          ===================================================================== */}
      <section className="da-charts-grid">
        {/* -------------------------------------------------------------------
            GRÁFICO 1: Donut de Ejecución por Estado
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'flujo') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
                  <circle cx="90" cy="90" r="64" fill="transparent" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="22" />

                  {strokePagado > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="64"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="22"
                      strokeDasharray={`${strokePagado} ${circ}`}
                      strokeDashoffset={offsetPagado}
                      transform="rotate(-90 90 90)"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.45))' }}
                    />
                  )}

                  {strokeProgramado > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="64"
                      fill="transparent"
                      stroke="#06b6d4"
                      strokeWidth="22"
                      strokeDasharray={`${strokeProgramado} ${circ}`}
                      strokeDashoffset={offsetProgramado}
                      transform="rotate(-90 90 90)"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.45))' }}
                    />
                  )}

                  {strokePendiente > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="64"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="22"
                      strokeDasharray={`${strokePendiente} ${circ}`}
                      strokeDashoffset={offsetPendiente}
                      transform="rotate(-90 90 90)"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.45))' }}
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
                    <span className="da-legend-dot green" />
                    <span>Pagado</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="da-legend-val da-text-green">{soles.format(montoPagado)}</div>
                    <small className="da-legend-sub">{pctPagado.toFixed(1)}%</small>
                  </div>
                </div>

                <div className="da-legend-item">
                  <div className="da-legend-name">
                    <span className="da-legend-dot cyan" />
                    <span>Programado</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="da-legend-val da-text-cyan">{soles.format(montoProgramado)}</div>
                    <small className="da-legend-sub">{pctProgramado.toFixed(1)}%</small>
                  </div>
                </div>

                <div className="da-legend-item">
                  <div className="da-legend-name">
                    <span className="da-legend-dot amber" />
                    <span>Pendiente</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="da-legend-val da-text-amber">{soles.format(montoPendiente)}</div>
                    <small className="da-legend-sub">{pctPendiente.toFixed(1)}%</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 2: Segmentación de Tickets por Rango de Monto (Histograma)
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'flujo') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="13" y2="17" />
                  </svg>
                  <span>Distribución de Tickets por Rango</span>
                </h3>
                <p className="da-chart-desc">Segmentación por magnitud del importe para control de riesgo</p>
              </div>
            </div>

            <div className="da-ticket-ranges-list">
              {distribucionTickets.map(r => (
                <div key={r.id} className="da-ticket-range-row">
                  <div className="da-ticket-meta">
                    <div className="da-ticket-label-wrap">
                      <span className={`da-ticket-badge ${r.colorClass}`}>{r.label}</span>
                      <span className="da-ticket-sub">{r.desc}</span>
                    </div>
                    <div className="da-ticket-values">
                      <span className="da-ticket-amount">{soles.format(r.monto)}</span>
                      <span className="da-ticket-count">({r.count} órdenes · {r.pctMonto.toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="da-ticket-track">
                    <div
                      className={`da-ticket-fill ${r.colorClass}`}
                      style={{ width: `${(r.count / maxTicketCount) * 100}%` }}
                      title={`${r.count} órdenes en este rango`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 3: Ranking de Gastos por Sede (Volumen Asignado)
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'sedes') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                  </svg>
                  <span>Volumen Presupuestal por Sede</span>
                </h3>
                <p className="da-chart-desc">Sedes ordenadas por volumen total de gasto asignado</p>
              </div>
            </div>

            <div className="da-bars-list">
              {rankingSedes.slice(0, 6).map((item, idx) => (
                <div key={item.sede} className="da-bar-row">
                  <div className="da-bar-label-box">
                    <span className="da-bar-label">
                      <span className="da-rank-num">#{idx + 1}</span>
                      <span className="da-rank-name">{item.sede}</span>
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span className="da-bar-amount">{soles.format(item.monto)}</span>
                      <small className="da-bar-pct">{item.pctTotal.toFixed(1)}%</small>
                    </div>
                  </div>
                  <div className="da-bar-track">
                    <div
                      className="da-bar-fill"
                      style={{
                        width: `${(item.monto / maxSedeMonto) * 100}%`,
                        background: idx === 0
                          ? 'linear-gradient(90deg, #0284c7, #38bdf8)'
                          : idx === 1
                          ? 'linear-gradient(90deg, #0ea5e9, #67e8f9)'
                          : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: idx < 2 ? '0 0 10px rgba(56, 189, 248, 0.35)' : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 4: Matriz de Eficiencia de Pago por Sede (Tasa de Liquidación)
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'sedes') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Tasa de Liquidación por Sede</span>
                </h3>
                <p className="da-chart-desc">Porcentaje liquidado (pagado) vs saldo pendiente por resolver</p>
              </div>
            </div>

            <div className="da-efficiency-list">
              {rankingSedes.slice(0, 6).map(item => (
                <div key={item.sede} className="da-efficiency-row">
                  <div className="da-efficiency-header">
                    <span className="da-efficiency-name">{item.sede}</span>
                    <div className="da-efficiency-stats">
                      <span className="da-efficiency-badge-green">{item.pctPagado.toFixed(0)}% Pagado</span>
                      <span className="da-efficiency-sub">
                        (Pendiente: {soles.format(item.porPagar)})
                      </span>
                    </div>
                  </div>

                  {/* Barra apilada: Verde Pagado + Naranja Por Pagar */}
                  <div className="da-efficiency-bar-track">
                    <div
                      className="da-efficiency-bar-pagado"
                      style={{ width: `${item.pctPagado}%` }}
                      title={`Pagado: ${soles.format(item.pagado)} (${item.pctPagado.toFixed(1)}%)`}
                    />
                    <div
                      className="da-efficiency-bar-pendiente"
                      style={{ width: `${100 - item.pctPagado}%` }}
                      title={`Por Pagar: ${soles.format(item.porPagar)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 5: Gastos por Categoría
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'proveedores') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span>Gastos por Categoría</span>
                </h3>
                <p className="da-chart-desc">Rubros con mayor impacto en el presupuesto asignado</p>
              </div>
            </div>

            <div className="da-bars-list">
              {rankingCategorias.slice(0, 6).map(item => (
                <div key={item.categoria} className="da-bar-row">
                  <div className="da-bar-label-box">
                    <span className="da-bar-label">
                      <span className="da-cat-chip">{item.categoria}</span>
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span className="da-bar-amount">{soles.format(item.monto)}</span>
                      <small className="da-bar-pct">{item.pct.toFixed(1)}%</small>
                    </div>
                  </div>
                  <div className="da-bar-track">
                    <div
                      className="da-bar-fill"
                      style={{
                        width: `${(item.monto / maxCatMonto) * 100}%`,
                        background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                        boxShadow: '0 0 10px rgba(251, 191, 36, 0.35)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 6: Concentración de Proveedores y Contratistas (Top Razón Social)
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'proveedores') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Top Proveedores & Contratistas</span>
                </h3>
                <p className="da-chart-desc">Concentración de compras y pagos por razón social</p>
              </div>
            </div>

            <div className="da-bars-list">
              {rankingProveedores.length > 0 ? (
                rankingProveedores.map((item, idx) => (
                  <div key={item.proveedor} className="da-bar-row">
                    <div className="da-bar-label-box">
                      <span className="da-bar-label">
                        <span className="da-rank-num">#{idx + 1}</span>
                        <span className="da-rank-name" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.proveedor}
                        </span>
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span className="da-bar-amount">{soles.format(item.monto)}</span>
                        <small className="da-bar-pct" style={{ color: '#c084fc' }}>{item.pct.toFixed(1)}%</small>
                      </div>
                    </div>
                    <div className="da-bar-track">
                      <div
                        className="da-bar-fill"
                        style={{
                          width: `${(item.monto / maxProveedorMonto) * 100}%`,
                          background: 'linear-gradient(90deg, #9333ea, #c084fc)',
                          boxShadow: '0 0 10px rgba(192, 132, 252, 0.35)',
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="da-empty-inline">
                  <span>Sin razones sociales registradas en el periodo filtrado.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 7: Evolución Cronológica / Mensual
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'temporal') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
        )}

        {/* -------------------------------------------------------------------
            GRÁFICO 8: Ritmo de Gasto por Día de la Semana (Dinámica Operativa)
            ------------------------------------------------------------------- */}
        {(seccionActiva === 'todas' || seccionActiva === 'temporal') && (
          <div className="da-chart-card">
            <div className="da-chart-header">
              <div>
                <h3 className="da-chart-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Ritmo Operativo por Día de Semana</span>
                </h3>
                <p className="da-chart-desc">Días de mayor generación y concentración de órdenes</p>
              </div>
            </div>

            <div className="da-weekday-chart-wrap">
              <div className="da-weekday-chart">
                {diasSemanaOrdenados.map(d => {
                  const heightPct = Math.max(12, (d.monto / maxDiaMonto) * 100)
                  return (
                    <div key={d.nombre} className="da-weekday-col">
                      <span className="da-weekday-val">{soles.format(d.monto)}</span>
                      <div
                        className="da-weekday-bar"
                        style={{ height: `${heightPct}%` }}
                        title={`${d.nombre}: ${soles.format(d.monto)} (${d.count} requerimientos)`}
                      />
                      <span className="da-weekday-name">{d.nombre}</span>
                      <span className="da-weekday-count">{d.count} req.</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          4. TOP 5 REQUERIMIENTOS MÁS GRANDES (Auditoría de Alto Impacto)
          ===================================================================== */}
      <section className="da-chart-card" style={{ gridColumn: '1 / -1' }}>
        <div className="da-chart-header">
          <div>
            <h3 className="da-chart-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
                <th style={{ textAlign: 'right' }}>Total a Pagar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {topRequerimientos.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="da-date-chip">
                      {r.fecha?.split('-').reverse().join('/')}
                    </span>
                  </td>
                  <td><strong style={{ color: '#ffffff' }}>{r.sede}</strong></td>
                  <td><span className="da-cat-chip">{r.categoria}</span></td>
                  <td style={{ maxWidth: '320px', color: '#e2e8f0' }}>{r.descripcion}</td>
                  <td style={{ color: '#94a3b8' }}>{r.razon_social || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong className="da-amount-highlight">{soles.format(r.total_a_pagar)}</strong>
                  </td>
                  <td>
                    <span className={`da-status-badge da-status-${r.estado.toLowerCase()}`}>
                      <span className="da-status-dot" />
                      <span>{r.estado}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjetas Mobile para Top 5 */}
        <div className="da-top-mobile-cards">
          {topRequerimientos.map((r, i) => (
            <div key={r.id} className="da-top-mobile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="da-rank-name">#{i + 1} {r.sede}</span>
                <span className={`da-status-badge da-status-${r.estado.toLowerCase()}`}>
                  <span className="da-status-dot" />
                  <span>{r.estado}</span>
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>
                {r.descripcion}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                <span className="da-date-chip">{r.fecha?.split('-').reverse().join('/')}</span>
                <strong className="da-amount-highlight">{soles.format(r.total_a_pagar)}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
