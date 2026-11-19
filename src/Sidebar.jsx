import emblemVoltium from './assets/emblem-clean.png'
import './Sidebar.css'

export default function Sidebar({
  moduloActual,
  setModuloActual,
  colapsado,
  setColapsado,
  menuMovilAbierto,
  setMenuMovilAbierto,
  usuario,
  esDesarrollador,
  conteoRequerimientos = 255,
}) {
  function cambiarModulo(mod) {
    setModuloActual(mod)
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

      {/* Sidebar Lateral Fijo */}
      <aside
        className={`vt-sidebar ${colapsado ? 'vt-sidebar-collapsed' : ''} ${
          menuMovilAbierto ? 'vt-sidebar-mobile-open' : ''
        }`}
        aria-label="Navegación principal del sistema"
      >
        <div className="vt-sidebar-inner">
          {/* Header de Marca */}
          <div className="vt-sb-brand">
            <div
              className="vt-sb-brand-main"
              onClick={() => {
                if (colapsado) {
                  setColapsado(false)
                } else {
                  cambiarModulo('requerimientos')
                }
              }}
              title={colapsado ? 'Clic para expandir menú lateral' : 'Consorcio Voltium'}
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
                  <span className="vt-sb-tagline">Portal Corporativo</span>
                </div>
              )}
            </div>

            {/* Botón para colapsar / expandir */}
            <button
              type="button"
              className="vt-sb-toggle-btn"
              onClick={() => setColapsado(!colapsado)}
              title={colapsado ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {colapsado ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú de Módulos Principales */}
          <nav className="vt-sb-nav">
            <div className="vt-sb-group">
              {!colapsado && (
                <span className="vt-sb-group-label">Módulos del Sistema</span>
              )}

              {/* 1. MÓDULO REQUERIMIENTOS (Incluye Requerimientos, Dashboard y Auditoría originales) */}
              <button
                type="button"
                onClick={() => cambiarModulo('requerimientos')}
                className={`vt-sb-item ${moduloActual === 'requerimientos' ? 'vt-sb-item-active' : ''}`}
                title={colapsado ? 'Requerimientos (Dashboard y Auditoría)' : undefined}
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
                      <span className="vt-sb-item-desc">Gestión, Dashboard & Auditoría</span>
                    </div>
                  )}
                </div>
                {!colapsado && conteoRequerimientos > 0 && (
                  <span className="vt-sb-badge vt-sb-badge-count">{conteoRequerimientos}</span>
                )}
              </button>

              {/* 2. MÓDULO CAJA CHICA */}
              <button
                type="button"
                onClick={() => cambiarModulo('cajachica')}
                className={`vt-sb-item vt-sb-item-cash ${moduloActual === 'cajachica' ? 'vt-sb-item-active' : ''}`}
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

            {/* Firma de Autor / Desarrollador */}
            {!colapsado ? (
              <div className="vt-sb-author-badge">
                <span className="vt-sb-author-label">Desarrollado por</span>
                <span className="vt-sb-author-name">Diego A. Tumba</span>
              </div>
            ) : (
              <div className="vt-sb-author-compact" title="Desarrollado por Diego A. Tumba">
                <span className="vt-sb-author-initials">DT</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
