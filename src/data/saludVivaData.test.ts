import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AREAS_SERVICIO,
  ESPECIALIDADES,
  MEDICOS_BASE,
  AUXILIAR_TURNO_DEFAULT,
  construirMapaDescansosPorDefecto,
  calcularValorConsulta,
  obtenerEtiquetaConceptoPago,
  obtenerRequisitosDocumentos,
  obtenerTipoAtencionPorDefecto,
  especialidadSoportaTipoAtencion,
  obtenerAreasParaTipoAtencion,
  obtenerEspecialidadesParaAreaYTipo,
  obtenerDuracionProcedimientoPorDefecto,
  generarFranjasHorariasDisponibles,
  obtenerAlternativasPorDescanso,
  generarNumeroRecibo,
  construirIdAuxiliarParaEspecialidad,
  construirObservacionApartado,
  extraerLimiteApartadoMs,
  limpiarEtiquetaApartado,
  formatearCuentaRegresivaMs,
  tieneSoportesCompletos,
  inferirTipoEnvioCorreoDesdeAuditoria,
  PROCEDIMIENTOS_CATALOGO,
  PROCEDIMIENTO_PERSONALIZADO_ID,
  obtenerProcedimientosPorArea,
  obtenerTarifaProcedimientoCatalogo,
  calcularLiquidacionDesdeValorBase,
  mapearCitaDesdeFila,
  formatearDuracionVisibleCita,
  construirObservacionSolicitudDoc,
  extraerDocumentoSolicitado,
  ESPECIALIDADES_ACCESO_DIRECTO,
  esArchivoPdf,
  obtenerPinDefaultMedico,
  obtenerPinEfectivoMedico,
  validarPinMedico,
  construirHtmlReporteExcel,
  type CitaMedica,
  type MedicoBase,
  type RegistroAuditoria,
  type TarifasConfig,
} from './saludVivaData';
import {
  construirHtmlFacturaORecibo,
  construirHtmlNotificacionCita,
  construirHtmlPinTemporal,
} from '../services/mailer';

const TARIFAS_TEST: TarifasConfig = {
  A: 4700,
  B: 19200,
  C: 50300,
  particular: 50000,
};

test('catálogo tiene 6 áreas, 51 especialidades y excluye Medicina Familiar y Ruta PyM', () => {
  assert.equal(AREAS_SERVICIO.length, 6);
  assert.equal(ESPECIALIDADES.length, 51);

  const nombresLower = ESPECIALIDADES.map((e) => e.nombre.toLowerCase());
  const idsLower = ESPECIALIDADES.map((e) => e.id.toLowerCase());
  assert.equal(
    nombresLower.some((n) => n.includes('medicina familiar')),
    false
  );
  assert.equal(
    nombresLower.some((n) => n.includes('ruta pym') || n.includes('promoción y mantenimiento')),
    false
  );
  assert.equal(idsLower.includes('medicina_familiar'), false);
  assert.equal(idsLower.includes('ruta_pym'), false);
});

test('directorio médico base tiene 5 en Medicina General y 3 en cada otra especialidad (155 total)', () => {
  assert.equal(MEDICOS_BASE.length, 155);
  const mg = MEDICOS_BASE.filter((m) => m.especialidad === 'medicina_general');
  assert.equal(mg.length, 5);

  for (const esp of ESPECIALIDADES) {
    if (esp.id === 'medicina_general') continue;
    const count = MEDICOS_BASE.filter((m) => m.especialidad === esp.id).length;
    assert.equal(count, 3, `Se esperaban 3 médicos en ${esp.id}, encontrados ${count}`);
  }
});

test('calcularValorConsulta distingue Cuota Moderadora (Consulta) vs Copago % (Procedimiento/Terapia)', () => {
  // Consulta Médica -> Cuota Moderadora a Cotizante y Beneficiario
  assert.equal(
    calcularValorConsulta('Contributivo · Cotizante · Rango A', TARIFAS_TEST, 'medicina_general', undefined, 'consulta'),
    4700
  );
  assert.equal(
    calcularValorConsulta('Contributivo · Cotizante · Rango B', TARIFAS_TEST, 'cardiologia', undefined, 'consulta'),
    19200
  );
  assert.equal(
    calcularValorConsulta('Contributivo · Beneficiario · Rango C', TARIFAS_TEST, 'neurocirugia', undefined, 'consulta'),
    50300
  );
  assert.equal(
    calcularValorConsulta('Subsidiado · Afiliado subsidiado · Rango A', TARIFAS_TEST),
    0
  );
  assert.equal(
    calcularValorConsulta('Población no asegurada · No aplica · SISBÉN en trámite', TARIFAS_TEST),
    0
  );

  // Procedimiento / Terapia -> Cotizante Exento ($0), Beneficiario paga Copago % (11.5% / 17.3% / 23%)
  assert.equal(
    calcularValorConsulta('Contributivo · Cotizante · Rango B', TARIFAS_TEST, 'neurocirugia', undefined, 'procedimiento'),
    0
  );
  // Neurocirugía tarifa particular = 200000 -> valor referencial procedimiento = 300000 -> 11.5% = 34500
  assert.equal(
    calcularValorConsulta('Contributivo · Beneficiario · Rango A', TARIFAS_TEST, 'neurocirugia', undefined, 'procedimiento'),
    34500
  );
  // 17.3% de 300000 = 51900
  assert.equal(
    calcularValorConsulta('Contributivo · Beneficiario · Rango B', TARIFAS_TEST, 'neurocirugia', undefined, 'procedimiento'),
    51900
  );
  // 23% de 300000 = 69000
  assert.equal(
    calcularValorConsulta('Contributivo · Beneficiario · Rango C', TARIFAS_TEST, 'neurocirugia', undefined, 'procedimiento'),
    69000
  );

  // Subsidiado Rango A $0; Rango B 10%
  assert.equal(
    calcularValorConsulta('Subsidiado · Afiliado subsidiado · Rango A', TARIFAS_TEST, 'fisioterapia', undefined, 'procedimiento'),
    0
  );
  assert.equal(
    calcularValorConsulta('Subsidiado · Afiliado subsidiado · Rango B', TARIFAS_TEST, 'fisioterapia', undefined, 'procedimiento'),
    9800
  );

  // Particular cobra tarifa según especialidad en consulta y 1.5x referencial en procedimiento
  assert.equal(
    calcularValorConsulta('Particular · No aplica · Tarifa plena', TARIFAS_TEST, 'cardiologia'),
    160000
  );
  assert.equal(
    calcularValorConsulta('Particular · No aplica · Tarifa plena', TARIFAS_TEST, 'cardiologia', {
      cardiologia: 185000,
    }),
    185000
  );
  assert.equal(
    calcularValorConsulta('Particular · No aplica · Tarifa plena', TARIFAS_TEST, 'cardiologia', undefined, 'procedimiento'),
    240000
  );
});

test('obtenerEtiquetaConceptoPago muestra Cuota Moderadora en Consulta y Copago en Procedimiento cuando corresponde', () => {
  assert.equal(
    obtenerEtiquetaConceptoPago('Contributivo · Cotizante · Rango B', 'consulta'),
    'Cuota Moderadora (Rango B)'
  );
  assert.equal(
    obtenerEtiquetaConceptoPago('Contributivo · Cotizante · Rango B', 'procedimiento'),
    'Exento de Copago (Cotizante PBS)'
  );
  assert.match(
    obtenerEtiquetaConceptoPago('Contributivo · Beneficiario · Rango A', 'procedimiento'),
    /^Copago Beneficiario Rango A \(11,5%/
  );
  assert.match(
    obtenerEtiquetaConceptoPago('Contributivo · Beneficiario · Rango B', 'procedimiento'),
    /^Copago Beneficiario Rango B \(17,3%/
  );
  assert.equal(
    obtenerEtiquetaConceptoPago('Particular · No aplica · Tarifa plena', 'consulta'),
    'Tarifa Consulta Particular'
  );
  assert.equal(
    obtenerEtiquetaConceptoPago('Particular · No aplica · Tarifa plena', 'procedimiento'),
    'Tarifa Procedimiento Particular'
  );
  assert.equal(
    obtenerEtiquetaConceptoPago('Subsidiado · Afiliado subsidiado · Rango A', 'consulta'),
    'Exento SGSSS ($0)'
  );
});

test('obtenerRequisitosDocumentos exime Medicina General, Odontología y Vacunación en consultas, pide solo orden en Optometría, ambos en demás consultas y uno en procedimientos', () => {
  assert.equal(obtenerTipoAtencionPorDefecto('medicina_general'), 'consulta');
  assert.equal(obtenerTipoAtencionPorDefecto('fisioterapia'), 'procedimiento');

  // Acceso directo sin orden ni autorización en consultas: Medicina General, Odontología y Vacunación
  assert.deepEqual(ESPECIALIDADES_ACCESO_DIRECTO, [
    'medicina_general',
    'odontologia',
    'vacunacion_pai',
  ]);

  for (const espDirecta of ['medicina_general', 'odontologia', 'vacunacion_pai']) {
    const reqDirecto = obtenerRequisitosDocumentos(espDirecta, 'Contributivo · Beneficiario · Rango A', 'consulta');
    assert.equal(reqDirecto.requiereOrden, false);
    assert.equal(reqDirecto.requiereAutorizacion, false);
    assert.equal(reqDirecto.permiteAlMenosUno, false);
  }

  // Optometría y Audiología: solo Orden Médica
  for (const espSoloOrden of ['optometria', 'audiologia']) {
    const reqSoloOrden = obtenerRequisitosDocumentos(espSoloOrden, 'Contributivo · Beneficiario · Rango A', 'consulta');
    assert.equal(reqSoloOrden.requiereOrden, true);
    assert.equal(reqSoloOrden.requiereAutorizacion, false);
    assert.equal(reqSoloOrden.permiteAlMenosUno, false);
  }

  // Todas las demás consultas (Cardiología, Pediatría, Neurocirugía, Particular, etc.) exigen Orden Y Autorización
  const reqCardio = obtenerRequisitosDocumentos('cardiologia', 'Subsidiado · Afiliado subsidiado · Rango A', 'consulta');
  assert.equal(reqCardio.requiereOrden, true);
  assert.equal(reqCardio.requiereAutorizacion, true);
  assert.equal(reqCardio.permiteAlMenosUno, false);

  const reqNeuro = obtenerRequisitosDocumentos('neurocirugia', 'Contributivo · Beneficiario · Rango A', 'consulta');
  assert.equal(reqNeuro.requiereOrden, true);
  assert.equal(reqNeuro.requiereAutorizacion, true);
  assert.equal(reqNeuro.permiteAlMenosUno, false);

  const reqPartCons = obtenerRequisitosDocumentos('cardiologia', 'Particular · No aplica · Tarifa plena', 'consulta');
  assert.equal(reqPartCons.requiereOrden, true);
  assert.equal(reqPartCons.requiereAutorizacion, true);
  assert.equal(reqPartCons.permiteAlMenosUno, false);

  // En procedimientos se puede confirmar con Orden O Autorización (no se necesitan ambos)
  const reqProcEps = obtenerRequisitosDocumentos('neurocirugia', 'Contributivo · Beneficiario · Rango A', 'procedimiento');
  assert.equal(reqProcEps.requiereOrden, true);
  assert.equal(reqProcEps.requiereAutorizacion, true);
  assert.equal(reqProcEps.permiteAlMenosUno, true);

  const reqPartProc = obtenerRequisitosDocumentos('fisioterapia', 'Particular · No aplica · Tarifa plena', 'procedimiento');
  assert.equal(reqPartProc.requiereOrden, true);
  assert.equal(reqPartProc.requiereAutorizacion, true);
  assert.equal(reqPartProc.permiteAlMenosUno, true);
});

test('filtro por Tipo de Atención excluye Medicina General de Procedimientos y excluye terapias/lab de Consultas', () => {
  assert.equal(especialidadSoportaTipoAtencion('medicina_general', 'consulta'), true);
  assert.equal(especialidadSoportaTipoAtencion('medicina_general', 'procedimiento'), false);

  assert.equal(especialidadSoportaTipoAtencion('fisioterapia', 'consulta'), false);
  assert.equal(especialidadSoportaTipoAtencion('fisioterapia', 'procedimiento'), true);

  const areasConsulta = obtenerAreasParaTipoAtencion('consulta').map((a) => a.id);
  const areasProc = obtenerAreasParaTipoAtencion('procedimiento').map((a) => a.id);
  assert.equal(areasConsulta.includes('general'), true);
  assert.equal(areasProc.includes('general'), false);

  const espsTerapCons = obtenerEspecialidadesParaAreaYTipo('apoyo_terapeutico', 'consulta').map((e) => e.id);
  const espsTerapProc = obtenerEspecialidadesParaAreaYTipo('apoyo_terapeutico', 'procedimiento').map((e) => e.id);
  assert.equal(espsTerapCons.includes('nutricion_dietetica'), true);
  assert.equal(espsTerapCons.includes('fisioterapia'), false);
  assert.equal(espsTerapProc.includes('fisioterapia'), true);
  assert.equal(espsTerapProc.includes('nutricion_dietetica'), false);
});

test('duración variable de procedimientos bloquea todo el rango horario para evitar cruces', () => {
  assert.equal(obtenerDuracionProcedimientoPorDefecto('toma_muestras_lab'), 30);
  assert.equal(obtenerDuracionProcedimientoPorDefecto('fisioterapia'), 45);
  assert.equal(obtenerDuracionProcedimientoPorDefecto('neurocirugia'), 90);

  // Si un médico tiene un procedimiento de 90 min a las 08:00 AM (08:00 - 09:30),
  // una consulta de 30 min NO debe poder agendarse a las 08:00, 08:30 ni 09:00 AM.
  const franjasConsulta30 = generarFranjasHorariasDisponibles(
    30,
    '2026-12-15',
    [{ hora: '08:00 AM', duracionMin: 90 }]
  );
  assert.equal(franjasConsulta30.includes('07:30 AM'), true);
  assert.equal(franjasConsulta30.includes('08:00 AM'), false);
  assert.equal(franjasConsulta30.includes('08:30 AM'), false);
  assert.equal(franjasConsulta30.includes('09:00 AM'), false);
  assert.equal(franjasConsulta30.includes('09:30 AM'), true);

  // Y otro procedimiento de 60 min tampoco puede iniciar a las 07:30 AM (07:30-08:30 choca)
  const franjasProc60 = generarFranjasHorariasDisponibles(
    60,
    '2026-12-15',
    [{ hora: '08:00 AM', duracionMin: 90 }]
  );
  assert.equal(franjasProc60.includes('07:00 AM'), true);
  assert.equal(franjasProc60.includes('07:30 AM'), false);
  assert.equal(franjasProc60.includes('08:00 AM'), false);
  assert.equal(franjasProc60.includes('09:30 AM'), true);
});

test('formatearDuracionHumana y calcularHoraFinEstimada soportan cirugías largas de hasta 12+ horas', async () => {
  const { formatearDuracionHumana, calcularHoraFinEstimada } = await import('./saludVivaData');
  assert.equal(formatearDuracionHumana(20), '20 min');
  assert.equal(formatearDuracionHumana(60), '1 h');
  assert.equal(formatearDuracionHumana(90), '1 h 30 min');
  assert.equal(formatearDuracionHumana(720), '12 h');
  assert.equal(calcularHoraFinEstimada('06:00 AM', 720), '06:00 PM');
  assert.equal(calcularHoraFinEstimada('08:00 AM', 720), '08:00 PM');
  assert.equal(calcularHoraFinEstimada('02:00 PM', 720), '02:00 AM (+1 día)');
});

test('helpers de apartamiento (sin plazo 15 min) codifican, limpian y validan soportes en consultas vs procedimientos', () => {
  const obsSinLimite = construirObservacionApartado();
  assert.equal(
    obsSinLimite,
    'Apartamiento pendiente de subir soportes médicos (sin límite de tiempo).'
  );
  const limite = 1795000900000;
  const obs = construirObservacionApartado(limite);
  const parsed = extraerLimiteApartadoMs({ id: 'CIT-10', observacionAdmin: obs });
  assert.equal(parsed, limite);
  assert.equal(
    limpiarEtiquetaApartado(obs),
    'Apartamiento pendiente de subir soportes médicos.'
  );
  assert.equal(formatearCuentaRegresivaMs(900000), '15:00');
  assert.equal(formatearCuentaRegresivaMs(65000), '01:05');
  assert.equal(formatearCuentaRegresivaMs(-500), '00:00');

  // Consulta (excepto Medicina General): exige AMBOS soportes (Orden y Autorización)
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: 'https://x/orden.jpg',
        fotoAutorizacionUrl: undefined,
      },
      'consulta'
    ),
    false
  );
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: undefined,
        fotoAutorizacionUrl: 'https://x/aut.jpg',
      },
      'consulta'
    ),
    false
  );
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: 'https://x/orden.jpg',
        fotoAutorizacionUrl: 'https://x/aut.jpg',
      },
      'consulta'
    ),
    true
  );

  // Procedimiento: basta con UNO de los dos (Orden o Autorización)
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: undefined,
        fotoAutorizacionUrl: undefined,
      },
      'procedimiento'
    ),
    false
  );
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: 'https://x/orden.jpg',
        fotoAutorizacionUrl: undefined,
      },
      'procedimiento'
    ),
    true
  );
  assert.equal(
    tieneSoportesCompletos(
      {
        especialidad: 'neurocirugia',
        pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
        fotoOrdenUrl: undefined,
        fotoAutorizacionUrl: 'https://x/aut.jpg',
      },
      'procedimiento'
    ),
    true
  );

  // Solicitud específica de Orden / Autorización / Ambas en observacionAdmin
  const obsReq = construirObservacionSolicitudDoc('autorizacion', 'Adjuntar autorización vigente.');
  assert.equal(extraerDocumentoSolicitado(obsReq), 'autorizacion');
  assert.equal(limpiarEtiquetaApartado(obsReq), 'Adjuntar autorización vigente.');
});

test('descanso semanal y suplente auxiliar ofrecen colegas activos + Auxiliar de Turno cuando el titular descansa', () => {
  const descansos = construirMapaDescansosPorDefecto(MEDICOS_BASE);
  // m1 descansa los lunes (diaSemana === 1). Busquemos el próximo lunes en calendario.
  const lunesIso = '2026-11-23'; // 2026-11-23 es Lunes
  assert.equal(descansos['m1'], 1);

  const m1 = MEDICOS_BASE.find((m) => m.id === 'm1')!;
  const citasMock: CitaMedica[] = [];

  const alt = obtenerAlternativasPorDescanso(
    m1,
    lunesIso,
    MEDICOS_BASE,
    descansos,
    AUXILIAR_TURNO_DEFAULT,
    citasMock,
    20
  );

  assert.equal(alt.colegasDisponibles.length, 4);
  assert.equal(
    alt.colegasDisponibles.some((c) => c.id === 'm1'),
    false
  );
  assert.ok(alt.auxiliarDisponible);
  assert.equal(
    alt.auxiliarDisponible?.id,
    construirIdAuxiliarParaEspecialidad('medicina_general')
  );
  assert.match(alt.auxiliarDisponible?.nombre || '', /Suplente/);
});

test('generarNumeroRecibo crea prefijo acorde al método de pago y templates HTML escapan contenido', () => {
  assert.match(generarNumeroRecibo('Datáfono'), /^REC-DAT-\d{6}$/);
  assert.match(generarNumeroRecibo('Transferencia'), /^REC-TRF-\d{6}$/);
  assert.match(generarNumeroRecibo('Efectivo'), /^REC-EFE-\d{6}$/);
  assert.match(generarNumeroRecibo('Exento ($0)'), /^REC-EXE-\d{6}$/);

  const mailFac = construirHtmlFacturaORecibo({
    facturaId: 'REC-CAJA-10001',
    reciboNumero: 'REC-DAT-456789',
    citaId: 'CIT-99999',
    pacienteNombre: 'Jorge <Prueba>',
    pacienteCedula: '1011223344',
    pacienteEps: 'Nueva EPS',
    pacienteClasificacion: 'Contributivo · Cotizante · Rango B',
    conceptoPago: 'Cuota Moderadora (Rango B)',
    especialidad: 'Medicina General (20 min)',
    medico: 'Dr. Andrés Felipe Vargas',
    consultorio: 'Cons. 101',
    fechaCita: '2026-11-24',
    horaCita: '08:00 AM',
    valorTexto: '$19.200 COP',
    metodoPago: 'Datáfono',
    estadoPago: 'PAGADO Y ATENDIDO EN SALA',
    fechaEmision: '2026-11-20 10:00',
  });
  assert.match(mailFac.html, /REC-DAT-456789/);
  assert.match(mailFac.html, /Jorge &lt;Prueba&gt;/);

  const mailNotif = construirHtmlNotificacionCita({
    asunto: 'Aviso',
    titulo: 'Reprogramada',
    citaId: 'CIT-12345',
    pacienteNombre: 'Ana',
    mensaje: 'Cambio de horario',
    especialidad: 'Pediatría',
    medico: 'Dra. Laura',
    consultorio: 'Cons. 201',
    fechaCita: '2026-11-25',
    horaCita: '09:00 AM',
  });
  assert.match(mailNotif.html, /CIT-12345/);

  const mailPin = construirHtmlPinTemporal({
    pacienteNombre: 'Ana',
    pinTemp: '7391',
    fecha: '2026-11-20',
  });
  assert.match(mailPin.html, /7391/);
});

test('inferirTipoEnvioCorreoDesdeAuditoria obtiene el último tipo enviado para un código de cita', () => {
  const aud: RegistroAuditoria[] = [
    {
      id: 'A3',
      fechaHora: '2026-11-20 10:15',
      usuario: 'Admin',
      rol: 'Nivel 2',
      accion: 'Recordatorio Correo',
      detalle: 'Cita SV-99110 · OK',
    },
    {
      id: 'A2',
      fechaHora: '2026-11-20 10:05',
      usuario: 'Admin',
      rol: 'Nivel 2',
      accion: 'Docs Aprobados',
      detalle: 'Cita SV-99110 · 30 min',
    },
    {
      id: 'A1',
      fechaHora: '2026-11-20 10:00',
      usuario: 'Paciente',
      rol: 'Paciente',
      accion: 'Cita Agendada + Factura',
      detalle: 'SV-991100 · Otro codigo',
    },
  ];
  assert.equal(
    inferirTipoEnvioCorreoDesdeAuditoria('SV-99110', aud),
    'Recordatorio de cita'
  );
  assert.equal(
    inferirTipoEnvioCorreoDesdeAuditoria('SV-991100', aud),
    'Pre-factura / Confirmación'
  );
  assert.equal(inferirTipoEnvioCorreoDesdeAuditoria('SV-00000', aud), undefined);
});

test('catálogo de procedimientos cubre las 5 áreas con tarifas, variables y opción personalizado = $0', () => {
  const areasProc = obtenerAreasParaTipoAtencion('procedimiento');
  assert.equal(areasProc.length, 5);
  for (const area of areasProc) {
    const lista = obtenerProcedimientosPorArea(area.id);
    assert.ok(lista.length > 0, `Área ${area.id} debe tener procedimientos en catálogo`);
  }
  assert.ok(PROCEDIMIENTOS_CATALOGO.length >= 90);

  // Personalizado siempre retorna 0 para que quede pendiente de asignación N2/N3
  assert.equal(
    obtenerTarifaProcedimientoCatalogo(PROCEDIMIENTO_PERSONALIZADO_ID, { [PROCEDIMIENTO_PERSONALIZADO_ID]: 99999 }),
    0
  );

  // Variable sin tarifa asignada retorna 0; si Nivel 4 asigna tarifa en catálogo, la respeta
  assert.equal(obtenerTarifaProcedimientoCatalogo('proc_neu_compleja'), 0);
  assert.equal(
    obtenerTarifaProcedimientoCatalogo('proc_neu_compleja', { proc_neu_compleja: 850000 }),
    850000
  );

  // Procedimiento estándar con tarifa por defecto y con override de Nivel 4
  assert.equal(obtenerTarifaProcedimientoCatalogo('proc_car_ekg'), 95000);
  assert.equal(
    obtenerTarifaProcedimientoCatalogo('proc_car_ekg', { proc_car_ekg: 120000 }),
    120000
  );
});

test('calcularValorConsulta con procedimientoId y calcularLiquidacionDesdeValorBase aplican reglas SGSSS', () => {
  // Procedimiento estándar ('proc_car_ecocardio' = 260.000) con override (300.000)
  // Beneficiario Rango A -> 11.5% de 300.000 = 34.500
  assert.equal(
    calcularValorConsulta(
      'Contributivo · Beneficiario · Rango A',
      TARIFAS_TEST,
      'cardiologia',
      undefined,
      'procedimiento',
      undefined,
      'proc_car_ecocardio',
      { proc_car_ecocardio: 300000 }
    ),
    34500
  );

  // Asignación manual de Admin N2/N3 de valor base $400.000:
  assert.equal(
    calcularLiquidacionDesdeValorBase('Contributivo · Cotizante · Rango C', 400000, TARIFAS_TEST, 'procedimiento'),
    0
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Contributivo · Beneficiario · Rango A', 400000, TARIFAS_TEST, 'procedimiento'),
    46000
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Contributivo · Beneficiario · Rango B', 400000, TARIFAS_TEST, 'procedimiento'),
    69200
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Contributivo · Beneficiario · Rango C', 400000, TARIFAS_TEST, 'procedimiento'),
    92000
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Subsidiado · Afiliado subsidiado · Rango A', 400000, TARIFAS_TEST, 'procedimiento'),
    0
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Subsidiado · Afiliado subsidiado · Rango B', 400000, TARIFAS_TEST, 'procedimiento'),
    40000
  );
  assert.equal(
    calcularLiquidacionDesdeValorBase('Particular · No aplica · Tarifa plena', 400000, TARIFAS_TEST, 'procedimiento'),
    400000
  );
});

test('mapearCitaDesdeFila, mailer costoPendiente y auditoría de asignación N2/N3 funcionan correctamente', () => {
  const mapped = mapearCitaDesdeFila({
    id: 'CIT-777',
    paciente_cedula: '1045678901',
    paciente_nombre: 'Carlos Mendoza',
    paciente_eps: 'SURA EPS',
    paciente_clasificacion: 'Contributivo · Beneficiario · Rango A',
    especialidad: 'neurocirugia',
    especialidad_nombre: 'Neurocirugía',
    tipo_atencion: 'procedimiento',
    procedimiento_id: 'personalizado',
    procedimiento_nombre: 'Drenaje lumbar programado',
    procedimiento_personalizado: true,
    procedimiento_detalle: 'Orden neurocirugía #44',
    valor_base_procedimiento: 0,
    costo_pendiente: true,
    medico_id: 'm54',
    medico_nombre: 'Dr. Rodrigo Alberto Fajardo',
    medico_codigo: 'MED-NC-637',
    fecha: '2026-12-01',
    hora: '09:00 AM',
    duracion_min: 90,
    valor_copago: 0,
    estado_cita: 'Pre-admitida',
    estado_documentos: 'Pendiente Revisión',
    fecha_creacion: '2026-11-21',
  });

  assert.equal(mapped.procedimientoId, 'personalizado');
  assert.equal(mapped.procedimientoNombre, 'Drenaje lumbar programado');
  assert.equal(mapped.procedimientoPersonalizado, true);
  assert.equal(mapped.procedimientoDetalle, 'Orden neurocirugía #44');
  assert.equal(mapped.valorBaseProcedimiento, 0);
  assert.equal(mapped.costoPendiente, true);

  const correoPend = construirHtmlFacturaORecibo({
    facturaId: 'FE-777',
    citaId: 'CIT-777',
    pacienteNombre: 'Carlos Mendoza',
    pacienteCedula: '1045678901',
    pacienteEps: 'SURA EPS',
    pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
    conceptoPago: 'Copago Beneficiario Rango A',
    especialidad: 'Neurocirugía (1 h 30 min)',
    procedimientoNombre: 'Drenaje lumbar programado',
    procedimientoDetalle: 'Orden neurocirugía #44',
    costoPendiente: true,
    medico: 'Dr. Rodrigo Alberto Fajardo',
    consultorio: 'Cons. 637',
    fechaCita: '2026-12-01',
    horaCita: '09:00 AM',
    valorTexto: '$0 COP',
    metodoPago: 'Por definir en Caja',
    estadoPago: 'PENDIENTE EN CAJA / PRE-ADMITIDA',
    fechaEmision: '2026-11-21 09:00',
  });
  assert.match(correoPend.html, /Drenaje lumbar programado/);
  assert.match(correoPend.html, /Por definir en Autorizaciones \(N2\/N3\)/);

  const audAsignacion: RegistroAuditoria[] = [
    {
      id: 'A-PROC-1',
      fechaHora: '2026-11-21 09:30',
      usuario: 'Coordinador N2',
      rol: 'Nivel 2',
      accion: 'Duración y Costo Asignados + Correo',
      detalle: 'Cita CIT-777 · Valor base $400.000',
    },
  ];
  assert.equal(
    inferirTipoEnvioCorreoDesdeAuditoria('CIT-777', audAsignacion),
    'Costo y duración asignados'
  );
});

test('formatearDuracionVisibleCita oculta duración estimada en procedimientos hasta que la IPS la confirme', () => {
  const procPendiente: CitaMedica = {
    id: 'CIT-P1',
    pacienteCedula: '1045678901',
    pacienteNombre: 'Carlos Mendoza',
    pacienteEps: 'SURA EPS',
    pacienteClasificacion: 'Contributivo · Beneficiario · Rango A',
    especialidad: 'psicologia',
    especialidadNombre: 'Psicología (Procedimiento)',
    tipoAtencion: 'procedimiento',
    medicoId: 'm105',
    medicoNombre: 'Dra. Marcela Quiroz Vega',
    medicoCodigo: 'MED-PS-701',
    fecha: '2026-12-01',
    hora: '09:00 AM',
    duracionMin: 45,
    valorCopago: 12600,
    estadoCita: 'Pre-admitida',
    estadoDocumentos: 'Pendiente Revisión',
    fechaCreacion: '2026-11-21',
  };
  assert.equal(formatearDuracionVisibleCita(procPendiente), 'Duración por definir IPS');

  const procConfirmadoAdmin: CitaMedica = {
    ...procPendiente,
    duracionMin: 90,
    observacionAdmin: 'Duración clínica asignada por Adm/Autorizaciones: 1 h 30 min',
  };
  assert.equal(formatearDuracionVisibleCita(procConfirmadoAdmin), '1 h 30 min');

  const consultaFija: CitaMedica = {
    ...procPendiente,
    id: 'CIT-C1',
    especialidadNombre: 'Psicología',
    tipoAtencion: 'consulta',
  };
  assert.equal(formatearDuracionVisibleCita(consultaFija), '45 min');
});

test('esArchivoPdf detecta PDFs por data URI, extensión URL con query params o MIME type', () => {
  assert.equal(esArchivoPdf('data:application/pdf;base64,JVBERi0xLjQ='), true);
  assert.equal(esArchivoPdf('https://bucket.supabase.co/soportes/orden_123.pdf'), true);
  assert.equal(esArchivoPdf('https://bucket.supabase.co/soportes/autorizacion.PDF?token=abc'), true);
  assert.equal(esArchivoPdf('https://bucket.supabase.co/soportes/soporte.bin', 'application/pdf'), true);
  assert.equal(esArchivoPdf('https://bucket.supabase.co/soportes/orden.jpg'), false);
  assert.equal(esArchivoPdf('data:image/jpeg;base64,/9j/4AAQ='), false);
  assert.equal(esArchivoPdf(undefined, undefined), false);
});

test('obtenerPinDefaultMedico y validarPinMedico validan código médico y PIN institucional 2026', () => {
  assert.equal(obtenerPinDefaultMedico('MED-MG-101'), '0101');
  assert.equal(obtenerPinDefaultMedico('MED-AUX-001'), '0001');
  assert.equal(obtenerPinDefaultMedico('MED-NC-637'), '0637');
  assert.equal(obtenerPinDefaultMedico('SIN-DIGITOS'), '2026');

  const medicoDemo: MedicoBase = {
    id: 'm1',
    codigo: 'MED-MG-101',
    nombre: 'Dr. Andrés Felipe Vargas',
    especialidad: 'medicina_general',
    consultorio: 'Cons. 101',
  };
  assert.equal(validarPinMedico(medicoDemo, '0101'), true);
  assert.equal(validarPinMedico(medicoDemo, ' 2026 '), true);
  assert.equal(validarPinMedico(medicoDemo, '1234'), false);
  assert.equal(validarPinMedico(medicoDemo, '010'), false);
  assert.equal(validarPinMedico(medicoDemo, 'abcd'), false);

  assert.equal(obtenerPinEfectivoMedico(medicoDemo), '0101');
  const medicoConPin: MedicoBase = { ...medicoDemo, pin: '7429' };
  assert.equal(obtenerPinEfectivoMedico(medicoConPin), '7429');
  assert.equal(validarPinMedico(medicoConPin, '7429'), true);
  assert.equal(validarPinMedico(medicoConPin, '0101'), false);
  assert.equal(validarPinMedico(medicoConPin, '2026'), false);
});

test('mapearCitaDesdeFila mapea motivo_consulta y auditoría infiere Recordatorio Automático 24h y Nota Clínica Médico', () => {
  const fila = mapearCitaDesdeFila({
    id: 'CIT-MOT-1',
    paciente_cedula: '1020304050',
    paciente_nombre: 'Lucía Fernández',
    paciente_eps: 'Nueva EPS',
    paciente_clasificacion: 'Contributivo · Cotizante · Rango A',
    especialidad: 'medicina_general',
    especialidad_nombre: 'Medicina General',
    medico_id: 'm1',
    medico_nombre: 'Dr. Andrés Felipe Vargas',
    medico_codigo: 'MED-MG-101',
    fecha: '2026-12-05',
    hora: '08:00 AM',
    duracion_min: 20,
    valor_copago: 4700,
    estado_cita: 'Pre-admitida',
    estado_documentos: 'No Requeridos',
    fecha_creacion: '2026-11-21',
    motivo_consulta: 'Dolor lumbar persistente desde hace 4 días',
  });
  assert.equal(fila.motivoConsulta, 'Dolor lumbar persistente desde hace 4 días');

  const aud: RegistroAuditoria[] = [
    {
      id: 'AUD-R24',
      fechaHora: '2026-11-21 08:00',
      usuario: 'Sistema IPS',
      rol: 'Nivel 2',
      accion: 'Recordatorio Automático 24h',
      detalle: 'Cita CIT-MOT-1 · Recordatorio enviado',
    },
    {
      id: 'AUD-MED',
      fechaHora: '2026-11-21 09:00',
      usuario: 'Dr. Andrés Felipe Vargas',
      rol: 'Médico',
      accion: 'Nota Clínica Médico',
      detalle: 'Cita CIT-MOT-2 · Se indica reposo relativo',
    },
  ];
  assert.equal(
    inferirTipoEnvioCorreoDesdeAuditoria('CIT-MOT-1', aud),
    'Recordatorio automático 24h'
  );
  assert.equal(
    inferirTipoEnvioCorreoDesdeAuditoria('CIT-MOT-2', aud),
    'Nota clínica médica'
  );
});

test('construirHtmlReporteExcel incluye motivo, soportes, observación con reprogramación, duración por definir IPS y KPIs', () => {
  const citasPrueba: CitaMedica[] = [
    {
      id: 'CIT-EX-1',
      pacienteCedula: '1045678901',
      pacienteNombre: 'María López',
      pacienteEps: 'Sura EPS',
      pacienteClasificacion: 'Subsidiado · Afiliado subsidiado · Rango A',
      especialidad: 'psicologia',
      especialidadNombre: 'Psicología (Procedimiento)',
      tipoAtencion: 'procedimiento',
      procedimientoNombre: 'Psicoterapia individual ambulatoria (sesión)',
      medicoId: 'm_psi_1',
      medicoNombre: 'Dra. Laura Gómez',
      medicoCodigo: 'MED-PSI-301',
      fecha: '2026-12-10',
      hora: '09:00 AM',
      duracionMin: 45,
      valorCopago: 0,
      estadoCita: 'Reprogramada',
      estadoDocumentos: 'Observados',
      fotoOrdenUrl: 'https://bucket.supabase.co/orden.pdf',
      fotoOrdenNombre: 'orden.pdf',
      fotoAutorizacionUrl: 'https://bucket.supabase.co/aut.jpg',
      fotoAutorizacionNombre: 'aut.jpg',
      observacionAdmin: '[REQ_DOC:autorizacion] Subir autorización vigente.',
      motivoConsulta: 'Ansiedad e insomnio hace 2 semanas',
      reprogramacionesCount: 1,
      fechaAnterior: '2026-12-08',
      motivoReprogramacion: 'Imprevisto laboral',
      correosEnviadosCount: 2,
      fechaCreacion: '2026-11-21',
    },
    {
      id: 'CIT-EX-2',
      pacienteCedula: '1098765432',
      pacienteNombre: 'Carlos Pérez',
      pacienteEps: 'Sanitas EPS',
      pacienteClasificacion: 'Contributivo · Cotizante · Rango B',
      especialidad: 'medicina_general',
      especialidadNombre: 'Medicina General',
      tipoAtencion: 'consulta',
      medicoId: 'm1',
      medicoNombre: 'Dr. Andrés Vargas',
      medicoCodigo: 'MED-MG-101',
      fecha: '2026-11-21',
      hora: '10:00 AM',
      duracionMin: 20,
      valorCopago: 18500,
      metodoPago: 'Transferencia',
      reciboNumero: 'REC-TRF-123456',
      estadoCita: 'Atendida',
      estadoDocumentos: 'Aprobados',
      calificacionEspera: 5,
      calificacionTrato: 5,
      calificacionClaridad: 5,
      calificacionSatisfaccion: 5,
      comentarioSatisfaccion: 'Excelente atención médica',
      fechaCreacion: '2026-11-20',
    },
  ];

  const htmlMasked = construirHtmlReporteExcel({
    citas: citasPrueba,
    verCedulaCompleta: false,
    fechaGeneracion: '2026-11-21 10:00',
    obtenerConsultorio: () => 'Cons. 201',
  });

  assert.equal(htmlMasked.includes('Por definir IPS'), true);
  assert.equal(htmlMasked.includes('Ansiedad e insomnio hace 2 semanas'), true);
  assert.equal(
    htmlMasked.includes('Orden (PDF) + Autorización (Imagen) · Solicitado: Autorización EPS'),
    true
  );
  assert.equal(htmlMasked.includes('Subir autorización vigente.'), true);
  assert.equal(htmlMasked.includes('1x · Ant: 2026-12-08 · Imprevisto laboral'), true);
  assert.equal(htmlMasked.includes('Excelente atención médica'), true);
  assert.equal(htmlMasked.includes('MED-PSI-301'), true);
  assert.equal(htmlMasked.includes('Exento ($0)'), true);
  assert.equal(htmlMasked.includes("mso-number-format:'#,##0'"), true);
  assert.equal(htmlMasked.includes('\\#\\,'), false);
  assert.equal(htmlMasked.includes('1045678901'), false);
  assert.equal(htmlMasked.includes('RESUMEN OPERATIVO POR ESTADO DE CITA'), true);

  const htmlFull = construirHtmlReporteExcel({
    citas: citasPrueba,
    verCedulaCompleta: true,
    fechaGeneracion: '2026-11-21 10:00',
    obtenerConsultorio: () => 'Cons. 201',
  });
  assert.equal(htmlFull.includes('1045678901'), true);
});




