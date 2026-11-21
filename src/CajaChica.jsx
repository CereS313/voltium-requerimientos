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
    subtitulo: 'Vista unificada de Cusco Central, Anta y Valle Sagrado',
    responsable: 'Administración General',
    sedeText: 'Todas las Sedes',
  },
}

export default function CajaChica({ usuario = null, esDesarrollador = false, registrarActividad = null }) {
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

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [movimientoAEditar, setMovimientoAEditar] = useState(null)

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroAsiento, setFiltroAsiento] = useState('')
  const [filtroDoc, setFiltroDoc] = useState('')
  const [filtroPlaca, setFiltroPlaca] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [limitePorPagina, setLimitePorPagina] = useState(50)

  // Cargar registros desde Supabase al iniciar
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
        // Si aún no se migraron registros a Supabase, mantenemos el respaldo inicial
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

  // Migración masiva de los 2,506 registros a Supabase
  async function sincronizarHistorialASupabase() {
    const confirmar = window.confirm(
      '¿Desea migrar los 2,506 movimientos contables de los 3 Excels (Cusco, Valle Sagrado y Anta) a la base de datos de Supabase?'
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

  // Movimientos pertenecientes a la sede seleccionada (sin otros filtros) para KPIs
  const movimientosPorSede = useMemo(() => {
    if (macroDivision === 'cajamarca') return []
    if (subCajaCusco === 'todas') return movimientos
    const targetNombre = CONFIG_SEDES[subCajaCusco]?.nombre?.toLowerCase() || 'cusco'
    return movimientos.filter(m => (m.sede || '').toLowerCase() === targetNombre)
  }, [movimientos, macroDivision, subCajaCusco])

  // KPIs calculados dinámicamente
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

  // Categorías, Documentos y Placas únicas disponibles para los filtros
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

  // Movimientos filtrados por texto, categoría, comprobante y fechas
  const movimientosFiltrados = useMemo(() => {
    return movimientosPorSede.filter(m => {
      // Filtro texto
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

      // Filtro Categoría / Asiento
      if (filtroAsiento && m.asiento !== filtroAsiento) {
        return false
      }

      // Filtro Tipo de Documento
      if (filtroDoc && m.tipo_documento !== filtroDoc) {
        return false
      }

      // Filtro Placa
      if (filtroPlaca && m.placa !== filtroPlaca) {
        return false
      }

      // Filtro Fecha Desde
      if (filtroDesde && m.fecha < filtroDesde) {
        return false
      }

      // Filtro Fecha Hasta
      if (filtroHasta && m.fecha > filtroHasta) {
        return false
      }

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
            padding: '12px 18px',
            background: '#ecfdf5',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.88rem',
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

      {/* Banner de Sincronización Inicial con Supabase (si aún no hay datos en la DB remota) */}
      {totalEnDB === 0 && !cargando && (
        <div className="cc-sync-card">
          <div className="cc-sync-left">
            <div className="cc-sync-icon">⚡</div>
            <div>
              <h4 className="cc-sync-title">Sincronización con Supabase Pendiente</h4>
              <p className="cc-sync-desc">
                La tabla <code>public.caja_chica</code> está creada en Supabase. Puedes migrar los{' '}
                <strong>2,506 movimientos contables históricos</strong> de los Excels (Cusco, Valle Sagrado y Anta) a la
                base de datos con un solo clic.
              </p>
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

      {/* Cabecera Principal */}
      <header className="cc-header">
        <div className="cc-header-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div className="cc-title-row">
              <div className="cc-title-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h2 className="cc-title">
                {macroDivision === 'cajamarca' ? 'Caja Chica Cajamarca' : activa.titulo}
              </h2>
            </div>

            {/* Botón "+ Nuevo Movimiento" */}
            {macroDivision !== 'cajamarca' && (
              <button
                type="button"
                onClick={() => setModalCrearAbierto(true)}
                className="cc-btn-nuevo"
                title="Registrar nuevo gasto o reposición en la base de datos"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>+ Nuevo Movimiento</span>
              </button>
            )}
          </div>

          <div className="cc-badges-row">
            <span className="cc-badge-live">
              {cargando ? 'Consultando DB...' : totalEnDB > 0 ? '🟢 Conectado a Supabase' : '🟡 Modo Respaldo Local'}
            </span>
            <span className="cc-badge-corp">
              {macroDivision === 'cajamarca' ? 'División Norte' : activa.sedeText}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {movimientosPorSede.length} movimientos contables registrados
            </span>
          </div>

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
            {macroDivision === 'cusco' ? `Cusco · ${activa.sedeText}` : 'Cajamarca'}
          </span>
        </div>

        {/* NIVEL 1: BOTONES GRANDES (CUSCO vs CAJAMARCA) */}
        <div className="cc-macro-grid">
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
                <span className="cc-macro-sub">Cusco Central, Anta y Valle Sagrado</span>
              </div>
            </div>
            <span className="cc-macro-badge">3 Sedes</span>
          </button>

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
              {/* Cusco Central */}
              <button
                type="button"
                onClick={() => {
                  setSubCajaCusco('cusco')
                  setPaginaActual(1)
                }}
                className={`cc-sub-btn ${subCajaCusco === 'cusco' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Caja Chica Cusco</span>
                </div>
                <span className="cc-sub-pill">Karen Colque</span>
              </button>

              {/* Anta */}
              <button
                type="button"
                onClick={() => {
                  setSubCajaCusco('anta')
                  setPaginaActual(1)
                }}
                className={`cc-sub-btn ${subCajaCusco === 'anta' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Caja Chica Anta</span>
                </div>
                <span className="cc-sub-pill">Yoel Quispe</span>
              </button>

              {/* Valle Sagrado */}
              <button
                type="button"
                onClick={() => {
                  setSubCajaCusco('valle_sagrado')
                  setPaginaActual(1)
                }}
                className={`cc-sub-btn ${subCajaCusco === 'valle_sagrado' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>Caja Chica Valle Sagrado</span>
                </div>
                <span className="cc-sub-pill">Cesar Yarin</span>
              </button>

              {/* Todas las Sedes (Consolidado) */}
              <button
                type="button"
                onClick={() => {
                  setSubCajaCusco('todas')
                  setPaginaActual(1)
                }}
                className={`cc-sub-btn ${subCajaCusco === 'todas' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span>Todas las Sedes (Consolidado)</span>
                </div>
                <span className="cc-sub-pill">{movimientos.length} total</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* VISTA SEGÚN LA SELECCIÓN */}
      {macroDivision === 'cajamarca' ? (
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
          {/* Tarjetas KPI de Estado Financiero Dinámico */}
          <section className="cc-kpis">
            <div className={`cc-kpi-card cc-kpi-saldo ${kpis.saldo < 0 ? 'cc-kpi-saldo-negativo' : ''}`}>
              <div>
                <span className="cc-kpi-label">
                  {kpis.saldo < 0 ? 'Saldo en Contra (Reintegro Pendiente)' : 'Saldo Disponible en Caja'}
                </span>
                <span className={`cc-kpi-val ${kpis.saldo < 0 ? 'cc-kpi-val-red' : 'cc-kpi-val-green'}`}>
                  {formatearSoles(kpis.saldo)}
                </span>
                <span className="cc-kpi-sub">{activa.titulo}</span>
              </div>
              <div className={`cc-kpi-icon ${kpis.saldo < 0 ? 'cc-icon-red' : 'cc-icon-emerald'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Total Ingresos Asignados</span>
                <span className="cc-kpi-val">{formatearSoles(kpis.ingresos)}</span>
                <span className="cc-kpi-sub">Remesas / Reposiciones</span>
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
                <span className="cc-kpi-val">{formatearSoles(kpis.egresos)}</span>
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
                <span className="cc-kpi-sub">{kpis.conteo} registros en historial</span>
              </div>
              <div className="cc-kpi-icon cc-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </section>

          {/* Tabla con Movimientos de la Base de Datos */}
          <section className="cc-table-card">
            {/* Cabecera de la tabla */}
            <div className="cc-table-top">
              <div className="cc-table-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Movimientos · {activa.titulo}</span>
                <span className="cc-pill-count">
                  {movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={exportarACSV}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  title="Descargar datos filtrados en formato CSV"
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

            {/* Barra de Filtros Avanzada */}
            <div className="cc-filters-grid">
              {/* Buscador de texto */}
              <input
                type="text"
                className="cc-filter-input"
                placeholder="🔍 Buscar detalle, beneficiario, RUC, comprobante..."
                value={filtroTexto}
                onChange={e => {
                  setFiltroTexto(e.target.value)
                  setPaginaActual(1)
                }}
              />

              {/* Filtro por Categoría / Asiento */}
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

              {/* Filtro por Comprobante */}
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

              {/* Filtro por Placa */}
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

              {/* Rango de Fechas */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="cc-filter-input"
                  style={{ width: '130px', padding: '0 6px', fontSize: '0.78rem' }}
                  value={filtroDesde}
                  onChange={e => {
                    setFiltroDesde(e.target.value)
                    setPaginaActual(1)
                  }}
                  title="Fecha desde"
                />
                <span style={{ color: '#94a3b8' }}>–</span>
                <input
                  type="date"
                  className="cc-filter-input"
                  style={{ width: '130px', padding: '0 6px', fontSize: '0.78rem' }}
                  value={filtroHasta}
                  onChange={e => {
                    setFiltroHasta(e.target.value)
                    setPaginaActual(1)
                  }}
                  title="Fecha hasta"
                />
              </div>

              {/* Botón Limpiar Filtros */}
              {(filtroTexto || filtroAsiento || filtroDoc || filtroPlaca || filtroDesde || filtroHasta) && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="cc-filter-clear-btn"
                  title="Limpiar todos los filtros"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>

            {/* Aviso táctil para celulares */}
            <div className="cc-mobile-table-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
              <span>Toca cualquier fila para modificar o eliminar. Desliza la tabla para ver todos los importes.</span>
            </div>

            {/* Tabla Principal */}
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>ID / Item</th>
                    {subCajaCusco === 'todas' && <th style={{ width: '110px' }}>Sede</th>}
                    <th style={{ width: '100px' }}>Fecha</th>
                    <th>Beneficiario / Razón Social</th>
                    <th>Comprobante</th>
                    <th>Detalle de la Operación</th>
                    <th>Tipo de Asiento</th>
                    <th style={{ width: '90px' }}>Placa</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Ingreso</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Egreso</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Saldo Acum.</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Acción</th>
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
                            {m.ruc ? <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>RUC: {m.ruc}</div> : null}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                            {m.tipo_documento}
                            {m.nro_documento ? <span style={{ fontWeight: 600, color: '#334155' }}> ({m.nro_documento})</span> : ''}
                          </td>
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
              <div className="cc-pagination-info">
                Mostrando {movimientosPaginados.length} de {movimientosFiltrados.length} movimientos
                {movimientosFiltrados.length !== movimientosPorSede.length && ` (filtrados de ${movimientosPorSede.length} total)`}
              </div>

              <div className="cc-pagination-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
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
                </div>

                {limitePorPagina !== 'todas' && (
                  <>
                    <button
                      type="button"
                      disabled={paginaActual <= 1}
                      onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                      className="cc-page-btn"
                    >
                      ‹ Anterior
                    </button>
                    <span className="cc-page-number">
                      Pág. {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={paginaActual >= totalPaginas}
                      onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                      className="cc-page-btn"
                    >
                      Siguiente ›
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
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
