import NuevoRequerimiento from './NuevoRequerimiento.jsx'
import Login from './Login.jsx'
import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCargando(true)
        supabase
          .from('requerimientos')
          .select('id,fecha,sede,categoria,descripcion,total_a_pagar,estado')
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
        .select('id,fecha,sede,categoria,descripcion,total_a_pagar,estado')
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

  const [actualizandoEstado, setActualizandoEstado] = useState(false)

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

  return (
    <main style={{ width: 'min(96%, 1200px)', margin: '2rem auto' }}>
      <button onClick={salir}>Cerrar sesión</button>
      <h1>Presupuesto Voltium</h1>
      <NuevoRequerimiento alGuardar={nuevo => {
        setFilas(actual => [nuevo, ...actual].sort((a, b) => b.fecha.localeCompare(a.fecha)))
        setFiltros(filtrosIniciales)
      }} />
      <p role="status">{mensaje}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <label>Desde <input type="date" name="desde" value={filtros.desde} onChange={cambiar} /></label>
        <label>Hasta <input type="date" name="hasta" value={filtros.hasta} onChange={cambiar} /></label>
        <label>Mes <input type="month" name="mes" value={filtros.mes} onChange={cambiar} /></label>
        {Object.entries({ sede: 'Sede', categoria: 'Categoría', estado: 'Estado' }).map(([campo, titulo]) => (
          <label key={campo}>
            {titulo}{' '}
            <select name={campo} value={filtros[campo]} onChange={cambiar}>
              <option value="">Todos</option>
              {[...new Set(filas.map(fila => fila[campo]))].sort().map(valor => (
                <option key={valor} value={valor}>{valor}</option>
              ))}
            </select>
          </label>
        ))}
        <button onClick={() => setFiltros(filtrosIniciales)}>Limpiar filtros</button>
      </div>
      <p><strong>{visibles.length} registros · Total a pagar {soles.format(totalCentimos / 100)}</strong></p>
      {!visibles.length && <p>No hay requerimientos con esos filtros.</p>}
      <div style={{ overflowX: 'auto' }}>
        <table cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Fecha</th><th>Sede</th><th>Categoría</th>
              <th>Descripción</th><th>Total a pagar</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(fila => (
              <tr key={fila.id}>
                <td>{fila.fecha.split('-').reverse().join('/')}</td>
                <td>{fila.sede}</td>
                <td>{fila.categoria}</td>
                <td>{fila.descripcion}</td>
                <td>{soles.format(fila.total_a_pagar)}</td>
                <td>
                  <select
                    aria-label={`Estado de ${fila.descripcion}`}
                    value={fila.estado}
                    disabled={actualizandoEstado}
                    onChange={evento => cambiarEstado(fila, evento.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Programado">Programado</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}


