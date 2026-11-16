import { useState } from 'react'
import { supabase } from './supabase.js'

export default function NuevoRequerimiento({ alGuardar }) {
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

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
      const { data, error } = await supabase
        .from('requerimientos')
        .insert(registro)
        .select('id,fecha,sede,categoria,descripcion,total_a_pagar,estado')
        .single()

      if (error) throw error

      alGuardar(data)
      formulario.reset()
      setMensaje(`Requerimiento guardado como ${data.estado}.`)
    } catch (error) {
      setMensaje(`No se pudo guardar: ${error.message}`)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <details style={{ margin: '1rem 0' }}>
      <summary>+ Nuevo requerimiento</summary>
      <form onSubmit={guardar}>
        <fieldset disabled={guardando} style={{ border: 0 }}>
          <p><label>Fecha <input name="fecha" type="date" required /></label></p>
          <p><label>Sede <input name="sede" required /></label></p>
          <p><label>Categoría <input name="categoria" required /></label></p>
          <p><label>Descripción <textarea name="descripcion" required /></label></p>
          <p><label>Razón social <input name="razon_social" /></label></p>
          <p><label>Monto bruto (S/) <input name="monto_bruto" type="number" min="0" step="0.01" required /></label></p>
          <p><label>Retención (S/) <input name="retencion" type="number" min="0" step="0.01" defaultValue="0" /></label></p>
          <button type="submit">{guardando ? 'Guardando…' : 'Guardar requerimiento'}</button>
        </fieldset>
        <p role="status">{mensaje}</p>
      </form>
    </details>
  )
}
