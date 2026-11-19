import { useState } from 'react'
import './Login.css'
import emblemVoltium from './assets/emblem-clean.png'

const anioActual = new Date().getFullYear()

export default function Login({ onSubmit, cargando, mensaje }) {
  const [correo, setCorreo] = useState(() => localStorage.getItem('voltium_correo') || '')
  const [recordar, setRecordar] = useState(() => Boolean(localStorage.getItem('voltium_correo')))
  const [mostrarClave, setMostrarClave] = useState(false)

  function manejarEnvio(evento) {
    if (recordar && correo.trim()) {
      localStorage.setItem('voltium_correo', correo.trim())
    } else {
      localStorage.removeItem('voltium_correo')
    }
    onSubmit(evento)
  }

  return (
    <div className="vl-page">
      {/* Luces y esferas de fondo difuminadas */}
      <div className="vl-bg-orb vl-orb-1" aria-hidden="true" />
      <div className="vl-bg-orb vl-orb-2" aria-hidden="true" />
      <div className="vl-bg-orb vl-orb-3" aria-hidden="true" />
      <div className="vl-grid-pattern" aria-hidden="true" />

      <div className="vl-container">
        {/* Cabecera / Identidad de marca */}
        <header className="vl-brand">
          <div className="vl-logo-wrapper">
            <div className="vl-logo-glow" />
            <div className="vl-logo-box">
              <img src={emblemVoltium} alt="Consorcio Voltium" className="vl-logo-img" />
            </div>
          </div>

          <div className="vl-badge">
            <span className="vl-badge-dot" />
            Portal Corporativo Killary 
          </div>

          <h1 className="vl-title">
            <span className="vl-title-corp">CONSORCIO</span>
            <span className="vl-title-main">VOLTIUM</span>
            <span className="vl-title-app">Requerimientos</span>
          </h1>
          <p className="vl-subtitle">
            Gestión presupuestal, registro y seguimiento de gastos por sede
          </p>
        </header>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="vl-card">
          <div className="vl-card-header">
            <h2 className="vl-card-title">Bienvenido de nuevo</h2>
            <p className="vl-card-desc">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={manejarEnvio} className="vl-form" noValidate={false}>
            {/* Campo: Correo Electrónico */}
            <div className="vl-group">
              <label htmlFor="vl-email" className="vl-label">
                Correo corporativo
              </label>
              <div className="vl-input-wrap">
                <span className="vl-input-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="vl-email"
                  name="correo"
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  autoComplete="username"
                  placeholder="usuario@gmail.com"
                  required
                  disabled={cargando}
                  className="vl-input"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="vl-group">
              <label htmlFor="vl-pass" className="vl-label">
                Contraseña
              </label>
              <div className="vl-input-wrap">
                <span className="vl-input-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="vl-pass"
                  name="clave"
                  type={mostrarClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  disabled={cargando}
                  className="vl-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarClave(prev => !prev)}
                  tabIndex={-1}
                  className="vl-eye-btn"
                  title={mostrarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={mostrarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {mostrarClave ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Opciones adicionales: Recordar sesión */}
            <div className="vl-options-row">
              <label className="vl-checkbox-label">
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={e => setRecordar(e.target.checked)}
                  disabled={cargando}
                  className="vl-checkbox"
                />
                <span>Recordar mi usuario</span>
              </label>
            </div>

            {/* Banner de Mensaje / Error */}
            {mensaje && (
              <div className="vl-alert" role="alert">
                <span className="vl-alert-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </span>
                <div>{mensaje}</div>
              </div>
            )}

            {/* Botón de Envío */}
            <button type="submit" disabled={cargando} className="vl-btn-submit">
              {cargando ? (
                <>
                  <svg className="vl-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Iniciando sesión…</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la plataforma</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Pie de la tarjeta */}
          <div className="vl-card-footer">
            <span className="vl-secure-dot" />
            <span>Acceso protegido con cifrado SSL & Supabase Auth</span>
          </div>
        </div>

        {/* Pie de página exterior */}
        <footer className="vl-footer">
          <p>© {anioActual} Consorcio Voltium · Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  )
}
