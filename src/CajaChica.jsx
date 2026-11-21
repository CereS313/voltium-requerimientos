import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase.js'
import cajaChicaInicial from './cajaChicaInicial.json'
import NuevoMovimientoCaja from './NuevoMovimientoCaja.jsx'
import './CajaChica.css'

const formatearSoles = monto => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto || 0)
}

const CONFIG_SEDES = {
  cusco: {
    nombre: 'Cusco',
    titulo: 'Caja Chica Cusco (Sede Central)',
    subtitulo: 'Rendiciones generales, base de operaciones y administración central (Encargada: Karen Colque)',
    responsable: 'Karen Colque',
    sedeText: 'Cusco Central',
  },
  anta: {
    nombre: 'Anta',
    titulo: 'Caja Chica Anta (Sub-sede)',
    subtitulo: 'Operaciones Anta, Izcuchaca, Limatambo, Cotabambas, Coyllurqui y Tambobamba (Encargado: Yoel Quispe)',
    responsable: 'Yoel Quispe',
    sedeText: 'Anta',
  },
  valle_sagrado: {
    nombre: 'Valle Sagrado',
    titulo: 'Caja Chica Valle Sagrado',
    subtitulo: 'Operaciones Urubamba, Calca, Lares, Paucartambo, Salvación y Machupicchu (Encargado: Cesar Yarin)',
    responsable: 'Cesar Yarin',
    sedeText: 'Valle Sagrado',
  },
  todas: {
    nombre: 'todas',
    titulo: 'Consolidado General de Cajas Chicas',
    subtitulo: 'Visión corporativa unificada de Cusco Central, Anta y Valle Sagrado',
    responsable: 'Administración General',
    sedeText: 'Todas las Sedes',
  },
}

const MESES_NOMBRES = {
  '2026-06': 'Jun 26',
  '2026-07': 'Jul 26',
  '2026-08': 'Ago 26',
  '2026-09': 'Set 26',
  '2026-10': 'Oct 26',
  '2026-11': 'Nov 26',
}

const COLOR_CLASSES = ['cc-fill-cyan', 'cc-fill-emerald', 'cc-fill-amber', 'cc-fill-purple', 'cc-fill-rose', 'cc-fill-blue']

export default function CajaChica({ usuario = null, esDesarrollador = false, registrarActividad = null }) {
  // Pestañas de Vista: 'tabla' (Libro) | 'graficos' (Dashboard)
  const [vistaActiva, setVistaActiva] = useState('tabla')

  // Nivel 1: Macro División
  const [macroDivision, setMacroDivision] = useState('cusco') // 'cusco' | 'cajamarca'
  // Nivel 2: Sub-cajas
  const [subCajaCusco, setSubCajaCusco] = useState('cusco') // 'cusco' | 'anta' | 'valle_sagrado' | 'todas'

  // Datos de la base de datos
  const [movimientos, setMovimientos] = useState(cajaChicaInicial)
  const [cargando, setCargando] = useState(false)
  const [totalEnDB, setTotalEnDB] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)
  const [progresoSync, setProgresoSync] = useState(0)
  const [mensaje, setMensaje] = useState('')

  // Modales CRUD
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [movimientoAEditar, setMovimientoAEditar] = useState(null)

  // Filtros de la tabla
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroAsiento, setFiltroAsiento] = useState('')
  const [filtroDoc, setFiltroDoc] = useState('')
  const [filtroPlaca, setFiltroPlaca] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [limitePorPagina, setLimitePorPagina] = useState(50)

  // Cargar registros desde Supabase
  useEffect(() => {
    cargarMovimientosDesdeDB()
  }, [])

  async function cargarMovimientosDesdeDB() {
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from('caja_chica')
        .select('*')
        .is('eliminado_en', null)
        .order('fecha', { ascending: false })
        .order('id', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setMovimientos(data)
        setTotalEnDB(data.length)
      } else {
        setMovimientos(cajaChicaInicial)
        setTotalEnDB(0)
      }
    } catch (err) {
      console.warn('Caja Chica cargando desde respaldo local:', err.message)
      setMovimientos(cajaChicaInicial)
    } finally {
      setCargando(false)
    }
  }

  // Migración masiva de los 2,506 registros
  async function sincronizarHistorialASupabase() {
    const confirmar = window.confirm(
      '¿Desea migrar los 2,506 movimientos contables históricos de los 3 Excels (Cusco, Valle Sagrado y Anta) a la base de datos de Supabase?'
    )
    if (!confirmar) return

    setSincronizando(true)
    setMensaje('')
    setProgresoSync(0)

    try {
      const BATCH_SIZE = 120
      const total = cajaChicaInicial.length

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const lote = cajaChicaInicial.slice(i, i + BATCH_SIZE)
        const { error } = await supabase.from('caja_chica').insert(lote)
        if (error) throw error
        setProgresoSync(Math.min(i + BATCH_SIZE, total))
      }

      setMensaje('¡Éxito! Se migraron los 2,506 registros históricos a la tabla caja_chica de Supabase.')
      if (registrarActividad) {
        await registrarActividad(
          'Migración Caja Chica',
          'Sincronizó 2,506 movimientos contables históricos en Supabase'
        )
      }
      await cargarMovimientosDesdeDB()
    } catch (err) {
      console.error('Error sincronizando historial:', err)
      setMensaje(`Error durante la sincronización: ${err.message}`)
    } finally {
      setSincronizando(false)
    }
  }

  // Sub-caja activa
  const activa = CONFIG_SEDES[subCajaCusco] || CONFIG_SEDES.cusco

  // Movimientos pertenecientes a la sede seleccionada
  const movimientosPorSede = useMemo(() => {
    if (macroDivision === 'cajamarca') return []
    if (subCajaCusco === 'todas') return movimientos
    const targetNombre = CONFIG_SEDES[subCajaCusco]?.nombre?.toLowerCase() || 'cusco'
    return movimientos.filter(m => (m.sede || '').toLowerCase() === targetNombre)
  }, [movimientos, macroDivision, subCajaCusco])

  // KPIs Financieros Dinámicos
  const kpis = useMemo(() => {
    let ingresos = 0
    let egresos = 0
    for (const m of movimientosPorSede) {
      ingresos += Number(m.ingreso || 0)
      egresos += Number(m.egreso || 0)
    }
    const saldo = ingresos - egresos
    return {
      ingresos: Math.round(ingresos * 100) / 100,
      egresos: Math.round(egresos * 100) / 100,
      saldo: Math.round(saldo * 100) / 100,
      conteo: movimientosPorSede.length,
    }
  }, [movimientosPorSede])

  // =========================================================================
  // CÁLCULOS ANALÍTICOS PARA LOS GRÁFICOS (Charts Analytics)
  // =========================================================================

  // 1. Ranking de Categorías (Asientos Contables)
  const rankingCategorias = useMemo(() => {
    const catMap = {}
    let totalEgr = 0

    for (const m of movimientosPorSede) {
      const egr = Number(m.egreso || 0)
      if (egr > 0) {
        const cat = m.asiento || 'GASTOS ADMINISTRATIVOS'
        catMap[cat] = (catMap[cat] || 0) + egr
        totalEgr += egr
      }
    }

    const items = Object.entries(catMap)
      .map(([cat, monto]) => ({
        cat,
        monto: Math.round(monto * 100) / 100,
        pct: totalEgr > 0 ? (monto / totalEgr) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto)

    return {
      items: items.slice(0, 6),
      totalEgr,
      maxMonto: items[0]?.monto || 1,
    }
  }, [movimientosPorSede])

  // 2. Evolución Cronológica Mensual (Ingresos vs Egresos)
  const evolucionMensual = useMemo(() => {
    const mesesMap = {}
    for (const m of movimientosPorSede) {
      const mesKey = (m.fecha || '').slice(0, 7)
      if (mesKey && mesKey.startsWith('2026-')) {
        if (!mesesMap[mesKey]) mesesMap[mesKey] = { ing: 0, egr: 0 }
        mesesMap[mesKey].ing += Number(m.ingreso || 0)
        mesesMap[mesKey].egr += Number(m.egreso || 0)
      }
    }

    const ordenados = Object.keys(mesesMap)
      .sort()
      .map(k => ({
        mesKey: k,
        label: MESES_NOMBRES[k] || k,
        ingreso: Math.round(mesesMap[k].ing),
        egreso: Math.round(mesesMap[k].egr),
      }))

    let maxVal = 1
    for (const item of ordenados) {
      if (item.ingreso > maxVal) maxVal = item.ingreso
      if (item.egreso > maxVal) maxVal = item.egreso
    }

    return {
      meses: ordenados,
      maxVal,
    }
  }, [movimientosPorSede])

  // 3. Distribución por Tipo de Comprobante
  const distribucionDocs = useMemo(() => {
    const docsMap = {}
    let totalMonto = 0
    let totalCount = 0

    for (const m of movimientosPorSede) {
      const egr = Number(m.egreso || 0)
      if (egr > 0) {
        const d = (m.tipo_documento || 'S/C').toUpperCase()
        if (!docsMap[d]) docsMap[d] = { monto: 0, count: 0 }
        docsMap[d].monto += egr
        docsMap[d].count += 1
        totalMonto += egr
        totalCount += 1
      }
    }

    const items = Object.entries(docsMap)
      .map(([tipo, val]) => ({
        tipo,
        monto: Math.round(val.monto * 100) / 100,
        count: val.count,
        pct: totalMonto > 0 ? (val.monto / totalMonto) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto)

    return {
      items,
      totalMonto,
      totalCount,
    }
  }, [movimientosPorSede])

  // 4. Consumo por Flota / Camioneta (Top Placas)
  const rankingPlacas = useMemo(() => {
    const placaMap = {}
    let totalPlacas = 0

    for (const m of movimientosPorSede) {
      const egr = Number(m.egreso || 0)
      if (egr > 0 && m.placa) {
        const p = m.placa.trim().toUpperCase()
        if (p) {
          placaMap[p] = (placaMap[p] || 0) + egr
          totalPlacas += egr
        }
      }
    }

    const items = Object.entries(placaMap)
      .map(([placa, monto]) => ({
        placa,
        monto: Math.round(monto * 100) / 100,
        pct: totalPlacas > 0 ? (monto / totalPlacas) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5)

    return {
      items,
      totalPlacas,
      maxMonto: items[0]?.monto || 1,
    }
  }, [movimientosPorSede])

  // Opciones de filtros
  const opcionesFiltros = useMemo(() => {
    const asientos = new Set()
    const docs = new Set()
    const placas = new Set()

    for (const m of movimientosPorSede) {
      if (m.asiento) asientos.add(m.asiento.trim())
      if (m.tipo_documento) docs.add(m.tipo_documento.trim())
      if (m.placa) placas.add(m.placa.trim())
    }

    return {
      asientos: Array.from(asientos).sort(),
      docs: Array.from(docs).sort(),
      placas: Array.from(placas).sort(),
    }
  }, [movimientosPorSede])

  // Movimientos filtrados para la tabla
  const movimientosFiltrados = useMemo(() => {
    return movimientosPorSede.filter(m => {
      if (filtroTexto) {
        const q = filtroTexto.toLowerCase()
        const match =
          (m.beneficiario && m.beneficiario.toLowerCase().includes(q)) ||
          (m.detalle && m.detalle.toLowerCase().includes(q)) ||
          (m.asiento && m.asiento.toLowerCase().includes(q)) ||
          (m.placa && m.placa.toLowerCase().includes(q)) ||
          (m.ruc && m.ruc.toLowerCase().includes(q)) ||
          (m.nro_documento && m.nro_documento.toLowerCase().includes(q))
        if (!match) return false
      }

      if (filtroAsiento && m.asiento !== filtroAsiento) return false
      if (filtroDoc && m.tipo_documento !== filtroDoc) return false
      if (filtroPlaca && m.placa !== filtroPlaca) return false
      if (filtroDesde && m.fecha < filtroDesde) return false
      if (filtroHasta && m.fecha > filtroHasta) return false

      return true
    })
  }, [movimientosPorSede, filtroTexto, filtroAsiento, filtroDoc, filtroPlaca, filtroDesde, filtroHasta])

  // Paginación
  const totalPaginas = limitePorPagina === 'todas'
    ? 1
    : Math.max(1, Math.ceil(movimientosFiltrados.length / Number(limitePorPagina)))

  const movimientosPaginados = useMemo(() => {
    if (limitePorPagina === 'todas') return movimientosFiltrados
    const lim = Number(limitePorPagina)
    const inicio = (paginaActual - 1) * lim
    return movimientosFiltrados.slice(inicio, inicio + lim)
  }, [movimientosFiltrados, paginaActual, limitePorPagina])

  function limpiarFiltros() {
    setFiltroTexto('')
    setFiltroAsiento('')
    setFiltroDoc('')
    setFiltroPlaca('')
    setFiltroDesde('')
    setFiltroHasta('')
    setPaginaActual(1)
  }

  // Callbacks de CRUD
  function handleNuevoMovimientoGuardado(nuevo) {
    setMovimientos(prev => [nuevo, ...prev])
    setMensaje('Movimiento registrado con éxito en la base de datos.')
    if (registrarActividad) {
      registrarActividad(
        'Nuevo movimiento caja chica',
        `Registró [${nuevo.sede}] ${nuevo.detalle} por S/ ${nuevo.ingreso || nuevo.egreso}`
      )
    }
  }

  function handleEdicionGuardada(id, actualizados) {
    setMovimientos(prev => prev.map(m => (m.id === id ? { ...m, ...actualizados } : m)))
    setMensaje('Movimiento actualizado con éxito.')
    if (registrarActividad) {
      registrarActividad('Modificó caja chica', `Actualizó movimiento #${id} de ${actualizados.sede}`)
    }
  }

  function handleEliminado(eliminado) {
    setMovimientos(prev => prev.filter(m => m.id !== eliminado.id))
    setMensaje('Movimiento anulado/eliminado con éxito.')
    if (registrarActividad) {
      registrarActividad(
        'Anuló movimiento caja chica',
        `Anuló [${eliminado.sede}] #${eliminado.id}: ${eliminado.detalle}`
      )
    }
  }

  // Exportar a CSV
  function exportarACSV() {
    const encabezados = [
      'ID',
      'Sede',
      'Fecha',
      'Beneficiario',
      'RUC',
      'Tipo Documento',
      'Nro Documento',
      'Detalle',
      'Asiento',
      'Ingreso',
      'Egreso',
      'Saldo',
      'Placa',
      'Encargado',
    ]

    const filasCSV = movimientosFiltrados.map(m => [
      m.id || '',
      `"${(m.sede || '').replace(/"/g, '""')}"`,
      m.fecha || '',
      `"${(m.beneficiario || '').replace(/"/g, '""')}"`,
      m.ruc || '',
      `"${(m.tipo_documento || '').replace(/"/g, '""')}"`,
      `"${(m.nro_documento || '').replace(/"/g, '""')}"`,
      `"${(m.detalle || '').replace(/"/g, '""')}"`,
      `"${(m.asiento || '').replace(/"/g, '""')}"`,
      m.ingreso || 0,
      m.egreso || 0,
      m.saldo || 0,
      `"${(m.placa || '').replace(/"/g, '""')}"`,
      `"${(m.encargado || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [encabezados.join(','), ...filasCSV.map(f => f.join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CajaChica_${activa.sedeText.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sedePorDefectoParaCrear = subCajaCusco === 'todas' ? 'Cusco' : CONFIG_SEDES[subCajaCusco]?.nombre || 'Cusco'

  return (
    <div className="cc-container">
      {/* Alerta de notificación */}
      {mensaje && (
        <div
          style={{
            padding: '11px 16px',
            background: '#ecfdf5',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {mensaje}</span>
          <button
            type="button"
            onClick={() => setMensaje('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#047857', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Banner de Sincronización Masiva con Supabase (si aún no hay datos en la nube) */}
      {totalEnDB === 0 && !cargando && (
        <div className="cc-sync-card">
          <div className="cc-sync-left">
            <div className="cc-sync-icon">⚡</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.92rem' }}>Sincronización con Supabase Pendiente</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Hay <strong>2,506 movimientos históricos</strong> listos para migrarse a la tabla <code>public.caja_chica</code>.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={sincronizarHistorialASupabase}
            disabled={sincronizando}
            className="cc-sync-btn"
          >
            {sincronizando ? (
              <span>⏳ Migrando {progresoSync} / 2506 registros...</span>
            ) : (
              <span>⚡ Migrar Historial a Supabase (2,506 registros)</span>
            )}
          </button>
        </div>
      )}

      {/* =========================================================================
          1. BARRA DE CONTROL CORPORATIVA Y SELECTOR DE VISTAS (Encuadre perfecto)
          ========================================================================= */}
      <section className="cc-control-card">
        <div className="cc-control-header">
          <div className="cc-control-title-box">
            <div className="cc-control-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="cc-control-title">
                <span>{macroDivision === 'cajamarca' ? 'Caja Chica Cajamarca' : activa.titulo}</span>
                <span className="cc-pill-tag" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                  {cargando ? 'Sincronizando...' : totalEnDB > 0 ? '🟢 En Línea' : '🟡 Respaldo Local'}
                </span>
              </h2>
              <p className="cc-control-sub">
                {macroDivision === 'cajamarca'
                  ? 'Módulo de tesorería y rendición de gastos para las operaciones de Cajamarca.'
                  : activa.subtitulo}
              </p>
            </div>
          </div>

          {/* Selector de Vista: [📋 Movimientos] vs [📈 Gráficos Financieros] */}
          {macroDivision !== 'cajamarca' && (
            <div className="cc-view-toggle">
              <button
                type="button"
                onClick={() => setVistaActiva('tabla')}
                className={`cc-view-btn ${vistaActiva === 'tabla' ? 'active' : ''}`}
                title="Ver libro contable y movimientos detallados"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>Movimientos & Tabla</span>
              </button>

              <button
                type="button"
                onClick={() => setVistaActiva('graficos')}
                className={`cc-view-btn ${vistaActiva === 'graficos' ? 'active' : ''}`}
                title="Ver dashboard de gráficos analíticos y flota"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                <span>Gráficos & Estadísticas</span>
              </button>
            </div>
          )}
        </div>

        {/* Pestañas de Sub-cajas en formato pastilla (Pills fluidas sin desborde) */}
        <div className="cc-sedes-pills">
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.4px', marginRight: '4px' }}>
            Sub-Cajas:
          </span>

          <button
            type="button"
            onClick={() => {
              setMacroDivision('cusco')
              setSubCajaCusco('cusco')
              setPaginaActual(1)
            }}
            className={`cc-sede-pill ${macroDivision === 'cusco' && subCajaCusco === 'cusco' ? 'active' : ''}`}
          >
            <span>📍 Cusco Central</span>
            <span className="cc-pill-tag">Karen Colque</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMacroDivision('cusco')
              setSubCajaCusco('anta')
              setPaginaActual(1)
            }}
            className={`cc-sede-pill ${macroDivision === 'cusco' && subCajaCusco === 'anta' ? 'active' : ''}`}
          >
            <span>📍 Anta</span>
            <span className="cc-pill-tag">Yoel Quispe</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMacroDivision('cusco')
              setSubCajaCusco('valle_sagrado')
              setPaginaActual(1)
            }}
            className={`cc-sede-pill ${macroDivision === 'cusco' && subCajaCusco === 'valle_sagrado' ? 'active' : ''}`}
          >
            <span>📍 Valle Sagrado</span>
            <span className="cc-pill-tag">Cesar Yarin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMacroDivision('cusco')
              setSubCajaCusco('todas')
              setPaginaActual(1)
            }}
            className={`cc-sede-pill ${macroDivision === 'cusco' && subCajaCusco === 'todas' ? 'active' : ''}`}
          >
            <span>📑 Todas las Sedes (Consolidado)</span>
            <span className="cc-pill-tag">{movimientos.length} reg.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMacroDivision('cajamarca')
              setPaginaActual(1)
            }}
            className={`cc-sede-pill ${macroDivision === 'cajamarca' ? 'active' : ''}`}
          >
            <span>🚧 Cajamarca (Div. Norte)</span>
            <span className="cc-pill-tag" style={{ background: '#fef3c7', color: '#92400e' }}>Próximamente</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          VISTA CAJAMARCA (En apertura)
          ========================================================================= */}
      {macroDivision === 'cajamarca' ? (
        <section className="cc-control-card" style={{ borderLeft: '4px solid #3b82f6', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#061c4d' }}>
                Caja Chica Cajamarca (División Norte) · Pendiente de Apertura
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem', lineHeight: 1.4 }}>
                Esta sección está reservada para el libro de caja chica de la sede Cajamarca. Una vez que la administración asigne los fondos y al encargado, se activarán las inserciones y el control en tiempo real.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* =========================================================================
              2. TARJETAS KPI (Cuadrícula simétrica sin desborde)
              ========================================================================= */}
          <section className="cc-kpis">
            <div className={`cc-kpi-card ${kpis.saldo < 0 ? 'cc-kpi-card-negativo' : 'cc-kpi-card-saldo'}`}>
              <div className="cc-kpi-info">
                <span className="cc-kpi-label">
                  {kpis.saldo < 0 ? 'Saldo en Contra (Reintegro)' : 'Saldo Disponible'}
                </span>
                <span className={`cc-kpi-val ${kpis.saldo < 0 ? 'cc-kpi-val-red' : 'cc-kpi-val-green'}`}>
                  {formatearSoles(kpis.saldo)}
                </span>
                <span className="cc-kpi-sub">{activa.titulo}</span>
              </div>
              <div className={`cc-kpi-icon ${kpis.saldo < 0 ? 'cc-icon-red' : 'cc-icon-emerald'}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-info">
                <span className="cc-kpi-label">Ingresos Asignados</span>
                <span className="cc-kpi-val">{formatearSoles(kpis.ingresos)}</span>
                <span className="cc-kpi-sub">Remesas y Reposiciones</span>
              </div>
              <div className="cc-kpi-icon cc-icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-info">
                <span className="cc-kpi-label">Egresos Rendidos</span>
                <span className="cc-kpi-val">{formatearSoles(kpis.egresos)}</span>
                <span className="cc-kpi-sub">Gastos operativos</span>
              </div>
              <div className="cc-kpi-icon cc-icon-amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-info">
                <span className="cc-kpi-label">Responsable / Movimientos</span>
                <span className="cc-kpi-val" style={{ fontSize: '1.15rem' }}>{activa.responsable}</span>
                <span className="cc-kpi-sub">{kpis.conteo} movimientos registrados</span>
              </div>
              <div className="cc-kpi-icon cc-icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </section>

          {/* =========================================================================
              3. VISTA DE GRÁFICOS ANALÍTICOS (Dashboard Financiero)
              ========================================================================= */}
          {vistaActiva === 'graficos' && (
            <section className="cc-charts-grid">
              {/* Gráfico 1: Desglose de Gastos por Categoría (Barras Horizontales) */}
              <div className="cc-chart-card">
                <div className="cc-chart-head">
                  <h3 className="cc-chart-title">
                    <span>⛽ Top Gastos por Categoría</span>
                  </h3>
                  <span className="cc-chart-badge">{rankingCategorias.items.length} categorías</span>
                </div>

                <div className="cc-bars-container">
                  {rankingCategorias.items.map((item, idx) => (
                    <div key={item.cat} className="cc-bar-item">
                      <div className="cc-bar-header">
                        <span className="cc-bar-name">
                          <span style={{ color: '#64748b', fontSize: '0.74rem' }}>#{idx + 1}</span>
                          {item.cat}
                        </span>
                        <div className="cc-bar-values">
                          <span className="cc-bar-amount">{formatearSoles(item.monto)}</span>
                          <span className="cc-bar-pct">{item.pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="cc-bar-track">
                        <div
                          className={`cc-bar-fill ${COLOR_CLASSES[idx % COLOR_CLASSES.length]}`}
                          style={{ width: `${Math.max(4, (item.monto / rankingCategorias.maxMonto) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico 2: Evolución Mensual (Histograma Comparativo Ingresos vs Egresos) */}
              <div className="cc-chart-card">
                <div className="cc-chart-head">
                  <h3 className="cc-chart-title">
                    <span>📅 Evolución Mensual (Remesas vs Gastos)</span>
                  </h3>
                  <span className="cc-chart-badge">Jun – Nov 2026</span>
                </div>

                <div className="cc-histo-grid">
                  {evolucionMensual.meses.map(m => {
                    const hIng = Math.max(4, (m.ingreso / evolucionMensual.maxVal) * 100)
                    const hEgr = Math.max(4, (m.egreso / evolucionMensual.maxVal) * 100)
                    return (
                      <div key={m.mesKey} className="cc-histo-col" title={`${m.label}: Ingresos S/ ${m.ingreso.toLocaleString()} | Egresos S/ ${m.egreso.toLocaleString()}`}>
                        <div className="cc-histo-bars-pair">
                          <div className="cc-histo-bar cc-bar-ing" style={{ height: `${hIng}%` }} />
                          <div className="cc-histo-bar cc-bar-egr" style={{ height: `${hEgr}%` }} />
                        </div>
                        <span className="cc-histo-label">{m.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="cc-histo-legend">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="cc-legend-dot cc-bar-ing" />
                    <span style={{ color: '#047857' }}>Ingresos / Remesas</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="cc-legend-dot cc-bar-egr" />
                    <span style={{ color: '#b91c1c' }}>Egresos Rendidos</span>
                  </div>
                </div>
              </div>

              {/* Gráfico 3: Distribución por Tipo de Comprobante */}
              <div className="cc-chart-card">
                <div className="cc-chart-head">
                  <h3 className="cc-chart-title">
                    <span>🧾 Composición por Tipo de Comprobante</span>
                  </h3>
                  <span className="cc-chart-badge">{distribucionDocs.totalCount} comprobantes</span>
                </div>

                {/* Barra segmentada */}
                <div className="cc-stacked-track">
                  {distribucionDocs.items.map((doc, idx) => (
                    <div
                      key={doc.tipo}
                      className={`cc-stacked-segment ${COLOR_CLASSES[idx % COLOR_CLASSES.length]}`}
                      style={{ width: `${Math.max(2, doc.pct)}%` }}
                      title={`${doc.tipo}: ${formatearSoles(doc.monto)} (${doc.pct.toFixed(1)}%)`}
                    />
                  ))}
                </div>

                <div className="cc-doc-legend-grid">
                  {distribucionDocs.items.map((doc, idx) => (
                    <div key={doc.tipo} className="cc-doc-legend-item">
                      <span className={`cc-legend-dot ${COLOR_CLASSES[idx % COLOR_CLASSES.length]}`} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e293b' }}>{doc.tipo}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {formatearSoles(doc.monto)} ({doc.pct.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico 4: Flota Vehicular y Consumo por Placa */}
              <div className="cc-chart-card">
                <div className="cc-chart-head">
                  <h3 className="cc-chart-title">
                    <span>🛻 Consumo por Flota Vehicular (Top Placas)</span>
                  </h3>
                  <span className="cc-chart-badge">{rankingPlacas.items.length} vehículos</span>
                </div>

                <div className="cc-bars-container">
                  {rankingPlacas.items.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                      No se registran gastos vehiculares con placa en esta sede.
                    </div>
                  ) : (
                    rankingPlacas.items.map((item, idx) => (
                      <div key={item.placa} className="cc-bar-item">
                        <div className="cc-bar-header">
                          <span className="cc-bar-name">
                            <span className="cc-chip-placa">{item.placa}</span>
                          </span>
                          <div className="cc-bar-values">
                            <span className="cc-bar-amount">{formatearSoles(item.monto)}</span>
                            <span className="cc-bar-pct">{item.pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="cc-bar-track">
                          <div
                            className={`cc-bar-fill ${COLOR_CLASSES[idx % COLOR_CLASSES.length]}`}
                            style={{ width: `${Math.max(4, (item.monto / rankingPlacas.maxMonto) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              4. VISTA DE TABLA Y MOVIMIENTOS DETALLADOS
              ========================================================================= */}
          {vistaActiva === 'tabla' && (
            <section className="cc-table-card">
              {/* Mini Barra de Distribución Rápida de Categorías en la parte superior */}
              <div className="cc-mini-summary-bar">
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Principales Gastos:
                </span>
                <div className="cc-mini-chips-group">
                  {rankingCategorias.items.slice(0, 4).map((c, i) => (
                    <span key={c.cat} className="cc-mini-chip">
                      <span className={`cc-legend-dot ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`} />
                      <span>{c.cat}: <strong>{formatearSoles(c.monto)}</strong> ({c.pct.toFixed(0)}%)</span>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setVistaActiva('graficos')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Ver gráficos completos ›</span>
                </button>
              </div>

              {/* Cabecera de la tabla */}
              <div className="cc-table-top">
                <div className="cc-table-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>Libro Contable · {activa.titulo}</span>
                  <span className="cc-pill-count">
                    {movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setModalCrearAbierto(true)}
                    className="cc-btn-nuevo"
                    title="Registrar nuevo gasto o reposición"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>+ Nuevo Movimiento</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportarACSV}
                    className="cc-btn-export"
                    title="Descargar datos en formato CSV"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Toolbar de Filtros Fluido (Sin desborde) */}
              <div className="cc-filter-toolbar">
                <div className="cc-toolbar-row-main">
                  <input
                    type="text"
                    className="cc-search-input"
                    placeholder="🔍 Buscar detalle, beneficiario, RUC, comprobante o placa..."
                    value={filtroTexto}
                    onChange={e => {
                      setFiltroTexto(e.target.value)
                      setPaginaActual(1)
                    }}
                  />
                  {(filtroTexto || filtroAsiento || filtroDoc || filtroPlaca || filtroDesde || filtroHasta) && (
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="cc-filter-clear-btn"
                      title="Limpiar todos los filtros"
                    >
                      ✕ Limpiar Filtros
                    </button>
                  )}
                </div>

                <div className="cc-toolbar-row-chips">
                  <select
                    className="cc-filter-select"
                    value={filtroAsiento}
                    onChange={e => {
                      setFiltroAsiento(e.target.value)
                      setPaginaActual(1)
                    }}
                  >
                    <option value="">Todas las Categorías</option>
                    {opcionesFiltros.asientos.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>

                  <select
                    className="cc-filter-select"
                    value={filtroDoc}
                    onChange={e => {
                      setFiltroDoc(e.target.value)
                      setPaginaActual(1)
                    }}
                  >
                    <option value="">Todos los Comprobantes</option>
                    {opcionesFiltros.docs.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    className="cc-filter-select"
                    value={filtroPlaca}
                    onChange={e => {
                      setFiltroPlaca(e.target.value)
                      setPaginaActual(1)
                    }}
                  >
                    <option value="">Todas las Placas</option>
                    {opcionesFiltros.placas.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Fecha:</span>
                    <input
                      type="date"
                      className="cc-filter-date-input"
                      value={filtroDesde}
                      onChange={e => {
                        setFiltroDesde(e.target.value)
                        setPaginaActual(1)
                      }}
                      title="Desde"
                    />
                    <span style={{ color: '#cbd5e1' }}>–</span>
                    <input
                      type="date"
                      className="cc-filter-date-input"
                      value={filtroHasta}
                      onChange={e => {
                        setFiltroHasta(e.target.value)
                        setPaginaActual(1)
                      }}
                      title="Hasta"
                    />
                  </div>
                </div>
              </div>

              {/* Tabla con desplazamiento contenido */}
              <div className="cc-table-wrap">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '65px' }}># Item</th>
                      {subCajaCusco === 'todas' && <th style={{ width: '100px' }}>Sede</th>}
                      <th style={{ width: '95px' }}>Fecha</th>
                      <th>Beneficiario / Razón Social</th>
                      <th>Comprobante</th>
                      <th>Detalle de la Operación</th>
                      <th>Tipo de Asiento</th>
                      <th style={{ width: '90px' }}>Placa</th>
                      <th style={{ width: '95px', textAlign: 'right' }}>Ingreso</th>
                      <th style={{ width: '95px', textAlign: 'right' }}>Egreso</th>
                      <th style={{ width: '105px', textAlign: 'right' }}>Saldo Acum.</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosPaginados.length === 0 ? (
                      <tr>
                        <td colSpan={subCajaCusco === 'todas' ? 12 : 11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          No se encontraron movimientos para los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      movimientosPaginados.map((m, idx) => {
                        const itemIndex = m.id || (movimientosFiltrados.length - ((paginaActual - 1) * Number(limitePorPagina || 50) + idx))
                        return (
                          <tr
                            key={m.id || `idx-${idx}`}
                            onClick={() => setMovimientoAEditar(m)}
                            className="cc-row-clickable"
                            title="Hacer clic para editar o eliminar este movimiento"
                          >
                            <td style={{ fontWeight: 700, color: '#64748b' }}>#{itemIndex}</td>
                            {subCajaCusco === 'todas' && (
                              <td>
                                <span
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: m.sede === 'Anta' ? '#fef3c7' : m.sede === 'Valle Sagrado' ? '#ede9fe' : '#e0f2fe',
                                    color: m.sede === 'Anta' ? '#92400e' : m.sede === 'Valle Sagrado' ? '#5b21b6' : '#0369a1',
                                  }}
                                >
                                  {m.sede}
                                </span>
                              </td>
                            )}
                            <td style={{ color: '#475569', fontSize: '0.84rem' }}>{m.fecha}</td>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>
                              {m.beneficiario || '—'}
                              {m.ruc ? <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>RUC: {m.ruc}</div> : null}
                            </td>
                            <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                              {m.tipo_documento}
                              {m.nro_documento ? <span style={{ fontWeight: 600, color: '#334155' }}> ({m.nro_documento})</span> : ''}
                            </td>
                            <td style={{ color: '#334155' }}>{m.detalle}</td>
                            <td>
                              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '2px 8px', borderRadius: '6px' }}>
                                {m.asiento}
                              </span>
                            </td>
                            <td>
                              {m.placa ? <span className="cc-chip-placa">{m.placa}</span> : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              {m.ingreso > 0 ? (
                                <span className="cc-badge-ingreso">+{formatearSoles(m.ingreso)}</span>
                              ) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              {m.egreso > 0 ? (
                                <span className="cc-badge-egreso">-{formatearSoles(m.egreso)}</span>
                              ) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                              {formatearSoles(m.saldo)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  setMovimientoAEditar(m)
                                }}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '4px 7px',
                                  cursor: 'pointer',
                                  color: '#475569',
                                }}
                                title="Editar movimiento"
                              >
                                ✏️
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="cc-pagination">
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  Mostrando {movimientosPaginados.length} de {movimientosFiltrados.length} movimientos
                  {movimientosFiltrados.length !== movimientosPorSede.length && ` (de ${movimientosPorSede.length} en sede)`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Por pág:</span>
                  <select
                    value={limitePorPagina}
                    onChange={e => {
                      setLimitePorPagina(e.target.value)
                      setPaginaActual(1)
                    }}
                    style={{
                      height: '28px',
                      padding: '0 6px',
                      fontSize: '0.78rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                    <option value="todas">Todas</option>
                  </select>

                  {limitePorPagina !== 'todas' && (
                    <>
                      <button
                        type="button"
                        disabled={paginaActual <= 1}
                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                        className="cc-page-btn"
                      >
                        ‹ Ant
                      </button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#061c4d', padding: '0 4px' }}>
                        {paginaActual} / {totalPaginas}
                      </span>
                      <button
                        type="button"
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                        className="cc-page-btn"
                      >
                        Sig ›
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Modal para Crear Nuevo Movimiento */}
      {modalCrearAbierto && (
        <NuevoMovimientoCaja
          sedePorDefecto={sedePorDefectoParaCrear}
          usuario={usuario}
          esDesarrollador={esDesarrollador}
          onCerrar={() => setModalCrearAbierto(false)}
          alGuardar={handleNuevoMovimientoGuardado}
        />
      )}

      {/* Modal para Editar o Eliminar Movimiento Existente */}
      {movimientoAEditar && (
        <NuevoMovimientoCaja
          edicion={movimientoAEditar}
          sedePorDefecto={movimientoAEditar.sede || 'Cusco'}
          usuario={usuario}
          esDesarrollador={esDesarrollador}
          onCerrar={() => setMovimientoAEditar(null)}
          alGuardarEdicion={handleEdicionGuardada}
          alEliminar={handleEliminado}
        />
      )}
    </div>
  )
}
