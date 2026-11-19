import { useState } from 'react'
import './CajaChica.css'

// Muestra de los últimos movimientos de Noviembre extraídos de la hoja
const ultimosMovimientos = [
  { item: 1315, fecha: '2026-11-19', beneficiario: 'JOSE INQUILLAY', doc: 'FACTURA', detalle: 'TERMINALES CONECTORES CON SU COBERTOR (REINTEGRO ELSE)', asiento: 'SUMINISTROS DE TRABAJO/EPPS', ingreso: 0, egreso: 87, saldo: 1431.80, placa: '' },
  { item: 1314, fecha: '2026-11-19', beneficiario: 'WILLIAM AYTI', doc: 'FACTURA', detalle: 'ADELANTO COMPRA DE 03 CAJAS FOCOS LED PARA CAMIONETA', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 100, saldo: 1518.80, placa: '' },
  { item: 1313, fecha: '2026-11-19', beneficiario: 'FLAVIO GONZALO', doc: 'YAPE', detalle: 'ACEITE DE 2 TIEMPOS MOTOSIERRA OCONGATE', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 5, saldo: 1618.80, placa: '' },
  { item: 1312, fecha: '2026-11-19', beneficiario: 'QQUESOHUALPA QQUENAYA', doc: 'FACTURA (FP01-4726)', detalle: 'COMBUSTIBLE MOTOSIERRA OCONGATE', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 20, saldo: 1623.80, placa: '' },
  { item: 1311, fecha: '2026-11-19', beneficiario: 'WILIHAMS ASTETE', doc: 'YAPE', detalle: 'TAXI PARA TRAER MATERIALES DE ELSE PARA URUBAMBA', asiento: 'MOVILIDAD', ingreso: 0, egreso: 7, saldo: 1643.80, placa: '' },
  { item: 1310, fecha: '2026-11-19', beneficiario: 'UCHARO JARRO SHERLY', doc: 'FACTURA (E001-433)', detalle: '1.00 UNIDAD FOCO LED IR100', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 280, saldo: 1650.80, placa: '' },
  { item: 1309, fecha: '2026-11-19', beneficiario: 'JV INGENIEROS EIRL', doc: 'FACTURA (F001-18584)', detalle: 'BATERIA SOLITE 12V', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 400, saldo: 1930.80, placa: '' },
  { item: 1308, fecha: '2026-11-19', beneficiario: 'SERV ELENA EIRL', doc: 'FACTURA (FA01-39182)', detalle: 'COMBUSTIBLE CAMIONETA VBL915', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 100, saldo: 2330.80, placa: 'VBL-915' },
  { item: 1305, fecha: '2026-11-19', beneficiario: 'VALDIVIA GUZMAN RUBEN', doc: 'FACTURA (F001-7489)', detalle: 'COMBUSTIBLE CAMIONETA (VAN 934) SALVACION', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 100, saldo: 2715.80, placa: 'VAN-934' },
  { item: 1300, fecha: '2026-11-18', beneficiario: 'SERVICENTRO METROPOLITANO', doc: 'FACTURA (FA01-38703)', detalle: 'COMBUSTIBLE CAMIONETA CUSCO 01', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 200, saldo: 3195.80, placa: 'X6N-838' },
  { item: 1297, fecha: '2026-11-18', beneficiario: 'KAREN COLQUE', doc: 'TRANSFERENCIA BCP', detalle: 'INGRESO A CAJA CHICA (REPOSICIÓN)', asiento: 'INGRESO', ingreso: 3500, egreso: 0, saldo: 3695.95, placa: '' },
]

export default function CajaChica() {
  const [filtroTexto, setFiltroTexto] = useState('')

  const formatearSoles = monto => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)
  }

  const movimientosFiltrados = ultimosMovimientos.filter(m => {
    if (!filtroTexto) return true
    const q = filtroTexto.toLowerCase()
    return (
      m.beneficiario.toLowerCase().includes(q) ||
      m.detalle.toLowerCase().includes(q) ||
      m.asiento.toLowerCase().includes(q) ||
      m.placa.toLowerCase().includes(q)
    )
  })

  return (
    <div className="cc-container">
      {/* Cabecera Principal */}
      <header className="cc-header">
        <div className="cc-header-info">
          <h2 className="cc-title">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>Caja Chica · Control de Flujo de Efectivo</span>
            <span className="cc-badge-live">Arqueo al Día</span>
            <span className="cc-badge-corp">Cusco & Sedes</span>
          </h2>
          <p className="cc-desc">
            Administración centralizada de ingresos, egresos, gastos operativos, combustible por placa vehicular y rendiciones de cuentas con comprobante.
          </p>
        </div>
      </header>

      {/* Tarjetas KPI de Estado Financiero */}
      <section className="cc-kpis">
        {/* Saldo Actual */}
        <div className="cc-kpi-card cc-kpi-saldo">
          <div>
            <span className="cc-kpi-label">Saldo Disponible en Caja</span>
            <span className="cc-kpi-val cc-kpi-val-green">{formatearSoles(1431.80)}</span>
            <span className="cc-kpi-sub">Arqueo conciliado · 19 Nov 2026</span>
          </div>
          <div className="cc-kpi-icon cc-icon-emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
        </div>

        {/* Total Ingresos */}
        <div className="cc-kpi-card">
          <div>
            <span className="cc-kpi-label">Total Ingresos Recibidos</span>
            <span className="cc-kpi-val">{formatearSoles(102905.00)}</span>
            <span className="cc-kpi-sub">42 remesas transferidas (Jun - Nov)</span>
          </div>
          <div className="cc-kpi-icon cc-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="cc-kpi-card">
          <div>
            <span className="cc-kpi-label">Total Egresos Rendidos</span>
            <span className="cc-kpi-val">{formatearSoles(101473.20)}</span>
            <span className="cc-kpi-sub">1,273 comprobantes procesados</span>
          </div>
          <div className="cc-kpi-icon cc-icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        </div>

        {/* Total Movimientos */}
        <div className="cc-kpi-card">
          <div>
            <span className="cc-kpi-label">Registros Históricos</span>
            <span className="cc-kpi-val">1,315</span>
            <span className="cc-kpi-sub">Base completa en Google Sheets</span>
          </div>
          <div className="cc-kpi-icon cc-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>
      </section>

      {/* Banner de Estado de Integración */}
      <section className="cc-action-banner">
        <div className="cc-banner-content">
          <div className="cc-banner-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="cc-banner-text">
            <h3>
              Estructura lista para migrar los 1,315 registros de Google Sheets
              <span className="cc-banner-badge">Fase 2 Lista</span>
            </h3>
            <p>
              Ya tenemos organizada la tipificación de tus 25 tipos de asiento (Combustible, Viáticos, EPPs, etc.) y las placas vehiculares. En cuanto ejecutes el script en Supabase, este módulo pasará a sincronizarse en tiempo real con formulario de nuevo gasto y foto de comprobante.
            </p>
          </div>
        </div>
      </section>

      {/* Insights y Desglose Operativo */}
      <div className="cc-insights-grid">
        {/* Top Categorías de Gasto */}
        <div className="cc-card">
          <h4 className="cc-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: '#f59e0b' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
            </svg>
            <span>Principales Rubros de Gasto en Caja</span>
          </h4>
          <div className="cc-category-list">
            <div className="cc-cat-item">
              <div className="cc-cat-info">
                <span className="cc-cat-name">1. Combustible (Camionetas & Motos)</span>
                <span className="cc-cat-amount">~38.5% (S/ 39,000+)</span>
              </div>
              <div className="cc-progress-bar">
                <div className="cc-progress-fill" style={{ width: '38.5%' }} />
              </div>
            </div>

            <div className="cc-cat-item">
              <div className="cc-cat-info">
                <span className="cc-cat-name">2. Mantenimiento Vehicular & Taller</span>
                <span className="cc-cat-amount">~15.2% (S/ 15,400+)</span>
              </div>
              <div className="cc-progress-bar">
                <div className="cc-progress-fill-amber" style={{ width: '15.2%' }} />
              </div>
            </div>

            <div className="cc-cat-item">
              <div className="cc-cat-info">
                <span className="cc-cat-name">3. Suministros de Trabajo & EPPs</span>
                <span className="cc-cat-amount">~11.8% (S/ 11,900+)</span>
              </div>
              <div className="cc-progress-bar">
                <div className="cc-progress-fill-blue" style={{ width: '11.8%' }} />
              </div>
            </div>

            <div className="cc-cat-item">
              <div className="cc-cat-info">
                <span className="cc-cat-name">4. Viáticos & Alimentación de Campo</span>
                <span className="cc-cat-amount">~9.4% (S/ 9,500+)</span>
              </div>
              <div className="cc-progress-bar">
                <div className="cc-progress-fill-purple" style={{ width: '9.4%' }} />
              </div>
            </div>

            <div className="cc-cat-item">
              <div className="cc-cat-info">
                <span className="cc-cat-name">5. Garajes de Unidades</span>
                <span className="cc-cat-amount">~5.8% (S/ 5,800+)</span>
              </div>
              <div className="cc-progress-bar">
                <div className="cc-progress-fill" style={{ width: '5.8%', background: '#6366f1' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Flota y Unidades Vehiculares Monitoreadas */}
        <div className="cc-card">
          <h4 className="cc-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: '#0284c7' }}>
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
            <span>Flota Controlada por Placa</span>
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 1rem' }}>
            Cada gasto de combustible o taller queda enlazado con su placa para auditoría de rendimiento por vehículo:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="cc-chip-placa">🚗 X6E-791 (Urcos)</span>
            <span className="cc-chip-placa">🚗 Z7Z-723 (Paruro)</span>
            <span className="cc-chip-placa">🚗 TCT-881 (Ccatcca)</span>
            <span className="cc-chip-placa">🚗 VBG-860 (Ocongate)</span>
            <span className="cc-chip-placa">🚗 X6L-937 (Cusco 01)</span>
            <span className="cc-chip-placa">🚗 X6G-799 (Cusco 02)</span>
            <span className="cc-chip-placa">🚗 X6N-829 (Nuevo)</span>
            <span className="cc-chip-placa">🚗 X6N-838 (Nuevo)</span>
            <span className="cc-chip-placa">🏍️ 2122-UX (Moto 3)</span>
            <span className="cc-chip-placa">🏍️ 2233-UX (Moto 4)</span>
            <span className="cc-chip-placa">🏍️ 2124-UX (Moto 5)</span>
            <span className="cc-chip-placa">🏍️ 2557-UX (Moto 6)</span>
          </div>
        </div>
      </div>

      {/* Tabla con Muestra de Movimientos Recientes */}
      <section className="cc-table-card">
        <div className="cc-table-top">
          <div className="cc-table-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Últimos Movimientos Registrados en Caja</span>
            <span className="cc-pill-count">{movimientosFiltrados.length} mostrados</span>
          </div>
          <input
            type="text"
            placeholder="Buscar por beneficiario, placa o detalle..."
            value={filtroTexto}
            onChange={e => setFiltroTexto(e.target.value)}
            style={{
              height: '34px',
              padding: '0 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.84rem',
              outline: 'none',
              width: '280px',
            }}
          />
        </div>

        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}># Item</th>
                <th style={{ width: '100px' }}>Fecha</th>
                <th>Beneficiario / Razón Social</th>
                <th>Comprobante</th>
                <th>Detalle de la Operación</th>
                <th>Tipo de Asiento</th>
                <th style={{ width: '90px' }}>Placa</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Ingreso</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Egreso</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Saldo Acum.</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map(m => (
                <tr key={m.item}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>#{m.item}</td>
                  <td style={{ color: '#475569', fontSize: '0.84rem' }}>{m.fecha}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.beneficiario}</td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{m.doc}</td>
                  <td style={{ color: '#334155' }}>{m.detalle}</td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {m.asiento}
                    </span>
                  </td>
                  <td>
                    {m.placa ? <span className="cc-chip-placa">{m.placa}</span> : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                    {m.ingreso > 0 ? (
                      <span className="cc-badge-ingreso">+{formatearSoles(m.ingreso)}</span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
                    {m.egreso > 0 ? (
                      <span className="cc-badge-egreso">-{formatearSoles(m.egreso)}</span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {formatearSoles(m.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
