import { useState } from 'react'
import './CajaChica.css'

// Muestra de los últimos movimientos de Noviembre extraídos de la hoja
const ultimosMovimientosCusco = [
  { item: 1315, fecha: '2026-11-19', beneficiario: 'JOSE INQUILLAY', doc: 'FACTURA', detalle: 'TERMINALES CONECTORES CON SU COBERTOR (REINTEGRO ELSE)', asiento: 'SUMINISTROS DE TRABAJO/EPPS', ingreso: 0, egreso: 87, saldo: 1431.80, placa: '' },
  { item: 1314, fecha: '2026-11-19', beneficiario: 'WILLIAM AYTI', doc: 'FACTURA', detalle: 'ADELANTO COMPRA DE 03 CAJAS FOCOS LED PARA CAMIONETA', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 100, saldo: 1518.80, placa: '' },
  { item: 1313, fecha: '2026-11-19', beneficiario: 'FLAVIO GONZALO', doc: 'YAPE', detalle: 'ACEITE DE 2 TIEMPOS MOTOSIERRA OCONGATE', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 5, saldo: 1618.80, placa: '' },
  { item: 1312, fecha: '2026-11-19', beneficiario: 'QQUESOHUALPA QQUENAYA', doc: 'FACTURA (FP01-4726)', detalle: 'COMBUSTIBLE MOTOSIERRA OCONGATE', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 20, saldo: 1623.80, placa: '' },
  { item: 1311, fecha: '2026-11-19', beneficiario: 'WILIHAMS ASTETE', doc: 'YAPE', detalle: 'TAXI PARA TRAER MATERIALES DE ELSE PARA URUBAMBA', asiento: 'MOVILIDAD', ingreso: 0, egreso: 7, saldo: 1643.80, placa: '' },
  { item: 1310, fecha: '2026-11-19', beneficiario: 'UCHARO JARRO SHERLY', doc: 'FACTURA (E001-433)', detalle: '1.00 UNIDAD FOCO LED IR100', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 280, saldo: 1650.80, placa: '' },
  { item: 1309, fecha: '2026-11-19', beneficiario: 'JV INGENIEROS EIRL', doc: 'FACTURA (F001-18584)', detalle: 'BATERIA SOLITE 12V', asiento: 'MANTENIMIENTO VEHICULAR', ingreso: 0, egreso: 400, saldo: 1930.80, placa: '' },
  { item: 1308, fecha: '2026-11-19', beneficiario: 'SERV ELENA EIRL', doc: 'FACTURA (FA01-39182)', detalle: 'COMBUSTIBLE CAMIONETA VBL915', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 100, saldo: 2330.80, placa: 'VBL-915' },
  { item: 1305, fecha: '2026-11-19', beneficiario: 'VALDIVIA GUZMAN RUBEN', doc: 'FACTURA (F001-7489)', detalle: 'COMBUSTIBLE CAMIONETA (VAN 934) SALVACION', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 100, saldo: 2715.80, placa: 'VAN-934' },
  { item: 1300, fecha: '2026-11-18', beneficiario: 'SERVICENTRO METROPOLITANO', doc: 'FACTURA (FA01-38703)', detalle: 'COMBUSTIBLE CAMIONETA CUSCO 01', asiento: 'COMBUSTIBLE', ingreso: 0, egreso: 200, saldo: 3195.80, placa: 'X6N-838' },
  { item: 1297, fecha: '2026-11-18', beneficiario: 'KAREN COLQUE', doc: 'TRANSFERENCIA BCP', detalle: 'INGRESO A CAJA CHICA (REPOSICIÓN)', asiento: 'INGRESO', ingreso: 3500, egreso: 0, saldo: 3695.95, placa: '' },
]

const ultimosMovimientosAnta = [
  {
    item: 505,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 20.0,
    saldo: 285.06,
    placa: ""
  },
  {
    item: 504,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 350.0,
    saldo: 305.06,
    placa: ""
  },
  {
    item: 503,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 3.0,
    saldo: 655.06,
    placa: ""
  },
  {
    item: 502,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 8.5,
    saldo: 658.06,
    placa: ""
  },
  {
    item: 501,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 60.0,
    saldo: 666.56,
    placa: ""
  },
  {
    item: 500,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 65.0,
    saldo: 726.56,
    placa: ""
  },
  {
    item: 499,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 35.0,
    saldo: 791.56,
    placa: ""
  },
  {
    item: 498,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 58.0,
    saldo: 826.56,
    placa: ""
  },
  {
    item: 497,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 16.0,
    saldo: 884.56,
    placa: ""
  },
  {
    item: 496,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 30.0,
    saldo: 900.56,
    placa: ""
  },
  {
    item: 495,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 11.0,
    saldo: 930.56,
    placa: ""
  },
  {
    item: 494,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 45.0,
    saldo: 941.56,
    placa: ""
  },
  {
    item: 493,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 4.7,
    saldo: 986.56,
    placa: ""
  },
  {
    item: 492,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 100.0,
    saldo: 991.26,
    placa: ""
  },
  {
    item: 491,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 10.0,
    saldo: 1091.26,
    placa: ""
  },
  {
    item: 490,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 10.0,
    saldo: 1101.26,
    placa: ""
  },
  {
    item: 489,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 100.0,
    saldo: 1111.26,
    placa: ""
  },
  {
    item: 488,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 46.0,
    saldo: 1211.26,
    placa: ""
  },
  {
    item: 487,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 27.0,
    saldo: 1257.26,
    placa: ""
  },
  {
    item: 486,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 61.5,
    saldo: 1284.26,
    placa: ""
  },
  {
    item: 485,
    fecha: "2026-11-17",
    beneficiario: "ANTHONY BERRIO",
    doc: "YAPE",
    detalle: "REVISION PREVENTIVO DE CARDAN POSTERIOR DE CAMIONETA GE TAMBOBAMBA, INCREMNETO DE PERNOS - PERNOS ROTOS - TORNERO",
    asiento: "MANTENIMIENTO VEHICULAR",
    ingreso: 0.0,
    egreso: 80.0,
    saldo: 1345.76,
    placa: ""
  },
  {
    item: 484,
    fecha: "2026-11-17",
    beneficiario: "CARLOS YURI CHEVARRIA",
    doc: "YAPE",
    detalle: "VIATICOS ING YURI CHEVARRIA COORDINACION EN OFICINA DE CUSCO Y DESPLAZAMIENTO A LA OFICINA DE IZCUCHACA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 20.0,
    saldo: 1425.76,
    placa: ""
  },
  {
    item: 483,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 100.0,
    saldo: 1445.76,
    placa: ""
  },
  {
    item: 482,
    fecha: "2026-11-18",
    beneficiario: "YOEL QUISPE",
    doc: "TRANSFERENCIA",
    detalle: "INGRESO A CAJA CHICA (REPOSICIÓN DE FONDOS ANTA)",
    asiento: "INGRESO",
    ingreso: 1500.0,
    egreso: 0.0,
    saldo: 1545.76,
    placa: ""
  },
  {
    item: 481,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 60.0,
    saldo: 45.76,
    placa: ""
  },
  {
    item: 480,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 35.0,
    saldo: 105.76,
    placa: ""
  },
  {
    item: 479,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 10.0,
    saldo: 140.76,
    placa: ""
  },
  {
    item: 478,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 0.05,
    saldo: 150.76,
    placa: ""
  },
  {
    item: 477,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 240.06,
    saldo: 150.81,
    placa: ""
  },
  {
    item: 476,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 2.5,
    saldo: 390.87,
    placa: ""
  },
  {
    item: 475,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 95.0,
    saldo: 393.37,
    placa: ""
  },
  {
    item: 474,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 73.0,
    saldo: 488.37,
    placa: ""
  },
  {
    item: 473,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 20.0,
    saldo: 561.37,
    placa: ""
  },
  {
    item: 472,
    fecha: "2026-11-14",
    beneficiario: "EFRAIN GUTIERREZ",
    doc: "YAPE",
    detalle: "ING EFRAIN COMPATIR CON SUPERVISORES DE ELSE IN PEDRO ROMAN, TECNICO SUPERVISOR AUGUSTO HUANACO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 60.0,
    saldo: 581.37,
    placa: ""
  },
  {
    item: 471,
    fecha: "2026-11-14",
    beneficiario: "EFRAIN GUTIERREZ",
    doc: "YAPE",
    detalle: "PASAJES DE ING EFRAIN CE DOMICILIO CUSCO - ANTA IZCUCHACA PARA REALIZAR CAMBIO DE TURNO Y COORDIANR CON SUPERVISORES DE ELSE  -  SEMANA DE DESCANSO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 30.0,
    saldo: 641.37,
    placa: ""
  },
  {
    item: 470,
    fecha: "2026-11-14",
    beneficiario: "EFRAIN GUTIERREZ",
    doc: "YAPE",
    detalle: "VIATICOS ING EFRAIN REGRESO DE TAMBOBAMBA A CUSCO - DOMICILIO -- LLEGO DE VIAJE A ALTAS HORAS DE LA NOCHE",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 50.0,
    saldo: 671.37,
    placa: ""
  },
  {
    item: 469,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 32.0,
    saldo: 721.37,
    placa: ""
  },
  {
    item: 468,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 22.0,
    saldo: 753.37,
    placa: ""
  },
  {
    item: 467,
    fecha: "2026-11-14",
    beneficiario: "RAUL VILLAGRA HILLCA",
    doc: "YAPE",
    detalle: "RECONOCIMIENTO DE VIATICOS DE GE ANTA  POR DESPLAZAMIENTO A REALIZAR MANIOBRAS DE INETERCONEXION",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 24.0,
    saldo: 775.37,
    placa: ""
  },
  {
    item: 466,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 100.0,
    saldo: 799.37,
    placa: ""
  },
  {
    item: 465,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE",
    doc: "TRANSFERENCIA",
    detalle: "INGRESO A CAJA CHICA (REPOSICIÓN DE FONDOS ANTA)",
    asiento: "INGRESO",
    ingreso: 1000.0,
    egreso: 0.0,
    saldo: 899.37,
    placa: ""
  },
  {
    item: 464,
    fecha: "2026-11-12",
    beneficiario: "HERMITAÑO FLORES GALIANO",
    doc: "YAPE",
    detalle: "POR PAGO DE CANCHA SINTETICA POR 02 HORAS - COMPARTIR DEPORTIVOS DE LOS TECNICOS",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 80.0,
    saldo: -100.63,
    placa: ""
  },
  {
    item: 463,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 0.05,
    saldo: -20.63,
    placa: ""
  },
  {
    item: 462,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 8.0,
    saldo: -20.58,
    placa: ""
  },
  {
    item: 461,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 3.5,
    saldo: -12.58,
    placa: ""
  },
  {
    item: 460,
    fecha: "2026-11-14",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 50.0,
    saldo: -9.08,
    placa: ""
  },
  {
    item: 459,
    fecha: "2026-11-12",
    beneficiario: "ADERLY LETONA",
    doc: "YAPE",
    detalle: "DEVOLUCION DE PASAJE AL PERSONAL TECNICO TRASLADO DE COYLLURQUI A LIMATAMBO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 180.0,
    saldo: 40.92,
    placa: ""
  },
  {
    item: 458,
    fecha: "2026-11-12",
    beneficiario: "YOEL QUISPE (RENDICIÓN PENDIENTE)",
    doc: "EN PROCESO",
    detalle: "GASTO OPERATIVO EN RENDICIÓN - OPERACIONES ANTA / ZONA ALTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0.0,
    egreso: 0.05,
    saldo: 220.92,
    placa: ""
  },
  {
    item: 457,
    fecha: "2026-11-12",
    beneficiario: "CESAR AÑO MISME",
    doc: "YAPE",
    detalle: "REPARACION DE CAÑERIA DE COMBUSTIBLE DE CAMIONETA -- MECANICO , VERIFICACION DE SISTEMA  ELECTRICO - LUCES EN MA ESTADO GE LIMATAMBO",
    asiento: "MOVILIDAD",
    ingreso: 0.0,
    egreso: 80.0,
    saldo: 220.97,
    placa: ""
  },
  {
    item: 456,
    fecha: "2026-11-12",
    beneficiario: "EFRAIN GUTIERREZ",
    doc: "S/C",
    detalle: "VIATICOS ING EFRAIN GUITIERREZ - SUPERVISION A GRUPOS DE EMERGENCIAS ZONA ALTA",
    asiento: "VIATICOS",
    ingreso: 0.0,
    egreso: 400.0,
    saldo: 300.97,
    placa: ""
  },
]

const ultimosMovimientosValleSagrado = [
  {
    item: 694,
    fecha: "2026-11-20",
    beneficiario: "INVERSIONES YAHUARMAQUI SAC",
    doc: "FACTURA (FA01-00030348)",
    detalle: "COMBUSTIBLE PAUCARTAMBO",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 310,
    saldo: -579.22,
    placa: ""
  },
  {
    item: 693,
    fecha: "2026-11-20",
    beneficiario: "CESAR YARIN",
    doc: "EFECTIVO",
    detalle: "ENVIO MATERIALES CORTE DE EMERGENCIA A PAUCARTAMBO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 8,
    saldo: -269.22,
    placa: ""
  },
  {
    item: 692,
    fecha: "2026-11-20",
    beneficiario: "MARCELINA CALLAÑAUPA",
    doc: "YAPE (1063786)",
    detalle: "LAVADO DE CAMIONETA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 20,
    saldo: -261.22,
    placa: ""
  },
  {
    item: 691,
    fecha: "2026-11-20",
    beneficiario: "ESTACION GALLITO DE LAS ROCAS EIRL",
    doc: "FACTURA (F001-00005908)",
    detalle: "COMBUSTIBLE MANU",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 300,
    saldo: -241.22,
    placa: "VAN-934"
  },
  {
    item: 690,
    fecha: "2026-11-20",
    beneficiario: "ESTACION DE SERVICIOS DURAMAX",
    doc: "FACTURA (F001-6561)",
    detalle: "COMBUSTIBLE LARES",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 300,
    saldo: 58.78,
    placa: "X6G-747"
  },
  {
    item: 689,
    fecha: "2026-11-20",
    beneficiario: "SERVICIOS MULTIPLES CARMELITAS SAC",
    doc: "FACTURA (F001-00007828)",
    detalle: "COMBUSTIBLE PAUCARTAMBO",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 445,
    saldo: 358.78,
    placa: "BMJ-828"
  },
  {
    item: 688,
    fecha: "2026-11-19",
    beneficiario: "GRUPO TURISTICO PERU SAC",
    doc: "FACTURA (FX01-00000398)",
    detalle: "VIATICOS REUNION CASA ING JUAN AYTI",
    asiento: "VIATICOS",
    ingreso: 0,
    egreso: 94,
    saldo: 803.78,
    placa: ""
  },
  {
    item: 687,
    fecha: "2026-11-19",
    beneficiario: "INVERSIONES SAN JOSE URCO SCRL",
    doc: "FACTURA (FP01-00004056)",
    detalle: "COMBUSTIBLE CALCA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 319.99,
    saldo: 897.78,
    placa: "X6L-818"
  },
  {
    item: 686,
    fecha: "2026-11-19",
    beneficiario: "YUL A MEZA Q",
    doc: "YAPE (1893906)",
    detalle: "PAGO IDA Y VUELTA EN JACCAS",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 20,
    saldo: 1217.77,
    placa: ""
  },
  {
    item: 685,
    fecha: "2026-11-19",
    beneficiario: "LOAIZA PEÑA RUT NOEMI",
    doc: "FACTURA (F001-00000491)",
    detalle: "COMPRA DE MALLA DE ASIENTO PARA MOTO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 28,
    saldo: 1237.77,
    placa: "0610-VX"
  },
  {
    item: 684,
    fecha: "2026-11-18",
    beneficiario: "CESAR YARIN",
    doc: "EFECTIVO",
    detalle: "REJODO DE PLANOS A0 Y PASAJES IDA Y VUELTA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 13,
    saldo: 1265.77,
    placa: ""
  },
  {
    item: 683,
    fecha: "2026-11-18",
    beneficiario: "DIEGO TUMBA",
    doc: "YAPE",
    detalle: "ENVIO A URUBAMBA Y TAXIS IDA Y VUELTA",
    asiento: "SUMINISTROS DE TRABAJO/EPPS",
    ingreso: 0,
    egreso: 49,
    saldo: 1278.77,
    placa: ""
  },
  {
    item: 682,
    fecha: "2026-11-18",
    beneficiario: "MULTISERVICIOS VE MONKEY KING",
    doc: "BOLETA (1489)",
    detalle: "PLOTEOS A1 ALIMENTADORES VALLE SAGRADO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 91,
    saldo: 1327.77,
    placa: ""
  },
  {
    item: 681,
    fecha: "2026-11-18",
    beneficiario: "CLARO",
    doc: "YAPE (1096287)",
    detalle: "PAGO INTERNET OFICINA URUBAMBA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 75.96,
    saldo: 1418.77,
    placa: ""
  },
  {
    item: 680,
    fecha: "2026-11-18",
    beneficiario: "JIMMY TURPO",
    doc: "YAPE (1076017)",
    detalle: "DESAYUNO CUSCO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 20,
    saldo: 1494.73,
    placa: ""
  },
  {
    item: 679,
    fecha: "2026-11-18",
    beneficiario: "HOSPEDAJE TERRA NUNA",
    doc: "BOLETA (92)",
    detalle: "ESTADIA CALCA / CAMIONETA SALIDA DE SALVACION",
    asiento: "ALQUILER DE LOCAL",
    ingreso: 0,
    egreso: 40,
    saldo: 1514.73,
    placa: ""
  },
  {
    item: 678,
    fecha: "2026-11-18",
    beneficiario: "ESTACION DURAMAX",
    doc: "FACTURA (F001-6553)",
    detalle: "COMBUSTIBLE LARES TRASLAPE CAMIONETA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 200,
    saldo: 1554.73,
    placa: "BMJ-709"
  },
  {
    item: 677,
    fecha: "2026-11-18",
    beneficiario: "JIMMY TURPO",
    doc: "YAPE (6899650)",
    detalle: "CENA TRAER CAMIONETA DE SALVACION",
    asiento: "VIATICOS",
    ingreso: 0,
    egreso: 15,
    saldo: 1754.73,
    placa: ""
  },
  {
    item: 676,
    fecha: "2026-11-17",
    beneficiario: "INGRESO A CAJA",
    doc: "TRANSFERENCIA",
    detalle: "REPOSICIÓN DE CAJA CHICA (CESAR YARIN)",
    asiento: "INGRESO",
    ingreso: 2000,
    egreso: 0,
    saldo: 1769.73,
    placa: ""
  },
  {
    item: 674,
    fecha: "2026-11-17",
    beneficiario: "ELECTRO SUR ESTE SAA",
    doc: "FACTURA (496417)",
    detalle: "PAGO DE LUZ OFICINA URUBAMBA",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 68.8,
    saldo: 19.73,
    placa: ""
  },
  {
    item: 671,
    fecha: "2026-11-17",
    beneficiario: "ALBERTO TUMBA",
    doc: "YAPE (3626950)",
    detalle: "PAGO STARLINK OCTUBRE",
    asiento: "SUMINISTROS DE TRABAJO/EPPS",
    ingreso: 0,
    egreso: 400,
    saldo: 88.63,
    placa: ""
  },
  {
    item: 670,
    fecha: "2026-11-17",
    beneficiario: "ESTACION GALLITO DE LAS ROCAS EIRL",
    doc: "FACTURA (F001-00005891)",
    detalle: "COMBUSTBLE CAMIONETA SALVACION TRASLAPE",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 320,
    saldo: 488.63,
    placa: "VAN-934"
  },
  {
    item: 669,
    fecha: "2026-11-17",
    beneficiario: "ABRASA POLLERIA",
    doc: "FACTURA (F001-000414)",
    detalle: "ALMUERZO CON EL ING RAUL",
    asiento: "VIATICOS",
    ingreso: 0,
    egreso: 100,
    saldo: 808.63,
    placa: ""
  },
  {
    item: 668,
    fecha: "2026-11-17",
    beneficiario: "ESTACION GALLITO DE LAS ROCAS EIRL",
    doc: "FACTURA (F001-00005890)",
    detalle: "COMBUSTIBLE SALIDA DE CAMIONETA SALVACION",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 300,
    saldo: 908.63,
    placa: "BMJ-709"
  },
  {
    item: 667,
    fecha: "2026-11-17",
    beneficiario: "MARCO HILLPA",
    doc: "YAPE (492713)",
    detalle: "PASAJES URUBAMBA",
    asiento: "VIATICOS",
    ingreso: 0,
    egreso: 20,
    saldo: 1208.63,
    placa: ""
  },
  {
    item: 666,
    fecha: "2026-11-17",
    beneficiario: "JOSE P ESPIRILLA S",
    doc: "YAPE (1091389)",
    detalle: "SOLDADURA CAMIONETA PAUCARTAMBO PORTA EXTINTOR ROTO",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 20,
    saldo: 1228.63,
    placa: ""
  },
  {
    item: 665,
    fecha: "2026-11-17",
    beneficiario: "INVERSIONES SAN JOSE DE URCO SRL",
    doc: "FACTURA (FP01-00004008)",
    detalle: "COMBUSTIBLE CALCA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 340.04,
    saldo: 1248.63,
    placa: "X6L-818"
  },
  {
    item: 664,
    fecha: "2026-11-17",
    beneficiario: "INVERSIONES ALFABAS SRL",
    doc: "FACTURA (E001-618)",
    detalle: "COMBUSTIBLE LARES",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 510.06,
    saldo: 1588.67,
    placa: "X6G-747"
  },
  {
    item: 663,
    fecha: "2026-11-17",
    beneficiario: "INVERSIONES YAHUARMAQUI SAC",
    doc: "FACTURA (FA01-00030247)",
    detalle: "COMBUSTIBLE URUBAMBA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 435,
    saldo: 2098.73,
    placa: "X5S-815"
  },
  {
    item: 662,
    fecha: "2026-11-16",
    beneficiario: "CESAR YARIN",
    doc: "EFECTIVO",
    detalle: "ENVIO A PAUCARTAMBO DE 3 FOTOCELULAS/ 04 PARES DE GUANTES/ CINTAS",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 9.5,
    saldo: 2533.73,
    placa: ""
  },
  {
    item: 661,
    fecha: "2026-11-16",
    beneficiario: "CESAR YARIN",
    doc: "TRANSFERENCIA",
    detalle: "INGRESO A CAJA CHICA (REPOSICIÓN)",
    asiento: "INGRESO",
    ingreso: 2000,
    egreso: 0,
    saldo: 2543.23,
    placa: ""
  },
  {
    item: 660,
    fecha: "2026-11-16",
    beneficiario: "SERVICENTRO EMPRESARIAL ALEJANDROS SRL",
    doc: "FACTURA (F001-00004518)",
    detalle: "COMBUSTIBLE PAUCARTAMBO",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 380,
    saldo: 543.23,
    placa: "BMJ-828"
  },
  {
    item: 659,
    fecha: "2026-11-16",
    beneficiario: "VENTA DE MATERIALES CARLITOS",
    doc: "FACTURA (672)",
    detalle: "COMPRA DE 10 PARES DE GUANTES",
    asiento: "SUMINISTROS DE TRABAJO/EPPS",
    ingreso: 0,
    egreso: 80,
    saldo: 923.23,
    placa: ""
  },
  {
    item: 658,
    fecha: "2026-11-15",
    beneficiario: "RAMCES OPERADOR LOGISTICO SAC",
    doc: "FACTURA (FF02-6330)",
    detalle: "COMBUSTIBLE PAUCARTAMBO",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 370,
    saldo: 1003.23,
    placa: "BMJ-828"
  },
  {
    item: 657,
    fecha: "2026-11-15",
    beneficiario: "SERVICENTRO PETRO INKA",
    doc: "FACTURA (F002-00017859)",
    detalle: "COMBUSTIBLE URUBAMBA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 300,
    saldo: 1373.23,
    placa: "X5S-815"
  },
  {
    item: 656,
    fecha: "2026-11-15",
    beneficiario: "YUPANQUI HUAMAN LUZ CLARITA",
    doc: "FACTURA (E001-124)",
    detalle: "COMPRA DE CABLE Y FUNDA PUERTA CAMIONETA NO ABRE",
    asiento: "GASTOS ADMINISTRATIVOS",
    ingreso: 0,
    egreso: 140,
    saldo: 1673.23,
    placa: "X5S-815"
  },
  {
    item: 650,
    fecha: "2026-11-14",
    beneficiario: "INVERSIONES ALFABAS SRL",
    doc: "FACTURA (E001-617)",
    detalle: "COMBUSTIBLE LARES - OTOCANI HUALLA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 400,
    saldo: 2882.23,
    placa: "X6G-747"
  },
  {
    item: 647,
    fecha: "2026-11-13",
    beneficiario: "CESAR YARIN",
    doc: "TRANSFERENCIA",
    detalle: "INGRESO A CAJA CHICA (REPOSICIÓN)",
    asiento: "INGRESO",
    ingreso: 3000,
    egreso: 0,
    saldo: 3352.38,
    placa: ""
  },
  {
    item: 646,
    fecha: "2026-11-13",
    beneficiario: "INVERSIONES SAN JOSE URCO SCRL",
    doc: "FACTURA (FP01-00003922)",
    detalle: "COMBUSTIBLE CALCA",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 350,
    saldo: 352.38,
    placa: "X6L-818"
  },
  {
    item: 644,
    fecha: "2026-11-13",
    beneficiario: "INVERCOMANU SCRL",
    doc: "FACTURA (FB01-00001314)",
    detalle: "COMBUSTIBLE SALVACION",
    asiento: "COMBUSTIBLE",
    ingreso: 0,
    egreso: 370,
    saldo: 832.38,
    placa: "BMJ-709"
  },
  {
    item: 642,
    fecha: "2026-11-12",
    beneficiario: "CESAR YARIN",
    doc: "TRANSFERENCIA",
    detalle: "INGRESO A CAJA CHICA (REPOSICIÓN)",
    asiento: "INGRESO",
    ingreso: 1000,
    egreso: 0,
    saldo: 1202.43,
    placa: ""
  }
]

export default function CajaChica() {
  // Nivel 1: Macro División
  const [macroDivision, setMacroDivision] = useState('cusco') // 'cusco' | 'cajamarca'
  // Nivel 2: Sub-cajas de Cusco
  const [subCajaCusco, setSubCajaCusco] = useState('cusco') // 'cusco' | 'anta' | 'valle_sagrado'
  const [filtroTexto, setFiltroTexto] = useState('')

  const formatearSoles = monto => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)
  }

  // Configuración dinámica según la sub-caja activa
  const configuraciones = {
    cusco: {
      titulo: 'Caja Chica Cusco (Sede Central)',
      subtitulo: 'Rendiciones generales, base de operaciones y administración central (Encargada: Karen Colque)',
      saldo: 1431.80,
      ingresos: 102905.00,
      egresos: 101473.20,
      movimientos: 1315,
      items: ultimosMovimientosCusco,
      responsable: 'Karen Colque',
      sedeText: 'Cusco Central',
    },
    anta: {
      titulo: 'Caja Chica Anta (Sub-sede)',
      subtitulo: 'Operaciones Anta, Izcuchaca, Limatambo, Cotabambas, Coyllurqui y Tambobamba (Encargado: Yoel Quispe)',
      saldo: 285.06,
      ingresos: 47385.00,
      egresos: 47099.94,
      movimientos: 506,
      items: ultimosMovimientosAnta,
      responsable: 'Yoel Quispe',
      sedeText: 'Anta',
    },
    valle_sagrado: {
      titulo: 'Caja Chica Valle Sagrado',
      subtitulo: 'Operaciones Urubamba, Calca, Lares, Paucartambo, Salvación y Machupicchu (Encargado: Cesar Yarin)',
      saldo: -711.22,
      ingresos: 124429.00,
      egresos: 125140.22,
      movimientos: 699,
      items: ultimosMovimientosValleSagrado,
      responsable: 'Cesar Yarin',
      sedeText: 'Valle Sagrado',
    },
  }

  const activa = configuraciones[subCajaCusco] || configuraciones.cusco

  const movimientosFiltrados = (macroDivision === 'cajamarca' ? [] : activa.items).filter(m => {
    if (!filtroTexto) return true
    const q = filtroTexto.toLowerCase()
    return (
      m.beneficiario.toLowerCase().includes(q) ||
      m.detalle.toLowerCase().includes(q) ||
      m.asiento.toLowerCase().includes(q) ||
      m.placa.toLowerCase().includes(q)
    )
  })

  return (
    <div className="cc-container">
      {/* Cabecera Principal */}
      <header className="cc-header">
        <div className="cc-header-info">
          <div className="cc-title-row">
            <div className="cc-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h2 className="cc-title">
              {macroDivision === 'cajamarca'
                ? 'Caja Chica Cajamarca'
                : activa.titulo}
            </h2>
          </div>
          <div className="cc-badges-row">
            <span className="cc-badge-live">
              {macroDivision === 'cajamarca' ? 'En Configuración' : 'Arqueo Activo'}
            </span>
            <span className="cc-badge-corp">
              {macroDivision === 'cajamarca' ? 'División Norte' : activa.sedeText}
            </span>
          </div>
          <p className="cc-desc">
            {macroDivision === 'cajamarca'
              ? 'Módulo de tesorería y rendición de gastos para las operaciones de la sede Cajamarca.'
              : activa.subtitulo}
          </p>
        </div>
      </header>

      {/* ==========================================================================
          SELECTORES DE DIVISIÓN (NIVEL 1: MACRO / NIVEL 2: SUB-CAJAS)
          ========================================================================== */}
      <section className="cc-division-nav">
        {/* Encabezado del Navegador */}
        <div className="cc-division-section-header">
          <div className="cc-division-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Nivel 1: Selección de División Regional</span>
          </div>
          <span className="cc-active-indicator">
            {macroDivision === 'cusco'
              ? `Cusco · ${activa.sedeText}`
              : 'Cajamarca'}
          </span>
        </div>

        {/* NIVEL 1: BOTONES GRANDES (CUSCO vs CAJAMARCA) */}
        <div className="cc-macro-grid">
          {/* Botón 1: CAJA CHICA CUSCO */}
          <button
            type="button"
            onClick={() => setMacroDivision('cusco')}
            className={`cc-macro-card ${macroDivision === 'cusco' ? 'active' : ''}`}
          >
            <div className="cc-macro-left">
              <div className="cc-macro-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
              </div>
              <div className="cc-macro-info">
                <span className="cc-macro-title">CAJA CHICA CUSCO</span>
                <span className="cc-macro-sub">Cusco, Anta y Valle Sagrado</span>
              </div>
            </div>
            <span className="cc-macro-badge">3 Sedes</span>
          </button>

          {/* Botón 2: CAJA CHICA CAJAMARCA */}
          <button
            type="button"
            onClick={() => setMacroDivision('cajamarca')}
            className={`cc-macro-card ${macroDivision === 'cajamarca' ? 'active' : ''}`}
          >
            <div className="cc-macro-left">
              <div className="cc-macro-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="cc-macro-info">
                <span className="cc-macro-title">CAJA CHICA CAJAMARCA</span>
                <span className="cc-macro-sub">División Norte</span>
              </div>
            </div>
            <span className="cc-macro-badge">Nueva Apertura</span>
          </button>
        </div>

        {/* NIVEL 2: SUB-CAJAS DENTRO DE CUSCO */}
        {macroDivision === 'cusco' && (
          <div className="cc-subcajas-wrap">
            <div className="cc-subcajas-header">
              <span className="cc-subcajas-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
                <span>Nivel 2: Sub-cajas de la Región Cusco</span>
              </span>
            </div>

            <div className="cc-subcajas-bar">
              {/* Sub-caja 1: Cusco Central */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('cusco')}
                className={`cc-sub-btn ${subCajaCusco === 'cusco' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Caja Chica Cusco</span>
                </div>
                <span className="cc-sub-pill">Karen Colque</span>
              </button>

              {/* Sub-caja 2: Anta */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('anta')}
                className={`cc-sub-btn ${subCajaCusco === 'anta' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Caja Chica Anta</span>
                </div>
                <span className="cc-sub-pill">Yoel Quispe</span>
              </button>

              {/* Sub-caja 3: Valle Sagrado */}
              <button
                type="button"
                onClick={() => setSubCajaCusco('valle_sagrado')}
                className={`cc-sub-btn ${subCajaCusco === 'valle_sagrado' ? 'active' : ''}`}
              >
                <div className="cc-sub-btn-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>Caja Chica Valle Sagrado</span>
                </div>
                <span className="cc-sub-pill">Cesar Yarin</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* VISTA SEGÚN LA SELECCIÓN */}
      {macroDivision === 'cajamarca' ? (
        /* Pantalla de Cajamarca (En preparación) */
        <section className="cc-action-banner" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="cc-banner-content">
            <div className="cc-banner-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)', color: '#60a5fa' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="cc-banner-text">
              <h3>
                CAJA CHICA CAJAMARCA (División Norte)
                <span className="cc-banner-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                  Pendiente de Apertura
                </span>
              </h3>
              <p>
                Esta sección está reservada para registrar las asignaciones, remesas y rendiciones de gastos de las operaciones de Cajamarca. Cuando se designe el monto inicial y el encargado, se activará la sincronización en tiempo real.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Tarjetas KPI de Estado Financiero de la Caja Seleccionada */}
          <section className="cc-kpis">
            <div className={`cc-kpi-card cc-kpi-saldo ${activa.saldo < 0 ? 'cc-kpi-saldo-negativo' : ''}`}>
              <div>
                <span className="cc-kpi-label">
                  {activa.saldo < 0 ? 'Saldo en Contra (Reintegro Pendiente)' : 'Saldo Disponible en Caja'}
                </span>
                <span className={`cc-kpi-val ${activa.saldo < 0 ? 'cc-kpi-val-red' : 'cc-kpi-val-green'}`}>
                  {formatearSoles(activa.saldo)}
                </span>
                <span className="cc-kpi-sub">{activa.titulo}</span>
              </div>
              <div className={`cc-kpi-icon ${activa.saldo < 0 ? 'cc-icon-red' : 'cc-icon-emerald'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Total Ingresos Asignados</span>
                <span className="cc-kpi-val">{formatearSoles(activa.ingresos)}</span>
                <span className="cc-kpi-sub">Presupuesto / Remesas</span>
              </div>
              <div className="cc-kpi-icon cc-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Total Egresos Rendidos</span>
                <span className="cc-kpi-val">{formatearSoles(activa.egresos)}</span>
                <span className="cc-kpi-sub">Comprobantes procesados</span>
              </div>
              <div className="cc-kpi-icon cc-icon-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </div>

            <div className="cc-kpi-card">
              <div>
                <span className="cc-kpi-label">Encargado Responsable</span>
                <span className="cc-kpi-val" style={{ fontSize: '1.05rem', marginTop: '6px' }}>{activa.responsable}</span>
                <span className="cc-kpi-sub">{activa.movimientos} registros en historial</span>
              </div>
              <div className="cc-kpi-icon cc-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </section>

          {/* Tabla con Muestra de Movimientos de la Caja Seleccionada */}
          <section className="cc-table-card">
            <div className="cc-table-top">
              <div className="cc-table-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Movimientos Recientes · {activa.titulo}</span>
                <span className="cc-pill-count">{movimientosFiltrados.length} registros</span>
              </div>
              <input
                type="text"
                className="cc-search-input"
                placeholder="Buscar por beneficiario, placa o detalle..."
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
              />
            </div>

            {/* Aviso táctil para móviles */}
            <div className="cc-mobile-table-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
              <span>Desliza la tabla hacia los lados para ver comprobantes, importes y saldos</span>
            </div>

            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}># Item</th>
                    <th style={{ width: '100px' }}>Fecha</th>
                    <th>Beneficiario / Razón Social</th>
                    <th>Comprobante</th>
                    <th>Detalle de la Operación</th>
                    <th>Tipo de Asiento</th>
                    <th style={{ width: '90px' }}>Placa</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Ingreso</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Egreso</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Saldo Acum.</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron registros para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map(m => (
                      <tr key={m.item}>
                        <td style={{ fontWeight: 700, color: '#64748b' }}>#{m.item}</td>
                        <td style={{ color: '#475569', fontSize: '0.84rem' }}>{m.fecha}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.beneficiario}</td>
                        <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{m.doc}</td>
                        <td style={{ color: '#334155' }}>{m.detalle}</td>
                        <td>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '2px 8px', borderRadius: '6px' }}>
                            {m.asiento}
                          </span>
                        </td>
                        <td>
                          {m.placa ? <span className="cc-chip-placa">{m.placa}</span> : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                          {m.ingreso > 0 ? (
                            <span className="cc-badge-ingreso">+{formatearSoles(m.ingreso)}</span>
                          ) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
                          {m.egreso > 0 ? (
                            <span className="cc-badge-egreso">-{formatearSoles(m.egreso)}</span>
                          ) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {formatearSoles(m.saldo)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
