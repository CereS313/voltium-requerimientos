import { useState } from 'react'
import './CajaChica.css'

// Muestra de los últimos movimientos de Noviembre extraídos de la hoja
const ultimosMovimientosCusco = [
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

const ultimosMovimientosAnta = [
  { item: 1113, fecha: '2026-10-30', beneficiario: 'YOEL QUISPE', doc: 'YAPE', detalle: 'COMBUSTIBLE MOTOSIERRA ANTA (PRESTAMO)', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 20, saldo: 980.00, placa: '' },
  { item: 931, fecha: '2026-10-13', beneficiario: 'VICTOR HERRERA', doc: 'DJ', detalle: 'PASAJES VIAJE A ANTA, VISITA INOPINADA', asiento: 'MOVILIDAD', ingreso: 0, egreso: 28, saldo: 952.00, placa: '' },
  { item: 885, fecha: '2026-10-06', beneficiario: 'WILLIAM AYTI', doc: 'YAPE', detalle: 'CAMBIO DE ACEITE CAMIONETA LIMATAMBO (OFICINA ANTA)', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 250, saldo: 702.00, placa: 'LIMATAMBO' },
  { item: 5, fecha: '2026-06-23', beneficiario: 'WILLIAM AYTI', doc: 'YAPE', detalle: 'ALQUILER OFICINA DE ANTA', asiento: 'ALQUILER DE LOCAL', ingreso: 0, egreso: 860, saldo: 140.00, placa: '' },
]

const ultimosMovimientosValleSagrado = [
  { item: 1301, fecha: '2026-11-19', beneficiario: 'SERVICENTRO SAN CRISTOBAL', doc: 'FACTURA (F006-49410)', detalle: 'COMBUSTIBLE PARA PRUEBA CAMIONETA URUBAMBA', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 150, saldo: 2850.00, placa: 'VBL-915' },
  { item: 428, fecha: '2026-08-13', beneficiario: 'JAIME CCALA', doc: 'YAPE', detalle: 'ENVIO DE ENCOMIENDA A URUBAMBA', asiento: 'ENCOMIENDA/FLETE', ingreso: 0, egreso: 7, saldo: 2843.00, placa: '' },
  { item: 35, fecha: '2026-07-01', beneficiario: 'ALBERTO TUMBA', doc: 'YAPE', detalle: 'INSTALACION Y PLAN INTERNET OFICINA VALLE SAGRADO', asiento: 'SERVICIOS BASICOS', ingreso: 0, egreso: 169, saldo: 2674.00, placa: '' },
  { item: 4, fecha: '2026-07-01', beneficiario: 'ALBERTO TUMBA', doc: 'YAPE', detalle: 'ALQUILER OFICINA VALLE SAGRADO', asiento: 'ALQUILER DE LOCAL', ingreso: 0, egreso: 600, saldo: 2074.00, placa: '' },
]

export default function CajaChica() {
  // Nivel 1: Macro División
  const [macroDivision, setMacroDivision] = useState('cusco') // 'cusco' | 'cajamarca'
  // Nivel 2: Sub-cajas de Cusco
  const [subCajaCusco, setSubCajaCusco] = useState('cusco') // 'cusco' | 'anta' | 'valle_sagrado'
  const [filtroTexto, setFiltroTexto] = useState('')

  const formatearSoles = monto => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)
  }

  // Configuración dinámica según la sub-caja activa
  const configuraciones = {
    cusco: {
      titulo: 'Caja Chica Cusco (Sede Central)',
      subtitulo: 'Rendiciones generales, base de operaciones y administración central (Encargada: Karen Colque)',
      saldo: 1431.80,
      ingresos: 102905.00,
      egresos: 101473.20,
      movimientos: 1315,
      items: ultimosMovimientosCusco,
      responsable: 'Karen Colque',
      sedeText: 'Cusco Central',
    },
    anta: {
      titulo: 'Caja Chica Anta (Sub-sede)',
      subtitulo: 'Gastos operativos de la oficina de Anta, combustibles locales y suministros (Encargado: Yoel Quispe)',
      saldo: 1000.00,
      ingresos: 1000.00,
      egresos: 0.00,
      movimientos: 48,
      items: ultimosMovimientosAnta,
      responsable: 'Yoel Quispe',
      sedeText: 'Anta',
    },
    valle_sagrado: {
      titulo: 'Caja Chica Valle Sagrado (Sub-sede Urubamba)',
      subtitulo: 'Operaciones Valle Sagrado, Urubamba, Calca y Lares (Encargado: Cesar Yarin)',
      saldo: 3000.00,
      ingresos: 3000.00,
      egresos: 0.00,
      movimientos: 62,
      items: ultimosMovimientosValleSagrado,
      responsable: 'Cesar Yarin',
      sedeText: 'Valle Sagrado',
    },
  }

  const activa = configuraciones[subCajaCusco] || configuraciones.cusco

  const movimientosFiltrados = (macroDivision === 'cajamarca' ? [] : activa.items).filter(m => {
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
            <span>
              {macroDivision === 'cajamarca'
                ? 'Caja Chica Cajamarca'
                : activa.titulo}
            </span>
            <span className="cc-badge-live">
              {macroDivision === 'cajamarca' ? 'En Configuración' : 'Arqueo Activo'}
            </span>
            <span className="cc-badge-corp">
              {macroDivision === 'cajamarca' ? 'División Norte' : activa.sedeText}
            </span>
          </h2>
          <p className="cc-desc">
            {macroDivision === 'cajamarca'
              ? 'Módulo de tesorería y rendición de gastos para las operaciones de la sede Cajamarca.'
              : activa.subtitulo}
          </p>
        </div>
      </header>

      {/* ==========================================================================
          SELECTORES DE DIVISIÓN (NIVEL 1: MACRO / NIVEL 2: SUB-CAJAS)
          ========================================================================== */}
      <section className="cc-division-nav">
        {/* Encabezado del Navegador */}
        <div className="cc-division-section-header">
          <div className="cc-division-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Nivel 1: Selección de División Regional</span>
          </div>
          <span className="cc-active-indicator">
            {macroDivision === 'cusco'
              ? `Cusco · ${activa.sedeText}`
              : 'Cajamarca'}
          </span>
        </div>

        {/* NIVEL 1: BOTONES GRANDES (CUSCO vs CAJAMARCA) */}
        <div className="cc-macro-grid">
          {/* Botón 1: CAJA CHICA CUSCO */}
          <button
            type="button"
            onClick={() => setMacroDivision('cusco')}
            className={`cc-macro-card ${macroDivision === 'cusco' ? 'active' : ''}`}
          >
            <div className="cc-macro-left">
              <div className="cc-macro-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
              </div>
              <div className="cc-macro-info">
                <span className="cc-macro-title">CAJA CHICA CUSCO</span>
                <span className="cc-macro-sub">Cusco, Anta y Valle Sagrado</span>
              </div>
            </div>
            <span className="cc-macro-badge">3 Sedes</span>
          </button>

          {/* Botón 2: CAJA CHICA CAJAMARCA */}
          <button
            type="button"
            onClick={() => setMacroDivision('cajamarca')}
            className={`cc-macro-card ${macroDivision === 'cajamarca' ? 'active' : ''}`}
          >
            <div className="cc-macro-left">
              <div className="cc-macro-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="cc-macro-info">
                <span className="cc-macro-title">CAJA CHICA CAJAMARCA</span>
                <span className="cc-macro-sub">División Norte</span>
              </div>
            </div>
            <span className="cc-macro-badge">Nueva Apertura</span>
          </button>
        </div>

        {/* NIVEL 2: SUB-CAJAS DENTRO DE CUSCO */}
        {macroDivision === 'cusco' && (
          <div className="cc-subcajas-wrap">
            <div className="cc-subcajas-header">
              <span className="cc-subcajas-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
                <span>Nivel 2: Sub-cajas de la Región Cusco</span>
              </span>
            </div>

            <div className="cc-subcajas-bar">
              {/* Sub-caja 1: Cusco Central */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('cusco')}
                className={`cc-sub-btn ${subCajaCusco === 'cusco' ? 'active' : ''}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Caja Chica Cusco</span>
                <span className="cc-sub-pill">Karen Colque</span>
              </button>

              {/* Sub-caja 2: Anta */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('anta')}
                className={`cc-sub-btn ${subCajaCusco === 'anta' ? 'active' : ''}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Caja Chica Anta</span>
                <span className="cc-sub-pill">Yoel Quispe</span>
              </button>

              {/* Sub-caja 3: Valle Sagrado */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('valle_sagrado')}
                className={`cc-sub-btn ${subCajaCusco === 'valle_sagrado' ? 'active' : ''}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
                <span>Caja Chica Valle Sagrado</span>
                <span className="cc-sub-pill">Cesar Yarin</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* VISTA SEGÚN LA SELECCIÓN */}
      {macroDivision === 'cajamarca' ? (
        /* Pantalla de Cajamarca (En preparación) */
        <section className="cc-action-banner" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="cc-banner-content">
            <div className="cc-banner-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)', color: '#60a5fa' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="cc-banner-text">
              <h3>
                CAJA CHICA CAJAMARCA (División Norte)
                <span className="cc-banner-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                  Pendiente de Apertura
                </span>
              </h3>
              <p>
                Esta sección está reservada para registrar las asignaciones, remesas y rendiciones de gastos de las operaciones de Cajamarca. Cuando se designe el monto inicial y el encargado, se activará la sincronización en tiempo real.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Tarjetas KPI de Estado Financiero de la Caja Seleccionada */}
          <section className="cc-kpis">
            <div className="cc-kpi-card cc-kpi-saldo">
              <div>
                <span className="cc-kpi-label">Saldo Disponible en Caja</span>
                <span className="cc-kpi-val cc-kpi-val-green">{formatearSoles(activa.saldo)}</span>
                <span className="cc-kpi-sub">{activa.titulo}</span>
              </div>
              <div className="cc-kpi-icon cc-icon-emerald">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Total Ingresos Asignados</span>
                <span className="cc-kpi-val">{formatearSoles(activa.ingresos)}</span>
                <span className="cc-kpi-sub">Presupuesto / Remesas</span>
              </div>
              <div className="cc-kpi-icon cc-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Total Egresos Rendidos</span>
                <span className="cc-kpi-val">{formatearSoles(activa.egresos)}</span>
                <span className="cc-kpi-sub">Comprobantes procesados</span>
              </div>
              <div className="cc-kpi-icon cc-icon-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Encargado Responsable</span>
                <span className="cc-kpi-val" style={{ fontSize: '1.05rem', marginTop: '6px' }}>{activa.responsable}</span>
                <span className="cc-kpi-sub">{activa.movimientos} registros en historial</span>
              </div>
              <div className="cc-kpi-icon cc-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </section>

          {/* Tabla con Muestra de Movimientos de la Caja Seleccionada */}
          <section className="cc-table-card">
            <div className="cc-table-top">
              <div className="cc-table-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Movimientos Recientes · {activa.titulo}</span>
                <span className="cc-pill-count">{movimientosFiltrados.length} registros</span>
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
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron registros para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map(m => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
