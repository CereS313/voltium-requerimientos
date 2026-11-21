import { useState } from 'react'
import { supabase } from './supabase.js'

const fechaHoy = new Date().toISOString().split('T')[0]

const SEDES_CAJA = ['Cusco', 'Anta', 'Valle Sagrado']

const ASIENTOS_COMUNES = [
  'COMBUSTIBLE',
  'VIATICOS',
  'MANTENIMIENTO VEHICULAR',
  'GASTOS ADMINISTRATIVOS',
  'MOVILIDAD',
  'SUMINISTROS DE TRABAJO/EPPS',
  'ALQUILER DE LOCAL',
  'ALQUILER DE VEHICULOS',
  'EQUIPOS Y HERRAMIENTAS',
  'PEAJE',
  'SERVICIOS BASICOS',
  'ENCOMIENDA/FLETE',
  'INGRESO',
]

const COMPROBANTES_COMUNES = [
  'FACTURA',
  'BOLETA',
  'DJ',
  'TICKET',
  'YAPE',
  'TRANSFERENCIA',
  'RECIBO',
  'S/C',
  'OTRO',
]

const ENCARGADOS_POR_DEFECTO = {
  Cusco: 'Karen Colque',
  Anta: 'Yoel Quispe',
  'Valle Sagrado': 'Cesar Yarin',
}

export default function NuevoMovimientoCaja({
  edicion = null,
  onCerrar,
  alGuardar,
  alGuardarEdicion,
  alEliminar,
  sedePorDefecto = 'Cusco',
  usuario = null,
  esDesarrollador = false,
}) {
  const esModoEdicion = Boolean(edicion)

  const [sede, setSede] = useState(edicion?.sede || sedePorDefecto || 'Cusco')
  const [tipoOperacion, setTipoOperacion] = useState(
    edicion ? (edicion.ingreso > 0 && edicion.egreso === 0 ? 'INGRESO' : 'EGRESO') : 'EGRESO'
  )
  const [fecha, setFecha] = useState(edicion?.fecha || fechaHoy)
  const [monto, setMonto] = useState(
    edicion ? String(edicion.ingreso > 0 ? edicion.ingreso : edicion.egreso) : ''
  )
  const [tipoDoc, setTipoDoc] = useState(edicion?.tipo_documento || 'BOLETA')
  const [otroTipoDoc, setOtroTipoDoc] = useState('')
  const [nroDoc, setNroDoc] = useState(edicion?.nro_documento || '')
  const [ruc, setRuc] = useState(edicion?.ruc || '')
  const [beneficiario, setBeneficiario] = useState(edicion?.beneficiario || '')
  const [asiento, setAsiento] = useState(edicion?.asiento || 'GASTOS ADMINISTRATIVOS')
  const [otroAsiento, setOtroAsiento] = useState('')
  const [placa, setPlaca] = useState(edicion?.placa || '')
  const [detalle, setDetalle] = useState(edicion?.detalle || '')
  const [encargado, setEncargado] = useState(
    edicion?.encargado || ENCARGADOS_POR_DEFECTO[sedePorDefecto] || 'Karen Colque'
  )
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  function handleSedeChange(nuevaSede) {
    setSede(nuevaSede)
    if (!esModoEdicion) {
      setEncargado(ENCARGADOS_POR_DEFECTO[nuevaSede] || '')
    }
  }

  function handleTipoOperacionChange(nuevoTipo) {
    setTipoOperacion(nuevoTipo)
    if (nuevoTipo === 'INGRESO' && !esModoEdicion) {
      setAsiento('INGRESO')
      setTipoDoc('TRANSFERENCIA')
    } else if (nuevoTipo === 'EGRESO' && asiento === 'INGRESO' && !esModoEdicion) {
      setAsiento('GASTOS ADMINISTRATIVOS')
      setTipoDoc('BOLETA')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensaje('')

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setMensaje('Ingrese un monto válido mayor a 0.')
      return
    }

    if (!detalle.trim()) {
      setMensaje('Por favor ingrese el detalle o concepto de la operación.')
      return
    }

    const docFinal = tipoDoc === 'OTRO' ? otroTipoDoc.trim().toUpperCase() : tipoDoc
    const asientoFinal = asiento === '__otro__' ? otroAsiento.trim().toUpperCase() : asiento

    const ingresoVal = tipoOperacion === 'INGRESO' ? montoNum : 0.0
    const egresoVal = tipoOperacion === 'EGRESO' ? montoNum : 0.0

    const registro = {
      sede,
      fecha,
      beneficiario: beneficiario.trim().toUpperCase(),
      ruc: ruc.trim(),
      tipo_documento: docFinal || 'S/C',
      nro_documento: nroDoc.trim().toUpperCase(),
      detalle: detalle.trim().toUpperCase(),
      asiento: asientoFinal || (tipoOperacion === 'INGRESO' ? 'INGRESO' : 'GASTOS ADMINISTRATIVOS'),
      ingreso: ingresoVal,
      egreso: egresoVal,
      placa: placa.trim().toUpperCase(),
      encargado: encargado.trim().toUpperCase(),
      creado_por: usuario?.email || 'sistema@voltium.pe',
    }

    setGuardando(true)

    try {
      if (esModoEdicion) {
        // En modo edición, no sobreescribimos creado_por
        delete registro.creado_por
        const { data, error } = await supabase
          .from('caja_chica')
          .update(registro)
          .eq('id', edicion.id)
          .is('eliminado_en', null)
          .select()
          .single()

        if (error) throw error

        if (alGuardarEdicion) {
          alGuardarEdicion(edicion.id, data || { ...edicion, ...registro })
        }
        onCerrar()
      } else {
        const { data, error } = await supabase
          .from('caja_chica')
          .insert(registro)
          .select()
          .single()

        if (error) throw error

        if (alGuardar) {
          alGuardar(data || registro)
        }
        onCerrar()
      }
    } catch (err) {
      console.error('Error guardando movimiento de caja chica:', err)
      setMensaje(err.message || 'Error al guardar el registro en la base de datos.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    if (!edicion?.id) return
    const confirmar = window.confirm(
      `¿Está seguro de anular/eliminar este movimiento contable?\n\nDetalle: ${edicion.detalle}\nMonto: S/ ${edicion.egreso || edicion.ingreso}`
    )
    if (!confirmar) return

    setGuardando(true)
    setMensaje('')

    try {
      const { error } = await supabase
        .from('caja_chica')
        .update({ eliminado_en: new Date().toISOString() })
        .eq('id', edicion.id)
        .is('eliminado_en', null)

      if (error) throw error

      if (alEliminar) {
        alEliminar(edicion)
      }
      onCerrar()
    } catch (err) {
      console.error('Error eliminando movimiento:', err)
      setMensaje(err.message || 'Error al anular el movimiento en la base de datos.')
      setGuardando(false)
    }
  }

  return (
    <div className="vt-modal-overlay" onClick={e => e.target === e.currentTarget && !guardando && onCerrar()}>
      <div className="vt-modal-card" style={{ maxWidth: '640px' }}>
        {/* Cabecera Esmeralda / Corporativa */}
        <div
          className="vt-modal-header"
          style={{
            background: 'linear-gradient(135deg, #051d14 0%, #061c4d 100%)',
            borderBottom: '2.5px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{esModoEdicion ? 'Modificar Movimiento de Caja' : 'Nuevo Movimiento de Caja Chica'}</span>
                {esDesarrollador && (
                  <span style={{ fontSize: '0.68rem', background: '#f59e0b', color: '#061c4d', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                    ADMIN
                  </span>
                )}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>
                {esModoEdicion
                  ? `Editando registro contable #${edicion.id} · ${edicion.sede}`
                  : 'Registra un gasto operativo o reposición en la base de datos'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.3rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Mensaje de error/alerta */}
        {mensaje && (
          <div
            style={{
              padding: '10px 16px',
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              color: '#991b1b',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {mensaje}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="vt-modal-body" style={{ overflowY: 'auto', padding: '1.1rem 1.4rem', gap: '0.9rem' }}>
            {/* Fila 1: Selector de Sede y Tipo de Operación */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="vt-form-label" style={{ fontWeight: 700 }}>
                  Sede / Sub-Caja <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={sede}
                  onChange={e => handleSedeChange(e.target.value)}
                  className="vt-form-select"
                  required
                >
                  {SEDES_CAJA.map(s => (
                    <option key={s} value={s}>
                      {s === 'Cusco' ? 'Cusco Central' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="vt-form-label" style={{ fontWeight: 700 }}>
                  Tipo de Operación <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleTipoOperacionChange('EGRESO')}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: tipoOperacion === 'EGRESO' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: tipoOperacion === 'EGRESO' ? '#fef2f2' : '#ffffff',
                      color: tipoOperacion === 'EGRESO' ? '#b91c1c' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🔴</span> Egreso (Gasto)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoOperacionChange('INGRESO')}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: tipoOperacion === 'INGRESO' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: tipoOperacion === 'INGRESO' ? '#ecfdf5' : '#ffffff',
                      color: tipoOperacion === 'INGRESO' ? '#047857' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🟢</span> Ingreso (Remesa)
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Fecha y Monto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="vt-form-label" style={{ fontWeight: 700 }}>
                  Fecha de la Operación <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="vt-form-input"
                  required
                />
              </div>

              <div>
                <label className="vt-form-label" style={{ fontWeight: 700 }}>
                  Monto Total (S/) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 800,
                      color: tipoOperacion === 'INGRESO' ? '#047857' : '#b91c1c',
                      fontSize: '0.95rem',
                    }}
                  >
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    className="vt-form-input"
                    style={{
                      paddingLeft: '34px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: tipoOperacion === 'INGRESO' ? '#047857' : '#b91c1c',
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fila 3: Comprobante y Nro de Serie */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="vt-form-label">Tipo de Comprobante</label>
                <select
                  value={tipoDoc}
                  onChange={e => setTipoDoc(e.target.value)}
                  className="vt-form-select"
                >
                  {COMPROBANTES_COMUNES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {tipoDoc === 'OTRO' && (
                  <input
                    type="text"
                    placeholder="Especifique tipo..."
                    value={otroTipoDoc}
                    onChange={e => setOtroTipoDoc(e.target.value)}
                    className="vt-form-input"
                    style={{ marginTop: '6px' }}
                    required
                  />
                )}
              </div>

              <div>
                <label className="vt-form-label">N° Serie / Comprobante</label>
                <input
                  type="text"
                  placeholder="ej. FE01-002566 o 001-176"
                  value={nroDoc}
                  onChange={e => setNroDoc(e.target.value)}
                  className="vt-form-input"
                />
              </div>
            </div>

            {/* Fila 4: RUC y Beneficiario */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px' }}>
              <div>
                <label className="vt-form-label">RUC / DNI</label>
                <input
                  type="text"
                  placeholder="ej. 20609903041"
                  value={ruc}
                  onChange={e => setRuc(e.target.value)}
                  className="vt-form-input"
                />
              </div>

              <div>
                <label className="vt-form-label">Beneficiario / Razón Social</label>
                <input
                  type="text"
                  placeholder="ej. PETROESMAD, RESTAURANTE..."
                  value={beneficiario}
                  onChange={e => setBeneficiario(e.target.value)}
                  className="vt-form-input"
                />
              </div>
            </div>

            {/* Fila 5: Asiento (Categoría) y Placa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <div>
                <label className="vt-form-label">Tipo de Asiento / Categoría</label>
                <select
                  value={asiento}
                  onChange={e => setAsiento(e.target.value)}
                  className="vt-form-select"
                >
                  {ASIENTOS_COMUNES.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                  <option value="__otro__">+ Otra Categoría...</option>
                </select>
                {asiento === '__otro__' && (
                  <input
                    type="text"
                    placeholder="Escriba nueva categoría..."
                    value={otroAsiento}
                    onChange={e => setOtroAsiento(e.target.value)}
                    className="vt-form-input"
                    style={{ marginTop: '6px' }}
                    required
                  />
                )}
              </div>

              <div>
                <label className="vt-form-label">Placa Vehicular</label>
                <input
                  type="text"
                  placeholder="ej. VBL-894, BMJ-828"
                  value={placa}
                  onChange={e => setPlaca(e.target.value)}
                  className="vt-form-input"
                />
              </div>
            </div>

            {/* Fila 6: Encargado */}
            <div>
              <label className="vt-form-label">Encargado Responsable</label>
              <input
                type="text"
                placeholder="Karen Colque, Cesar Yarin, Yoel Quispe..."
                value={encargado}
                onChange={e => setEncargado(e.target.value)}
                className="vt-form-input"
              />
            </div>

            {/* Fila 7: Detalle / Glosa */}
            <div>
              <label className="vt-form-label" style={{ fontWeight: 700 }}>
                Detalle / Glosa de la Operación <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Detalle explicativo del gasto, destino, repuesto o concepto del movimiento..."
                value={detalle}
                onChange={e => setDetalle(e.target.value)}
                className="vt-form-input"
                style={{ resize: 'vertical', minHeight: '60px' }}
                required
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div
            className="vt-modal-footer"
            style={{
              padding: '0.85rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            {esModoEdicion ? (
              <button
                type="button"
                onClick={handleEliminar}
                disabled={guardando}
                className="vt-btn-delete-modal"
                title="Anular / eliminar este movimiento"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                <span>Eliminar Movimiento</span>
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onCerrar}
                disabled={guardando}
                className="vt-btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="vt-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderColor: '#10b981',
                }}
              >
                {guardando ? (
                  <span>Guardando...</span>
                ) : esModoEdicion ? (
                  <span>Guardar Cambios</span>
                ) : (
                  <span>+ Registrar Movimiento</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
