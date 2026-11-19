import emblemVoltium from './assets/emblem-clean.png'
import './Sidebar.css'

export default function Sidebar({
  vistaActual,
  setVistaActual,
  esDesarrollador,
  colapsado,
  setColapsado,
  menuMovilAbierto,
  setMenuMovilAbierto,
  usuario,
  onCerrarSesion,
  conteoRequerimientos = 255,
}) {
  function navegar(vista) {
    setVistaActual(vista)
    if (menuMovilAbierto) {
      setMenuMovilAbierto(false)
    }
  }

  return (
    <>
      {/* Backdrop oscuro para móviles */}
      {menuMovilAbierto && (
        <div
          className="vt-sidebar-backdrop"
          onClick={() => setMenuMovilAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Lateral */}
      <aside
        className={`vt-sidebar ${colapsado ? 'vt-sidebar-collapsed' : ''} ${
          menuMovilAbierto ? 'vt-sidebar-mobile-open' : ''
        }`}
        aria-label="Navegación principal"
      >
        <div className="vt-sidebar-inner">
          {/* Header de Marca */}
          <div className="vt-sb-brand">
            <div
              className="vt-sb-brand-main"
              onClick={() => navegar('tabla')}
              title="Ir al inicio"
            >
              <div className="vt-sb-logo-wrap">
                <img
                  src={emblemVoltium}
                  alt="Voltium Emblem"
                  className="vt-sb-logo-img"
                />
              </div>
              {!colapsado && (
                <div className="vt-sb-titles">
                  <span className="vt-sb-title-corp">CONSORCIO</span>
                  <span className="vt-sb-title-name">VOLTIUM</span>
                  <span className="vt-sb-tagline">Portal Corporativo Killary</span>
                </div>
              )}
            </div>

            {/* Botón para colapsar/expandir en escritorio */}
            <button
              type="button"
              className="vt-sb-toggle-btn"
              onClick={() => setColapsado(!colapsado)}
              title={colapsado ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: colapsado ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Indicador de Estado del Sistema */}
          {!colapsado && (
            <div className="vt-sb-status-badge">
              <span className="vt-sb-pulse-dot" />
              <span>SISTEMA ACTIVO · CUSCO</span>
            </div>
          )}

          {/* Menú de Navegación por Grupos */}
          <nav className="vt-sb-nav">
            {/* GRUPO 1: REQUERIMIENTOS */}
            <div className="vt-sb-group">
              {!colapsado && (
                <span className="vt-sb-group-label">Módulo Requerimientos</span>
              )}

              {/* 1. Lista de Requerimientos */}
              <button
                type="button"
                onClick={() => navegar('tabla')}
                className={`vt-sb-item ${vistaActual === 'tabla' ? 'vt-sb-item-active' : ''}`}
                title={colapsado ? 'Requerimientos' : undefined}
              >
                <div className="vt-sb-item-left">
                  <div className="vt-sb-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  </div>
                  {!colapsado && (
                    <div className="vt-sb-item-text">
                      <span className="vt-sb-item-name">Requerimientos</span>
                      <span className="vt-sb-item-desc">Gestión y pagos</span>
                    </div>
                  )}
                </div>
                {!colapsado && conteoRequerimientos > 0 && (
                  <span className="vt-sb-badge vt-sb-badge-count">{conteoRequerimientos}</span>
                )}
              </button>

              {/* 2. Dashboard Analítico */}
              <button
                type="button"
                onClick={() => navegar('dashboard')}
                className={`vt-sb-item ${vistaActual === 'dashboard' ? 'vt-sb-item-active' : ''}`}
                title={colapsado ? 'Dashboard Analítico' : undefined}
              >
                <div className="vt-sb-item-left">
                  <div className="vt-sb-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  {!colapsado && (
                    <div className="vt-sb-item-text">
                      <span className="vt-sb-item-name">Dashboard Analítico</span>
                      <span className="vt-sb-item-desc">Control financiero</span>
                    </div>
                  )}
                </div>
              </button>

              {/* 3. Auditoría (Solo Desarrollador) */}
              {esDesarrollador && (
                <button
                  type="button"
                  onClick={() => navegar('auditoria')}
                  className={`vt-sb-item ${vistaActual === 'auditoria' ? 'vt-sb-item-active' : ''}`}
                  title={colapsado ? 'Bitácora de Auditoría' : undefined}
                >
                  <div className="vt-sb-item-left">
                    <div className="vt-sb-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    {!colapsado && (
                      <div className="vt-sb-item-text">
                        <span className="vt-sb-item-name">Bitácora Auditoría</span>
                        <span className="vt-sb-item-desc">Trazabilidad total</span>
                      </div>
                    )}
                  </div>
                  {!colapsado && (
                    <span className="vt-sb-badge vt-sb-badge-dev">DEV</span>
                  )}
                </button>
              )}
            </div>

            {/* GRUPO 2: TESORERÍA Y CAJA */}
            <div className="vt-sb-group">
              {!colapsado && (
                <span className="vt-sb-group-label">Tesorería & Flujo</span>
              )}

              {/* 4. Caja Chica */}
              <button
                type="button"
                onClick={() => navegar('cajachica')}
                className={`vt-sb-item vt-sb-item-cash ${vistaActual === 'cajachica' ? 'vt-sb-item-active' : ''}`}
                title={colapsado ? 'Caja Chica' : undefined}
              >
                <div className="vt-sb-item-left">
                  <div className="vt-sb-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  {!colapsado && (
                    <div className="vt-sb-item-text">
                      <span className="vt-sb-item-name">Caja Chica</span>
                      <span className="vt-sb-item-desc">Arqueo y rendiciones</span>
                    </div>
                  )}
                </div>
                {!colapsado && (
                  <span className="vt-sb-badge vt-sb-badge-nuevo">NUEVO</span>
                )}
              </button>
            </div>
          </nav>

          {/* Footer de Usuario */}
          <div className="vt-sb-footer">
            {usuario?.email && (
              <div className="vt-sb-user-card" title={usuario.email}>
                <div className={`vt-sb-user-avatar ${esDesarrollador ? 'dev' : ''}`}>
                  {usuario.email.charAt(0).toUpperCase()}
                </div>
                {!colapsado && (
                  <div className="vt-sb-user-info">
                    <span className="vt-sb-user-email">{usuario.email}</span>
                    <span className={`vt-sb-user-role ${esDesarrollador ? 'dev' : ''}`}>
                      {esDesarrollador ? 'Desarrollador' : 'Colaborador'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onCerrarSesion}
              className="vt-sb-logout-btn"
              title="Cerrar sesión"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {!colapsado && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
