import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import './Auditoria.css'

function formatearFecha(fechaRaw) {
  if (!fechaRaw) return '—'
  try {
    const str = String(fechaRaw).trim().replace(' ', 'T')
    const d = new Date(str)
    if (isNaN(d.getTime())) return String(fechaRaw)
    const pad = n => String(n).padStart(2, '0')
    const dia = pad(d.getDate())
    const mes = pad(d.getMonth() + 1)
    const anio = d.getFullYear()
    let horas = d.getHours()
    const minutos = pad(d.getMinutes())
    const ampm = horas >= 12 ? 'p. m.' : 'a. m.'
    horas = horas % 12 || 12
    return `${dia}/${mes}/${anio}, ${pad(horas)}:${minutos} ${ampm}`
  } catch {
    return String(fechaRaw)
  }
}

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

  // Filtrado de eventos con protección contra valores nulos
  const filtrados = logs.filter(log => {
    const coincideUsuario = !filtroUsuario || log.usuario_email === filtroUsuario
    const coincideAccion = !filtroAccion || log.accion === filtroAccion
    const busq = busqueda.trim().toLowerCase()
    const coincideBusqueda = !busq ||
      String(log.detalle || '').toLowerCase().includes(busq) ||
      String(log.usuario_email || '').toLowerCase().includes(busq) ||
      String(log.accion || '').toLowerCase().includes(busq)
    return coincideUsuario && coincideAccion && coincideBusqueda
  })

  // Métricas
  const totalEventos = logs.length
  const totalUsuarios = usuariosUnicos.length
  const totalLogins = logs.filter(l => ['Inicio de sesión', 'Reconexión'].includes(l.accion)).length
  const totalCambios = logs.filter(l => ['Creación', 'Modificación', 'Cambio de estado', 'Eliminación'].includes(l.accion)).length

  function obtenerClaseBadge(accion) {
    switch (accion) {
      case 'Inicio de sesión':
      case 'Reconexión':
        return 'aud-badge-login'
      case 'Acceso denegado':
        return 'aud-badge-eliminacion'
      case 'Cierre de sesión':
        return 'aud-badge-otro'
      case 'Creación':
        return 'aud-badge-creacion'
      case 'Modificación':
        return 'aud-badge-modificacion'
      case 'Cambio de estado':
        return 'aud-badge-estado'
      case 'Eliminación':
        return 'aud-badge-eliminacion'
      default:
        return 'aud-badge-otro'
    }
  }

  function obtenerIconoAccion(accion) {
    switch (accion) {
      case 'Inicio de sesión':
      case 'Reconexión':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        )
      case 'Acceso denegado':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )
      case 'Cierre de sesión':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
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
    <div className="aud-container">
      {/* Cabecera */}
      <header className="aud-header">
        <div className="aud-header-info">
          <h2 className="aud-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7c3aed' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Bitácora de Auditoría</span>
            <span className="aud-badge-dev">Solo Desarrollador</span>
          </h2>
          <p className="aud-desc">
            Registro cronológico e inmutable de accesos, inserciones y modificaciones en el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={refrescarLogs}
          disabled={cargando}
          className="aud-btn-refresh"
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
      <section className="aud-kpis">
        <div className="aud-kpi-card">
          <div>
            <span className="aud-kpi-title">Total Actividades</span>
            <span className="aud-kpi-val">{totalEventos}</span>
          </div>
          <div className="aud-kpi-icon aud-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        <div className="aud-kpi-card">
          <div>
            <span className="aud-kpi-title">Usuarios Activos</span>
            <span className="aud-kpi-val">{totalUsuarios}</span>
          </div>
          <div className="aud-kpi-icon aud-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div className="aud-kpi-card">
          <div>
            <span className="aud-kpi-title">Inicios de Sesión</span>
            <span className="aud-kpi-val">{totalLogins}</span>
          </div>
          <div className="aud-kpi-icon aud-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
        </div>

        <div className="aud-kpi-card">
          <div>
            <span className="aud-kpi-title">Operaciones de Datos</span>
            <span className="aud-kpi-val">{totalCambios}</span>
          </div>
          <div className="aud-kpi-icon aud-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="aud-filters">
        <div className="aud-filter-item">
          <label className="aud-filter-label">Buscar en detalle o usuario</label>
          <input
            type="text"
            placeholder="Ej. Lima, S/ 1500, correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="aud-filter-input"
          />
        </div>

        <div className="aud-filter-item">
          <label className="aud-filter-label">Filtrar por Usuario</label>
          <select
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
            className="aud-filter-select"
          >
            <option value="">Todos los usuarios ({usuariosUnicos.length})</option>
            {usuariosUnicos.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="aud-filter-item">
          <label className="aud-filter-label">Tipo de Acción</label>
          <select
            value={filtroAccion}
            onChange={e => setFiltroAccion(e.target.value)}
            className="aud-filter-select"
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

      {/* Tabla de Resultados y Vista Móvil */}
      <section className="aud-table-card">
        <div className="aud-card-top-bar">
          <div className="aud-card-top-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Historial de Actividades</span>
            <span className="aud-count-pill">{filtrados.length} eventos</span>
          </div>
        </div>

        {/* Vista Tabla Desktop */}
        <div className="aud-table-wrap">
          <table className="aud-table">
            <thead>
              <tr>
                <th style={{ width: '175px' }}>Fecha y Hora</th>
                <th style={{ width: '220px' }}>Usuario</th>
                <th style={{ width: '160px' }}>Acción</th>
                <th>Detalle de la Operación</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="aud-empty">
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
                filtrados.map((item, idx) => {
                  try {
                    const fechaTexto = formatearFecha(item.creado_en || item.created_at || item.fecha)
                    const emailTexto = String(item.usuario_email || 'Anónimo')
                    const accionTexto = String(item.accion || 'Operación')
                    const detalleTexto = String(item.detalle || '—')
                    const esDev = emailTexto === 'grounnd131@gmail.com'

                    return (
                      <tr key={item.id || `aud-${idx}`}>
                        <td>
                          <span className="aud-time">{fechaTexto}</span>
                        </td>
                        <td>
                          <span className="aud-user-chip">
                            <span className={`aud-user-dot ${esDev ? 'dev' : ''}`} />
                            <span>{emailTexto}</span>
                          </span>
                        </td>
                        <td>
                          <span className={`aud-badge ${obtenerClaseBadge(accionTexto)}`}>
                            {obtenerIconoAccion(accionTexto)}
                            <span>{accionTexto}</span>
                          </span>
                        </td>
                        <td>
                          <span className="aud-detail">{detalleTexto}</span>
                        </td>
                      </tr>
                    )
                  } catch {
                    return (
                      <tr key={`aud-err-${idx}`}>
                        <td colSpan="4" style={{ padding: '8px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Registro de auditoría #{idx + 1}
                        </td>
                      </tr>
                    )
                  }
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil / Tarjetas Responsivas */}
        <div className="aud-mobile-cards">
          {filtrados.length === 0 ? (
            <div className="aud-empty">
              <strong>No se encontraron registros de auditoría</strong>
              <small>Prueba ajustando los filtros.</small>
            </div>
          ) : (
            filtrados.map((item, idx) => {
              try {
                const fechaTexto = formatearFecha(item.creado_en || item.created_at || item.fecha)
                const emailTexto = String(item.usuario_email || 'Anónimo')
                const accionTexto = String(item.accion || 'Operación')
                const detalleTexto = String(item.detalle || '—')
                const esDev = emailTexto === 'grounnd131@gmail.com'

                return (
                  <div key={item.id || `card-${idx}`} className="aud-mobile-card-item">
                    <div className="aud-mobile-card-header">
                      <span className={`aud-badge ${obtenerClaseBadge(accionTexto)}`}>
                        {obtenerIconoAccion(accionTexto)}
                        <span>{accionTexto}</span>
                      </span>
                      <span className="aud-time">{fechaTexto}</span>
                    </div>
                    <div className="aud-mobile-card-user">
                      <span className={`aud-user-dot ${esDev ? 'dev' : ''}`} />
                      <strong>{emailTexto}</strong>
                    </div>
                    <div className="aud-mobile-card-detail">{detalleTexto}</div>
                  </div>
                )
              } catch {
                return null
              }
            })
          )}
        </div>
      </section>
    </div>
  )
}
