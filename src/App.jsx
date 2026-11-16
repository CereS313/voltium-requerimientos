import NuevoRequerimiento from './NuevoRequerimiento.jsx'
import Login from './Login.jsx'
import DashboardAnalitico from './DashboardAnalitico.jsx'
import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import './Dashboard.css'

const soles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const filtrosIniciales = {
  desde: '', hasta: '', mes: '', sede: '', categoria: '', estado: '',
}

export default function App() {
  const [filas, setFilas] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [actualizandoEstado, setActualizandoEstado] = useState(false)
  const [filaAEditar, setFilaAEditar] = useState(null)
  const [vistaActual, setVistaActual] = useState('tabla') // 'tabla' | 'dashboard'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCargando(true)
        supabase
          .from('requerimientos')
          .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
          .is('eliminado_en', null)
          .order('fecha', { ascending: false })
          .then(consulta => {
            if (consulta.data?.length) {
              setFilas(consulta.data)
            }
          })
          .catch(err => {
            setMensaje(err.message)
          })
          .finally(() => {
            setCargando(false)
          })
      }
    })
  }, [])

  async function entrar(evento) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setCargando(true)
    setMensaje('')

    try {
      const sesion = await supabase.auth.signInWithPassword({
        email: datos.get('correo').trim(),
        password: datos.get('clave'),
      })
      if (sesion.error) throw sesion.error

      const consulta = await supabase
        .from('requerimientos')
        .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
        .is('eliminado_en', null)
        .order('fecha', { ascending: false })

      if (consulta.error) throw consulta.error
      if (!consulta.data.length) {
        setMensaje('La cuenta inició sesión, pero no tiene requerimientos visibles.')
        return
      }
      setFilas(consulta.data)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  async function salir() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setMensaje(error.message)
      return
    }
    setFilas(null)
    setFiltros(filtrosIniciales)
    setMensaje('')
  }

  async function cambiarEstado(fila, estado) {
    if (estado === fila.estado || actualizandoEstado) return
    setActualizandoEstado(true)
    setMensaje('Guardando estado...')

    try {
      const { data, error } = await supabase
        .from('requerimientos')
        .update({ estado })
        .eq('id', fila.id)
        .eq('estado', fila.estado)
        .select('id,estado')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        throw new Error('No se aplicó el cambio. Recarga el panel para ver el estado actual.')
      }

      setFilas(actual => actual.map(item =>
        item.id === data.id ? { ...item, estado: data.estado } : item,
      ))
      setMensaje(`Estado actualizado a ${data.estado}.`)
    } catch (error) {
      setMensaje(`No se pudo cambiar el estado: ${error.message}`)
    } finally {
      setActualizandoEstado(false)
    }
  }

  async function eliminarRequerimiento(fila) {
    const confirmar = window.confirm(
      `¿Eliminar «${fila.descripcion}» del presupuesto?`,
    )
    if (!confirmar) return

    const { data, error } = await supabase
      .from('requerimientos')
      .update({ eliminado_en: new Date().toISOString() })
      .eq('id', fila.id)
      .is('eliminado_en', null)
      .select('id')
      .maybeSingle()

    if (error || !data) {
      setMensaje(error ? `No se pudo eliminar: ${error.message}` : 'El registro ya no está disponible.')
      return
    }

    setFilas(actual => actual.filter(item => item.id !== fila.id))
    setMensaje('Registro retirado del presupuesto.')
  }

  async function guardarEdicion(id, cambios) {
    const { data, error } = await supabase
      .from('requerimientos')
      .update(cambios)
      .eq('id', id)
      .is('eliminado_en', null)
      .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('El registro ya no está disponible.')

    setFilas(actual => actual
      .map(item => item.id === id ? data : item)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)))
    setMensaje('Cambios guardados.')
  }

  function cambiar(evento) {
    const { name, value } = evento.target
    setFiltros(actual => ({ ...actual, [name]: value }))
  }

  if (!filas) {
    return <Login onSubmit={entrar} cargando={cargando} mensaje={mensaje} />
  }

  const visibles = filas.filter(fila =>
    (!filtros.desde || fila.fecha >= filtros.desde) &&
    (!filtros.hasta || fila.fecha <= filtros.hasta) &&
    (!filtros.mes || fila.fecha.slice(0, 7) === filtros.mes) &&
    (!filtros.sede || fila.sede === filtros.sede) &&
    (!filtros.categoria || fila.categoria === filtros.categoria) &&
    (!filtros.estado || fila.estado === filtros.estado),
  )

  const totalCentimos = visibles.reduce(
    (suma, fila) => suma + Math.round(Number(fila.total_a_pagar) * 100), 0,
  )

  const conteoPendiente = visibles.filter(f => f.estado === 'Pendiente').length
  const conteoProgramado = visibles.filter(f => f.estado === 'Programado').length
  const conteoPagado = visibles.filter(f => f.estado === 'Pagado').length

  return (
    <div className="vt-dashboard">
      {/* Barra de Navegación Superior */}
      <header className="vt-navbar">
        <div className="vt-nav-brand">
          <div className="vt-nav-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="vt-nav-titles">
            <h1 className="vt-nav-title">
              Voltium <span>Presupuesto</span>
            </h1>
            <p className="vt-nav-subtitle">Control y Gestión de Requerimientos</p>
          </div>
        </div>

        {/* Selector de Pestañas / Páginas */}
        <div className="vt-tab-group" role="tablist" aria-label="Vistas del sistema">
          <button
            type="button"
            role="tab"
            aria-selected={vistaActual === 'tabla'}
            onClick={() => setVistaActual('tabla')}
            className={`vt-tab-btn ${vistaActual === 'tabla' ? 'vt-tab-active' : ''}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span>Requerimientos</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={vistaActual === 'dashboard'}
            onClick={() => setVistaActual('dashboard')}
            className={`vt-tab-btn ${vistaActual === 'dashboard' ? 'vt-tab-active' : ''}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span>Dashboard</span>
          </button>
        </div>

        <div className="vt-nav-actions">
          {/* Gatito durmiendo animado */}
          <div className="vt-sleeping-cat" title="¡Shhh! Gatito de Voltium durmiendo plácidamente... zZz" aria-label="Gatito durmiendo">
            <span className="cat-zzz cat-z1">z</span>
            <span className="cat-zzz cat-z2">z</span>
            <span className="cat-zzz cat-z3">Z</span>
            <svg width="46" height="34" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cat-body-grad" x1="12" y1="14" x2="48" y2="37" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
              </defs>
              {/* Cola que se mueve */}
              <path
                className="cat-tail"
                d="M42 27 C46 25, 51 20, 48 14 C46 11, 42 12, 43 16 C44 20, 41 24, 37 27"
                stroke="#d97706"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Cuerpo que respira */}
              <g className="cat-body-group">
                <path
                  d="M12 28 C12 18, 22 14, 34 14 C44 14, 48 20, 48 28 C48 34, 40 37, 28 37 C16 37, 12 34, 12 28 Z"
                  fill="url(#cat-body-grad)"
                />
                {/* Pancita suave */}
                <path d="M20 31 C24 27, 32 27, 36 31 C32 34, 24 34, 20 31 Z" fill="#fef3c7" opacity="0.9" />
                {/* Orejas con interior rosa */}
                <path d="M9 19 L11 9 L17 17 Z" fill="#d97706" />
                <path d="M11 17 L12 11 L15 16 Z" fill="#fbcfe8" />
                <path d="M17 16 L22 8 L25 17 Z" fill="#d97706" />
                <path d="M18 15 L21 11 L23 16 Z" fill="#fbcfe8" />
                {/* Cabeza */}
                <circle cx="17" cy="23" r="8.5" fill="url(#cat-body-grad)" />
                {/* Ojos cerrados durmiendo */}
                <path d="M11.5 23.5 Q13 25.5 14.5 23.5" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                <path d="M17.5 23.5 Q19 25.5 20.5 23.5" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                {/* Nariz rosa */}
                <polygon points="15.5,25.5 16.5,25.5 16,26.2" fill="#f43f5e" />
                {/* Bigotes */}
                <path d="M8 24 L5 23.5 M8 26 L5 27" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M22 24 L25 23.5 M22 26 L25 27" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />
                {/* Patita recogida */}
                <path d="M21 33 C22 31.5, 24.5 31.5, 25.5 33" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" />
              </g>
            </svg>
          </div>

          <button onClick={salir} className="vt-btn-logout" title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Renderizado Condicional: Pestaña Dashboard vs Pestaña Tabla */}
      {vistaActual === 'dashboard' ? (
        <DashboardAnalitico filas={filas} soles={soles} />
      ) : (
        <main className="vt-main">
          {/* Tarjetas de Resumen KPI */}
          <section className="vt-kpis">
            <div className="vt-kpi-card">
              <div className="vt-kpi-info">
                <span className="vt-kpi-label">Total a Pagar</span>
                <span className="vt-kpi-value">{soles.format(totalCentimos / 100)}</span>
                <span className="vt-kpi-badge">{visibles.length} requerimientos filtrados</span>
              </div>
              <div className="vt-kpi-icon vt-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            <div className="vt-kpi-card">
              <div className="vt-kpi-info">
                <span className="vt-kpi-label">Registros Visibles</span>
                <span className="vt-kpi-value">{visibles.length} <small style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>de {filas.length}</small></span>
                <span className="vt-kpi-badge">En base a los filtros activos</span>
              </div>
              <div className="vt-kpi-icon vt-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
            </div>

            <div className="vt-kpi-card">
              <div className="vt-kpi-info">
                <span className="vt-kpi-label">Estado de Pagos</span>
                <div className="vt-status-breakdown">
                  <span className="vt-pill-mini vt-status-pendiente">
                    ● {conteoPendiente} Pendientes
                  </span>
                  <span className="vt-pill-mini vt-status-programado">
                    ● {conteoProgramado} Programados
                  </span>
                  <span className="vt-pill-mini vt-status-pagado">
                    ● {conteoPagado} Pagados
                  </span>
                </div>
              </div>
              <div className="vt-kpi-icon vt-icon-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </section>

          {/* Tarjeta de Gestión y Filtros */}
          <section className="vt-card">
            <div className="vt-toolbar">
              <h2 className="vt-toolbar-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span>Listado de Requerimientos</span>
              </h2>

              <NuevoRequerimiento alGuardar={nuevo => {
                setFilas(actual => [nuevo, ...actual].sort((a, b) => b.fecha.localeCompare(a.fecha)))
                setFiltros(filtrosIniciales)
                setMensaje('Requerimiento registrado con éxito.')
              }} />
            </div>

            {/* Mensajes de Estado */}
            {mensaje && (
              <div className="vt-status-msg" role="status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{mensaje}</span>
              </div>
            )}

            {/* Barra de Filtros */}
            <div className="vt-filters-grid">
              <div className="vt-filter-group">
                <label className="vt-filter-label">Desde</label>
                <input
                  type="date"
                  name="desde"
                  value={filtros.desde}
                  onChange={cambiar}
                  className="vt-filter-input"
                />
              </div>

              <div className="vt-filter-group">
                <label className="vt-filter-label">Hasta</label>
                <input
                  type="date"
                  name="hasta"
                  value={filtros.hasta}
                  onChange={cambiar}
                  className="vt-filter-input"
                />
              </div>

              <div className="vt-filter-group">
                <label className="vt-filter-label">Mes</label>
                <input
                  type="month"
                  name="mes"
                  value={filtros.mes}
                  onChange={cambiar}
                  className="vt-filter-input"
                />
              </div>

              {Object.entries({ sede: 'Sede', categoria: 'Categoría', estado: 'Estado' }).map(([campo, titulo]) => (
                <div key={campo} className="vt-filter-group">
                  <label className="vt-filter-label">{titulo}</label>
                  <select
                    name={campo}
                    value={filtros[campo]}
                    onChange={cambiar}
                    className="vt-filter-select"
                  >
                    <option value="">Todos</option>
                    {[...new Set(filas.map(fila => fila[campo]))].sort().map(valor => (
                      <option key={valor} value={valor}>{valor}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="vt-filter-group" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setFiltros(filtrosIniciales)}
                  className="vt-btn-clear"
                  title="Restablecer filtros"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          </section>

          {/* Vista Tabular (Escritorio y Tablets) */}
          <div className="vt-table-wrap">
            <table className="vt-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Fecha</th>
                  <th style={{ width: '110px' }}>Sede</th>
                  <th style={{ width: '120px' }}>Categoría</th>
                  <th>Descripción</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Total a pagar</th>
                  <th style={{ width: '135px' }}>Estado</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(fila => (
                  <tr key={fila.id}>
                    <td>
                      <span className="vt-date-badge">
                        {fila.fecha.split('-').reverse().join('/')}
                      </span>
                    </td>
                    <td>
                      <span className="vt-sede-badge">{fila.sede}</span>
                    </td>
                    <td>
                      <span className="vt-cat-pill">{fila.categoria}</span>
                    </td>
                    <td className="vt-desc-cell">{fila.descripcion}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="vt-monto-text">
                        {soles.format(fila.total_a_pagar)}
                      </span>
                    </td>
                    <td>
                      <select
                        aria-label={`Estado de ${fila.descripcion}`}
                        value={fila.estado}
                        disabled={actualizandoEstado}
                        onChange={evento => cambiarEstado(fila, evento.target.value)}
                        className={`vt-status-select vt-status-${fila.estado.toLowerCase()}`}
                      >
                        <option value="Pendiente">● Pendiente</option>
                        <option value="Programado">● Programado</option>
                        <option value="Pagado">● Pagado</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="vt-actions-cell">
                        <button
                          type="button"
                          onClick={() => setFilaAEditar(fila)}
                          className="vt-btn-action vt-btn-edit"
                          title="Editar requerimiento"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarRequerimiento(fila)}
                          className="vt-btn-action vt-btn-delete"
                          title="Eliminar requerimiento"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil (Tarjetas Responsivas para Celulares) */}
          <div className="vt-mobile-cards">
            {visibles.map(fila => (
              <div key={fila.id} className="vt-card-item">
                {/* Fila 1: Sede y Estado */}
                <div className="vt-card-item-top">
                  <span className="vt-sede-badge">{fila.sede}</span>
                  <select
                    aria-label={`Estado de ${fila.descripcion}`}
                    value={fila.estado}
                    disabled={actualizandoEstado}
                    onChange={evento => cambiarEstado(fila, evento.target.value)}
                    className={`vt-status-select vt-status-${fila.estado.toLowerCase()}`}
                  >
                    <option value="Pendiente">● Pendiente</option>
                    <option value="Programado">● Programado</option>
                    <option value="Pagado">● Pagado</option>
                  </select>
                </div>

                {/* Fila 2: Fecha y Categoría */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="vt-date-badge">
                    {fila.fecha.split('-').reverse().join('/')}
                  </span>
                  <span className="vt-cat-pill">{fila.categoria}</span>
                </div>

                {/* Fila 3: Descripción */}
                <div className="vt-card-item-desc">
                  {fila.descripcion}
                </div>

                {/* Fila 4: Total a pagar y Botones Editar / Eliminar */}
                <div className="vt-card-item-bottom">
                  <div className="vt-card-total-box">
                    <span className="vt-card-total-label">Total a pagar</span>
                    <span className="vt-monto-text">{soles.format(fila.total_a_pagar)}</span>
                  </div>

                  <div className="vt-actions-cell">
                    <button
                      type="button"
                      onClick={() => setFilaAEditar(fila)}
                      className="vt-btn-action vt-btn-edit"
                      title="Editar requerimiento"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarRequerimiento(fila)}
                      className="vt-btn-action vt-btn-delete"
                      title="Eliminar requerimiento"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estado Vacío */}
          {!visibles.length && (
            <div className="vt-empty">
              <svg className="vt-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <p style={{ margin: 0, fontWeight: 600 }}>No se encontraron requerimientos</p>
              <small style={{ color: '#94a3b8' }}>Prueba ajustando los filtros de búsqueda o registra un nuevo requerimiento.</small>
            </div>
          )}
        </main>
      )}

      {/* Modal de Edición (Disponible en cualquier vista) */}
      {filaAEditar && (
        <NuevoRequerimiento
          key={filaAEditar.id}
          edicion={filaAEditar}
          alGuardarEdicion={guardarEdicion}
          onCerrar={() => setFilaAEditar(null)}
        />
      )}
    </div>
  )
}
