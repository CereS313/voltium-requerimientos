import { useState } from 'react'
import { supabase } from './supabase.js'

const fechaHoy = new Date().toISOString().split('T')[0]
const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export default function NuevoRequerimiento({ alGuardar, edicion = null, alGuardarEdicion, onCerrar }) {
  const [abierto, setAbierto] = useState(Boolean(edicion))
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [montoBruto, setMontoBruto] = useState(edicion ? String(edicion.monto_bruto ?? '') : '')
  const [retencion, setRetencion] = useState(edicion ? String(edicion.retencion ?? '0') : '0')

  const totalCalculado = Math.max(0, (Number(montoBruto) || 0) - (Number(retencion) || 0))
  const esModoEdicion = Boolean(edicion)

  function abrirModal() {
    setMensaje('')
    setMontoBruto('')
    setRetencion('0')
    setAbierto(true)
  }

  function cerrarModal() {
    if (guardando) return
    setAbierto(false)
    setMensaje('')
    if (onCerrar) onCerrar()
  }

  async function guardar(evento) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const datos = new FormData(formulario)
    const registro = Object.fromEntries(
      [...datos.entries()].map(([campo, valor]) => [campo, valor.trim()]),
    )
    registro.razon_social = registro.razon_social || null
    registro.retencion = registro.retencion || '0'

    if (Number(registro.retencion) > Number(registro.monto_bruto)) {
      setMensaje('La retención no puede superar el monto bruto.')
      return
    }

    setGuardando(true)
    setMensaje('')
    try {
      if (esModoEdicion) {
        await alGuardarEdicion(edicion.id, registro)
        cerrarModal()
      } else {
        const { data, error } = await supabase
          .from('requerimientos')
          .insert(registro)
          .select('id,fecha,sede,categoria,descripcion,razon_social,monto_bruto,retencion,total_a_pagar,estado')
          .single()

        if (error) throw error

        alGuardar(data)
        formulario.reset()
        setAbierto(false)
      }
    } catch (error) {
      setMensaje(`No se pudo guardar: ${error.message}`)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      {!esModoEdicion && (
        <button type="button" onClick={abrirModal} className="vt-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nuevo requerimiento</span>
        </button>
      )}

      {abierto && (
        <div className="vt-modal-overlay" onClick={cerrarModal} role="dialog" aria-modal="true">
          <div className="vt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="vt-modal-header">
              <h2 className="vt-modal-title">
                {esModoEdicion ? 'Editar Requerimiento' : 'Registrar Requerimiento'}
              </h2>
              <button type="button" onClick={cerrarModal} className="vt-btn-close" aria-label="Cerrar modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={guardar}>
              <div className="vt-modal-body">
                {mensaje && (
                  <div className="vt-status-msg" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{mensaje}</span>
                  </div>
                )}

                <div className="vt-form-grid">
                  <div className="vt-form-field">
                    <label htmlFor="req-fecha">Fecha *</label>
                    <input
                      id="req-fecha"
                      name="fecha"
                      type="date"
                      required
                      defaultValue={edicion ? edicion.fecha : fechaHoy}
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field">
                    <label htmlFor="req-sede">Sede *</label>
                    <input
                      id="req-sede"
                      name="sede"
                      placeholder="Ej. Lima Central, Trujillo..."
                      defaultValue={edicion ? edicion.sede : ''}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field">
                    <label htmlFor="req-cat">Categoría *</label>
                    <input
                      id="req-cat"
                      name="categoria"
                      placeholder="Ej. Servicios, Mantenimiento..."
                      defaultValue={edicion ? edicion.categoria : ''}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field">
                    <label htmlFor="req-razon">Razón social (opcional)</label>
                    <input
                      id="req-razon"
                      name="razon_social"
                      placeholder="Nombre del proveedor o empresa"
                      defaultValue={edicion?.razon_social || ''}
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field vt-form-full">
                    <label htmlFor="req-desc">Descripción del gasto o servicio *</label>
                    <textarea
                      id="req-desc"
                      name="descripcion"
                      rows="3"
                      placeholder="Detalle del requerimiento..."
                      defaultValue={edicion ? edicion.descripcion : ''}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field">
                    <label htmlFor="req-bruto">Monto bruto (S/) *</label>
                    <input
                      id="req-bruto"
                      name="monto_bruto"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={montoBruto}
                      onChange={e => setMontoBruto(e.target.value)}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-field">
                    <label htmlFor="req-ret">Retención (S/)</label>
                    <input
                      id="req-ret"
                      name="retencion"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={retencion}
                      onChange={e => setRetencion(e.target.value)}
                      disabled={guardando}
                    />
                  </div>

                  <div className="vt-form-full">
                    <div className="vt-preview-box">
                      <span>Total estimado a pagar:</span>
                      <strong style={{ fontSize: '1.05rem' }}>{soles.format(totalCalculado)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="vt-modal-footer">
                <button type="button" onClick={cerrarModal} disabled={guardando} className="vt-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="vt-btn-primary">
                  {guardando ? 'Guardando…' : esModoEdicion ? 'Guardar cambios' : 'Guardar requerimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
