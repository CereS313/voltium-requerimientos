import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import './Auditoria.css'

const formateadorFecha = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function Auditoria() {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [busqueda, setBusqueda] = useState('')

  async function refrescarLogs() {
    setCargando(true)
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('auditoria')
        .select('id, creado_en, usuario_email, accion, detalle')
        .order('creado_en', { ascending: false })
        .limit(200)

      if (err) throw err
      setLogs(data || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los registros de auditoría.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let cancelado = false
    supabase
      .from('auditoria')
      .select('id, creado_en, usuario_email, accion, detalle')
      .order('creado_en', { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        if (cancelado) return
        if (err) {
          setError(err.message || 'No se pudieron cargar los registros de auditoría.')
        } else {
          setLogs(data || [])
        }
      })
      .catch(err => {
        if (!cancelado) setError(err.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => { cancelado = true }
  }, [])

  // Lista única de usuarios y acciones para los filtros
  const usuariosUnicos = [...new Set(logs.map(l => l.usuario_email).filter(Boolean))].sort()
  const accionesUnicas = [...new Set(logs.map(l => l.accion).filter(Boolean))].sort()

  // Filtrado de eventos
  const filtrados = logs.filter(log => {
    const coincideUsuario = !filtroUsuario || log.usuario_email === filtroUsuario
    const coincideAccion = !filtroAccion || log.accion === filtroAccion
    const coincideBusqueda = !busqueda ||
      log.detalle?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.usuario_email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion?.toLowerCase().includes(busqueda.toLowerCase())
    return coincideUsuario && coincideAccion && coincideBusqueda
  })

  // Métricas
  const totalEventos = logs.length
  const totalUsuarios = usuariosUnicos.length
  const totalLogins = logs.filter(l => l.accion === 'Inicio de sesión').length
  const totalCambios = logs.filter(l => ['Creación', 'Modificación', 'Cambio de estado', 'Eliminación'].includes(l.accion)).length

  function obtenerClaseBadge(accion) {
    switch (accion) {
      case 'Inicio de sesión': return 'ad-badge-login'
      case 'Creación': return 'ad-badge-creacion'
      case 'Modificación': return 'ad-badge-modificacion'
      case 'Cambio de estado': return 'ad-badge-estado'
      case 'Eliminación': return 'ad-badge-eliminacion'
      default: return 'ad-badge-otro'
    }
  }

  function obtenerIconoAccion(accion) {
    switch (accion) {
      case 'Inicio de sesión':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        )
      case 'Creación':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )
      case 'Modificación':
      case 'Cambio de estado':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        )
      case 'Eliminación':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        )
      default:
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )
    }
  }

  return (
    <div className="ad-container">
      {/* Cabecera */}
      <header className="ad-header">
        <div className="ad-header-info">
          <h2 className="ad-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7c3aed' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Bitácora de Auditoría</span>
            <span className="ad-badge-dev">Solo Desarrollador</span>
          </h2>
          <p className="ad-desc">
            Registro cronológico e inmutable de accesos, inserciones y modificaciones en el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={refrescarLogs}
          disabled={cargando}
          className="ad-btn-refresh"
          title="Actualizar registro de actividades"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: cargando ? 'spin 1s linear infinite' : 'none' }}
          >
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{cargando ? 'Cargando…' : 'Actualizar'}</span>
        </button>
      </header>

      {/* Tarjetas KPI de Auditoría */}
      <section className="ad-kpis">
        <div className="ad-kpi-card">
          <div>
            <span className="ad-kpi-title">Total Actividades</span>
            <span className="ad-kpi-val">{totalEventos}</span>
          </div>
          <div className="ad-kpi-icon ad-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <span className="ad-kpi-title">Usuarios Activos</span>
            <span className="ad-kpi-val">{totalUsuarios}</span>
          </div>
          <div className="ad-kpi-icon ad-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <span className="ad-kpi-title">Inicios de Sesión</span>
            <span className="ad-kpi-val">{totalLogins}</span>
          </div>
          <div className="ad-kpi-icon ad-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <span className="ad-kpi-title">Operaciones de Datos</span>
            <span className="ad-kpi-val">{totalCambios}</span>
          </div>
          <div className="ad-kpi-icon ad-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="ad-filters">
        <div className="ad-filter-item">
          <label className="ad-filter-label">Buscar en detalle o usuario</label>
          <input
            type="text"
            placeholder="Ej. Lima, S/ 1500, correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="ad-filter-input"
          />
        </div>

        <div className="ad-filter-item">
          <label className="ad-filter-label">Filtrar por Usuario</label>
          <select
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
            className="ad-filter-select"
          >
            <option value="">Todos los usuarios ({usuariosUnicos.length})</option>
            {usuariosUnicos.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="ad-filter-item">
          <label className="ad-filter-label">Tipo de Acción</label>
          <select
            value={filtroAccion}
            onChange={e => setFiltroAccion(e.target.value)}
            className="ad-filter-select"
          >
            <option value="">Todas las acciones</option>
            {accionesUnicas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {(filtroUsuario || filtroAccion || busqueda) && (
          <button
            type="button"
            onClick={() => { setFiltroUsuario(''); setFiltroAccion(''); setBusqueda('') }}
            className="vt-btn-clear"
            style={{ height: '38px', padding: '0 12px' }}
          >
            Limpiar filtros
          </button>
        )}
      </section>

      {/* Mensaje de Error */}
      {error && (
        <div className="vt-status-msg" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Resultados */}
      <section className="ad-table-card">
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Fecha y Hora</th>
                <th style={{ width: '220px' }}>Usuario</th>
                <th style={{ width: '150px' }}>Acción</th>
                <th>Detalle de la Operación</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="ad-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <strong>No se encontraron registros de auditoría</strong>
                      <small>Prueba ajustando los filtros o espera que se registren nuevas operaciones.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="ad-time">
                        {formateadorFecha.format(new Date(item.creado_en))}
                      </span>
                    </td>
                    <td>
                      <span className="ad-user-chip">
                        <span className={`ad-user-dot ${item.usuario_email === 'grounnd131@gmail.com' ? 'dev' : ''}`} />
                        <span>{item.usuario_email}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`ad-badge ${obtenerClaseBadge(item.accion)}`}>
                        {obtenerIconoAccion(item.accion)}
                        <span>{item.accion}</span>
                      </span>
                    </td>
                    <td>
                      <span className="ad-detail">{item.detalle}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
