import NuevoRequerimiento from './NuevoRequerimiento.jsx'
import Login from './Login.jsx'
import DashboardAnalitico from './DashboardAnalitico.jsx'
import Auditoria from './Auditoria.jsx'
import CajaChica from './CajaChica.jsx'
import Sidebar from './Sidebar.jsx'
import GatitoAnimado from './GatitoAnimado.jsx'
import emblemVoltium from './assets/emblem-clean.png'
import nuevos58 from './nuevos58.json'
import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import './Dashboard.css'

const CORREO_DESARROLLADOR = 'grounnd131@gmail.com'

const soles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const filtrosIniciales = {
  desde: '', hasta: '', mes: '', sede: '', categoria: '', estado: '',
}

async function registrarActividad(accion, detalle, correoForzado = null) {
  try {
    const email = correoForzado || (await supabase.auth.getUser()).data?.user?.email
    if (!email) return
    const { error } = await supabase.from('auditoria').insert({
      usuario_email: email,
      accion,
      detalle,
    })
    if (error) {
      console.warn('Advertencia al insertar en auditoría:', error.message)
    }
  } catch (e) {
    console.warn('Error registrando auditoría:', e)
  }
}

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [filas, setFilas] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [filaAEditar, setFilaAEditar] = useState(null)
  const [moduloActual, setModuloActual] = useState('requerimientos') // 'requerimientos' | 'cajachica'
  const [vistaActual, setVistaActual] = useState('tabla') // 'tabla' | 'dashboard' | 'auditoria'
  const [colapsado, setColapsado] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [modalSumaAbierto, setModalSumaAbierto] = useState(false)
  const [cargando58, setCargando58] = useState(false)

  const esDesarrollador = usuario?.email?.toLowerCase() === CORREO_DESARROLLADOR

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUsuario(session.user)
        setCargando(true)

        // Registrar inicio/reanudación de sesión si aún no se registró en esta pestaña
        if (!sessionStorage.getItem('voltium_sesion_registrada')) {
          sessionStorage.setItem('voltium_sesion_registrada', '1')
          registrarActividad('Inicio de sesión', 'Sesión activa en el navegador', session.user.email)
        }

        supabase
          .from('requerimientos')
          .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
          .is('eliminado_en', null)
          .order('fecha', { ascending: false })
          .then(consulta => {
            if (consulta.data) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  async function entrar(evento) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const correoIngresado = datos.get('correo')?.trim() || ''
    const claveIngresada = datos.get('clave')
    setCargando(true)
    setMensaje('')

    try {
      const sesion = await supabase.auth.signInWithPassword({
        email: correoIngresado,
        password: claveIngresada,
      })
      if (sesion.error) {
        // Registrar intento fallido de acceso ("quienes intentan y no logran entrar")
        await registrarActividad('Acceso denegado', `Intento fallido de inicio de sesión (${sesion.error.message})`, correoIngresado)
        throw sesion.error
      }

      const user = sesion.data?.user
      setUsuario(user)
      sessionStorage.setItem('voltium_sesion_registrada', '1')

      // Registrar inicio de sesión exitoso
      await registrarActividad('Inicio de sesión', 'Ingreso exitoso a la plataforma', user?.email || correoIngresado)

      const consulta = await supabase
        .from('requerimientos')
        .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
        .is('eliminado_en', null)
        .order('fecha', { ascending: false })

      if (consulta.error) throw consulta.error
      setFilas(consulta.data || [])
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  async function salir() {
    sessionStorage.removeItem('voltium_sesion_registrada')
    if (usuario?.email) {
      await registrarActividad('Cierre de sesión', 'El usuario cerró sesión voluntariamente', usuario.email)
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      setMensaje(error.message)
      return
    }
    setUsuario(null)
    setFilas(null)
    setFiltros(filtrosIniciales)
    setMensaje('')
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
    setSeleccionados(prev => {
      const nuevo = new Set(prev)
      nuevo.delete(fila.id)
      return nuevo
    })
    setMensaje('Registro retirado del presupuesto.')
    registrarActividad(
      'Eliminación',
      `Eliminó requerimiento #${fila.id}: «${fila.descripcion}» en sede ${fila.sede}`,
    )
  }

  async function guardarEdicion(id, cambios) {
    const cambiosMayus = { ...cambios }
    if (typeof cambiosMayus.descripcion === 'string') {
      cambiosMayus.descripcion = cambiosMayus.descripcion.toUpperCase().trim()
    }
    if (typeof cambiosMayus.razon_social === 'string') {
      cambiosMayus.razon_social = cambiosMayus.razon_social.toUpperCase().trim()
    }
    const { data, error } = await supabase
      .from('requerimientos')
      .update(cambiosMayus)
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
    registrarActividad(
      'Modificación',
      `Editó requerimiento #${id}: «${data.descripcion}» (Sede: ${data.sede}, Total: ${soles.format(data.total_a_pagar)})`,
    )
  }

  function cambiar(evento) {
    const { name, value } = evento.target
    setFiltros(actual => ({ ...actual, [name]: value }))
  }

  async function cargarNuevos58() {
    if (cargando58) return
    const confirmar = window.confirm(
      'Se detectaron exactamente los 58 requerimientos nuevos que faltan en el sistema.\n\n' +
      '¿Deseas subirlos ahora a Supabase para completar los 255 registros (Total: S/ 1,218,139.05)?'
    )
    if (!confirmar) return

    setCargando58(true)
    setMensaje('Insertando los 58 requerimientos en Supabase…')

    try {
      const { data, error } = await supabase
        .from('requerimientos')
        .insert(nuevos58)
        .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')

      if (error) throw error

      setFilas(actual => [...data, ...(actual || [])].sort((a, b) => b.fecha.localeCompare(a.fecha)))
      setMensaje(`¡Completado! Se incorporaron los 58 nuevos requerimientos con éxito. Total actual en el sistema: 255 registros.`)
      await registrarActividad(
        'Carga masiva',
        `Importó 58 requerimientos restantes del Excel (Monto agregado: S/ 121,008.14; Total sistema: 255 registros)`,
        usuario?.email
      )
    } catch (err) {
      setMensaje(`Error al subir registros: ${err.message}`)
    } finally {
      setCargando58(false)
    }
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

  const sedesDisponibles = [...new Set(filas.map(f => f.sede).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
  const categoriasDisponibles = [...new Set(filas.map(f => f.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))

  function alternarSeleccion(id) {
    setSeleccionados(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  function alternarTodos() {
    const todosVisiblesSeleccionados = visibles.length > 0 && visibles.every(f => seleccionados.has(f.id))
    if (todosVisiblesSeleccionados) {
      setSeleccionados(prev => {
        const nuevo = new Set(prev)
        visibles.forEach(f => nuevo.delete(f.id))
        return nuevo
      })
    } else {
      setSeleccionados(prev => {
        const nuevo = new Set(prev)
        visibles.forEach(f => nuevo.add(f.id))
        return nuevo
      })
    }
  }

  const itemsSeleccionados = filas.filter(f => seleccionados.has(f.id))
  const totalSumaCentimos = itemsSeleccionados.reduce(
    (suma, f) => suma + Math.round(Number(f.total_a_pagar) * 100), 0
  )

  return (
    <div className="vt-shell">
      {/* Menú Lateral Sofisticado Fijo */}
      <Sidebar
        moduloActual={moduloActual}
        setModuloActual={setModuloActual}
        colapsado={colapsado}
        setColapsado={setColapsado}
        menuMovilAbierto={menuMovilAbierto}
        setMenuMovilAbierto={setMenuMovilAbierto}
        usuario={usuario}
        onCerrarSesion={salir}
        esDesarrollador={esDesarrollador}
        conteoRequerimientos={filas?.length || 255}
      />

      {/* Área de Visualización y Contenido Principal */}
      <div className={`vt-main-viewport ${colapsado ? 'collapsed' : ''}`}>
        {moduloActual === 'cajachica' ? (
          <>
            {/* Header Módulo Caja Chica */}
            <header className="vt-navbar" style={{ background: 'linear-gradient(135deg, #051d14 0%, #061c4d 100%)', borderBottom: '2.5px solid #10b981' }}>
              <div className="vt-nav-brand">
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth <= 900) {
                      setMenuMovilAbierto(prev => !prev)
                    } else {
                      setColapsado(prev => !prev)
                    }
                  }}
                  className="vt-hamburger-btn"
                  title={colapsado ? 'Expandir menú lateral' : 'Contraer menú lateral'}
                  style={{ marginRight: '6px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                <div className="vt-nav-logo" style={{ borderColor: 'rgba(16, 185, 129, 0.5)' }}>
                  <img src={emblemVoltium} alt="Consorcio Voltium" className="vt-nav-logo-img" />
                </div>
                <div className="vt-nav-titles">
                  <h1 className="vt-nav-title">
                    <span className="vt-nav-corp" style={{ color: '#6ee7b7' }}>MÓDULO</span>
                    <span className="vt-nav-name">CAJA CHICA</span>
                  </h1>
                  <p className="vt-nav-subtitle">Control de Gastos y Rendición de Flota</p>
                </div>
              </div>

              <div className="vt-nav-actions">
                {usuario?.email && (
                  <div className="vt-user-profile" title={`Sesión activa: ${usuario.email}`}>
                    <div className={`vt-user-avatar ${esDesarrollador ? 'dev' : ''}`}>
                      {usuario.email.charAt(0).toUpperCase()}
                      <span className="vt-user-status-dot" />
                    </div>
                    <div className="vt-user-info">
                      <span className="vt-user-email">{usuario.email}</span>
                      <span className={`vt-user-role ${esDesarrollador ? 'dev' : ''}`}>
                        {esDesarrollador ? 'Desarrollador' : 'Colaborador'}
                      </span>
                    </div>
                  </div>
                )}

                <GatitoAnimado />

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

            <CajaChica />
          </>
        ) : (
          <>
            {/* Barra de Navegación Superior ORIGINAL de Requerimientos */}
            <header className="vt-navbar">
              <div className="vt-nav-brand">
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth <= 900) {
                      setMenuMovilAbierto(prev => !prev)
                    } else {
                      setColapsado(prev => !prev)
                    }
                  }}
                  className="vt-hamburger-btn"
                  title={colapsado ? 'Expandir menú lateral' : 'Contraer menú lateral'}
                  style={{ marginRight: '6px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                <div className="vt-nav-logo">
                  <img src={emblemVoltium} alt="Consorcio Voltium" className="vt-nav-logo-img" />
                </div>
                <div className="vt-nav-titles">
                  <h1 className="vt-nav-title">
                    <span className="vt-nav-corp">CONSORCIO</span>
                    <span className="vt-nav-name">VOLTIUM</span>
                  </h1>
                  <p className="vt-nav-subtitle">Portal Corporativo Killary · Requerimientos</p>
                </div>
              </div>

              {/* Selector de Pestañas Original: Requerimientos, Dashboard, Auditoría */}
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

                {esDesarrollador && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={vistaActual === 'auditoria'}
                    onClick={() => setVistaActual('auditoria')}
                    className={`vt-tab-btn ${vistaActual === 'auditoria' ? 'vt-tab-active' : ''}`}
                    title="Bitácora exclusiva del Desarrollador"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Auditoría</span>
                  </button>
                )}
              </div>

              <div className="vt-nav-actions">
                {usuario?.email && (
                  <div className="vt-user-profile" title={`Sesión activa: ${usuario.email}`}>
                    <div className={`vt-user-avatar ${esDesarrollador ? 'dev' : ''}`}>
                      {usuario.email.charAt(0).toUpperCase()}
                      <span className="vt-user-status-dot" />
                    </div>
                    <div className="vt-user-info">
                      <span className="vt-user-email">{usuario.email}</span>
                      <span className={`vt-user-role ${esDesarrollador ? 'dev' : ''}`}>
                        {esDesarrollador ? 'Desarrollador' : 'Colaborador'}
                      </span>
                    </div>
                  </div>
                )}

                <GatitoAnimado />

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

            {/* Subvistas de Requerimientos: Dashboard vs Auditoría vs Tabla Principal */}
            {vistaActual === 'dashboard' ? (
              <DashboardAnalitico filas={filas} soles={soles} />
            ) : vistaActual === 'auditoria' && esDesarrollador ? (
              <Auditoria />
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

              <div className="vt-toolbar-actions">
                {filas && filas.length < 255 ? (
                  <button
                    type="button"
                    onClick={cargarNuevos58}
                    disabled={cargando58}
                    className="vt-btn-sync-58"
                    title="Cargar los 58 requerimientos restantes del Excel para completar los 255"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{cargando58 ? 'Cargando 58…' : `Cargar 58 restantes (${filas.length}/255)`}</span>
                  </button>
                ) : (
                  <span className="vt-sync-badge-ok" title="Base de datos completa con los 255 registros">
                    ✓ 255 registros
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (seleccionados.size === 0) {
                      setMensaje('Marca la casilla de al menos un requerimiento para calcular la suma.')
                      return
                    }
                    setModalSumaAbierto(true)
                  }}
                  className={`vt-btn-sumar ${seleccionados.size > 0 ? 'vt-btn-sumar-active' : ''}`}
                  title="Sumar total a pagar de los requerimientos seleccionados"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v3l-7 5 7 5v3H4" />
                  </svg>
                  <span>Sumar {seleccionados.size > 0 ? `(${seleccionados.size})` : ''}</span>
                </button>

                <NuevoRequerimiento
                  sedes={sedesDisponibles}
                  categorias={categoriasDisponibles}
                  alGuardar={nuevo => {
                    setFilas(actual => [nuevo, ...actual].sort((a, b) => b.fecha.localeCompare(a.fecha)))
                    setFiltros(filtrosIniciales)
                    setMensaje('Requerimiento registrado con éxito.')
                    registrarActividad(
                      'Creación',
                      `Registró requerimiento #${nuevo.id}: «${nuevo.descripcion}» (Sede: ${nuevo.sede}, Total: ${soles.format(nuevo.total_a_pagar)})`,
                    )
                  }}
                />
              </div>
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
                  <th style={{ width: '46px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={visibles.length > 0 && visibles.every(f => seleccionados.has(f.id))}
                      onChange={alternarTodos}
                      className="vt-checkbox-item"
                      title="Seleccionar todos los visibles"
                      aria-label="Seleccionar todos los visibles"
                    />
                  </th>
                  <th style={{ width: '100px' }}>Fecha</th>
                  <th style={{ width: '110px' }}>Sede</th>
                  <th style={{ width: '120px' }}>Categoría</th>
                  <th>Descripción</th>
                  <th style={{ width: '135px', textAlign: 'right' }}>Total a pagar</th>
                  <th style={{ width: '135px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(fila => (
                  <tr
                    key={fila.id}
                    onClick={() => setFilaAEditar(fila)}
                    className={`vt-row-clickable ${seleccionados.has(fila.id) ? 'vt-row-selected' : ''}`}
                    title="Haz clic para modificar este requerimiento"
                  >
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={seleccionados.has(fila.id)}
                        onChange={() => alternarSeleccion(fila.id)}
                        className="vt-checkbox-item"
                        aria-label={`Seleccionar ${fila.descripcion}`}
                      />
                    </td>
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
                    <td className="vt-desc-cell">
                      <div className="vt-desc-text">{fila.descripcion}</div>
                      {fila.razon_social && (
                        <small className="vt-desc-sub">{fila.razon_social}</small>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="vt-monto-text">
                        {soles.format(fila.total_a_pagar)}
                      </span>
                    </td>
                    <td>
                      <span className={`vt-pill-status vt-status-${fila.estado.toLowerCase()}`}>
                        ● {fila.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil (Tarjetas Responsivas para Celulares) */}
          <div className="vt-mobile-cards">
            {visibles.map(fila => (
              <div
                key={fila.id}
                onClick={() => setFilaAEditar(fila)}
                className={`vt-card-item vt-card-clickable ${seleccionados.has(fila.id) ? 'vt-card-selected' : ''}`}
                title="Toca para modificar este requerimiento"
              >
                {/* Fila 1: Checkbox, Sede y Estado */}
                <div className="vt-card-item-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={seleccionados.has(fila.id)}
                      onChange={() => alternarSeleccion(fila.id)}
                      className="vt-checkbox-item"
                      aria-label={`Seleccionar ${fila.descripcion}`}
                    />
                    <span className="vt-sede-badge">{fila.sede}</span>
                  </div>
                  <span className={`vt-pill-status vt-status-${fila.estado.toLowerCase()}`}>
                    ● {fila.estado}
                  </span>
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
                  <div>{fila.descripcion}</div>
                  {fila.razon_social && (
                    <small className="vt-desc-sub">{fila.razon_social}</small>
                  )}
                </div>

                {/* Fila 4: Total a pagar y sugerencia de toque */}
                <div className="vt-card-item-bottom">
                  <div className="vt-card-total-box">
                    <span className="vt-card-total-label">Total a pagar</span>
                    <span className="vt-monto-text">{soles.format(fila.total_a_pagar)}</span>
                  </div>
                  <span className="vt-click-hint">
                    Toca para editar →
                  </span>
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

          {/* Barra Flotante de Selección Rápida */}
          {seleccionados.size > 0 && (
            <div className="vt-floating-selection-bar" role="toolbar" aria-label="Acciones de ítems seleccionados">
              <div className="vt-floating-selection-info">
                <span className="vt-floating-badge">{seleccionados.size}</span>
                <span>
                  {seleccionados.size === 1 ? '1 ítem' : `${seleccionados.size} ítems`}
                </span>
                <span className="vt-floating-sep">|</span>
                <strong className="vt-floating-total">
                  {soles.format(totalSumaCentimos / 100)}
                </strong>
              </div>

              <div className="vt-floating-selection-buttons">
                <button
                  type="button"
                  onClick={() => setModalSumaAbierto(true)}
                  className="vt-btn-floating-sumar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v3l-7 5 7 5v3H4" />
                  </svg>
                  <span>Ver detalle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeleccionados(new Set())}
                  className="vt-btn-floating-clear"
                  title="Deseleccionar todos"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </main>
      )}
          </>
        )}

      {/* Ventana Flotante / Modal de Suma */}
      {modalSumaAbierto && (
        <div className="vt-modal-overlay" onClick={() => setModalSumaAbierto(false)} role="dialog" aria-modal="true">
          <div className="vt-modal-card vt-modal-suma-card" onClick={e => e.stopPropagation()}>
            <div className="vt-modal-header">
              <div className="vt-modal-title-wrap">
                <div className="vt-icon-circle-amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v3l-7 5 7 5v3H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="vt-modal-title">Suma de Total a Pagar</h2>
                  <p className="vt-modal-subtitle">
                    {itemsSeleccionados.length} {itemsSeleccionados.length === 1 ? 'requerimiento seleccionado' : 'requerimientos seleccionados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSumaAbierto(false)}
                className="vt-btn-close"
                aria-label="Cerrar ventana"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="vt-modal-body">
              {/* Tabla de ítems sumados */}
              <div className="vt-suma-table-wrap">
                <table className="vt-suma-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }}>#</th>
                      <th style={{ width: '95px' }}>Fecha</th>
                      <th style={{ width: '110px' }}>Sede</th>
                      <th style={{ width: '110px' }}>Categoría</th>
                      <th>Descripción</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Total a pagar</th>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsSeleccionados.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                          {idx + 1}
                        </td>
                        <td>
                          <span className="vt-date-badge">
                            {item.fecha.split('-').reverse().join('/')}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{item.sede}</strong>
                        </td>
                        <td>
                          <span className="vt-cat-pill">{item.categoria}</span>
                        </td>
                        <td className="vt-suma-desc-cell">
                          <span className="vt-suma-desc-text">{item.descripcion}</span>
                          {item.razon_social && (
                            <span className="vt-suma-desc-sub">{item.razon_social}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong className="vt-monto-text">{soles.format(item.total_a_pagar)}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => alternarSeleccion(item.id)}
                            className="vt-btn-remove-item"
                            title="Quitar de la suma"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Caja Resaltada con la Suma Total */}
              <div className="vt-suma-highlight-box">
                <div className="vt-suma-highlight-info">
                  <span className="vt-suma-highlight-label">Total Sumado a Pagar</span>
                  <span className="vt-suma-highlight-sub">
                    Suma exacta de los {itemsSeleccionados.length} requerimientos
                  </span>
                </div>
                <div className="vt-suma-highlight-value">
                  {soles.format(totalSumaCentimos / 100)}
                </div>
              </div>
            </div>

            <div className="vt-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const texto = [
                    `CONSORCIO VOLTIUM - DETALLE DE SUMA`,
                    `Fecha de reporte: ${new Date().toLocaleDateString('es-PE')}`,
                    `---------------------------------------------`,
                    ...itemsSeleccionados.map((it, i) => `${i + 1}. [${it.sede} | ${it.categoria}] ${it.descripcion}: ${soles.format(it.total_a_pagar)}`),
                    `---------------------------------------------`,
                    `TOTAL A PAGAR (${itemsSeleccionados.length} ítems): ${soles.format(totalSumaCentimos / 100)}`
                  ].join('\n')
                  navigator.clipboard.writeText(texto)
                  setMensaje('Detalle de suma copiado al portapapeles.')
                }}
                className="vt-btn-secondary"
                title="Copiar lista y total al portapapeles"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copiar detalle</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSeleccionados(new Set())
                    setModalSumaAbierto(false)
                  }}
                  className="vt-btn-secondary"
                >
                  Limpiar selección
                </button>
                <button
                  type="button"
                  onClick={() => setModalSumaAbierto(false)}
                  className="vt-btn-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición (Disponible al hacer clic en cualquier requerimiento) */}
      {filaAEditar && (
        <NuevoRequerimiento
          key={filaAEditar.id}
          edicion={filaAEditar}
          sedes={sedesDisponibles}
          categorias={categoriasDisponibles}
          alGuardarEdicion={guardarEdicion}
          alEliminar={fila => {
            eliminarRequerimiento(fila)
            setFilaAEditar(null)
          }}
          onCerrar={() => setFilaAEditar(null)}
        />
      )}

      {/* Footer Global Corporativo con Crédito de Autor */}
      <footer className="vt-global-footer">
        <div className="vt-footer-inner">
          <span className="vt-footer-copy">© 2026 Consorcio Voltium · Portal Corporativo Killary</span>
          <div className="vt-footer-credit">
            <span className="vt-credit-icon">⚡</span>
            <span>Desarrollado por <strong className="vt-author-highlight">Diego A. Tumba</strong></span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
