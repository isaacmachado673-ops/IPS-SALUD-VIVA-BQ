export type AreaServicioId =
  | 'general'
  | 'especializada'
  | 'salud_mental'
  | 'materno_perinatal'
  | 'apoyo_terapeutico'
  | 'apoyo_diagnostico';

export type EspecialidadId = string;

export interface EspecialidadInfo {
  id: EspecialidadId;
  areaId: AreaServicioId;
  nombre: string;
  duracionMin: number;
  tarifaParticular: number;
}

export interface MedicoBase {
  id: string;
  codigo: string;
  nombre: string;
  especialidad: EspecialidadId;
  consultorio: string;
  pin?: string;
  telefono?: string;
  correo?: string;
}

export interface MedicoConOcupacion extends MedicoBase {
  citasHoy: number;
  atendidasHoy: number;
  enEsperaOSalaHoy: number;
  noAsistioHoy: number;
  reprogramadasHoy: number;
  canceladasHoy: number;
  capacidadMaxima: number;
  cuposDisponiblesHoy: number;
}

export type RegimenTipo =
  | 'Contributivo'
  | 'Subsidiado'
  | 'Población no asegurada'
  | 'Particular';

export type TipoAfiliacionTipo =
  | 'Cotizante'
  | 'Beneficiario'
  | 'Afiliado subsidiado'
  | 'No aplica';

export type RangoAfiliacionTipo = 'Rango A' | 'Rango B' | 'Rango C' | 'No aplica';

export interface Paciente {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  eps: string;
  clasificacion: string;
  estadoAfiliacion: 'Activo' | 'Sin EPS / En trámite';
  pin: string;
  aceptoHabeasData?: boolean;
  fechaHabeasData?: string;
  esNuevo?: boolean;
}

export type NivelAdmin = 1 | 2 | 3 | 4;

export interface UsuarioAdministrativo {
  cedula: string;
  nombre: string;
  titulo: string;
  nivel: NivelAdmin;
  pin: string;
  descripcion: string;
  protegido?: boolean;
}

export type EstadoCitaTipo =
  | 'Pre-admitida'
  | 'Admitida en Sala'
  | 'Atendida'
  | 'Reprogramada'
  | 'Cancelada'
  | 'No asistió';

export type MetodoPagoTipo =
  | 'Efectivo'
  | 'Datáfono'
  | 'Transferencia'
  | 'Exento ($0)';

export type TipoAtencionTipo = 'consulta' | 'procedimiento';

export interface CitaMedica {
  id: string;
  pacienteCedula: string;
  pacienteNombre: string;
  pacienteEps: string;
  pacienteClasificacion: string;
  especialidad: EspecialidadId;
  especialidadNombre: string;
  tipoAtencion?: TipoAtencionTipo;
  procedimientoId?: string;
  procedimientoNombre?: string;
  procedimientoPersonalizado?: boolean;
  procedimientoDetalle?: string;
  valorBaseProcedimiento?: number;
  costoPendiente?: boolean;
  apartadoHastaMs?: number;
  medicoId: string;
  medicoNombre: string;
  medicoCodigo: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  valorCopago: number;
  metodoPago?: MetodoPagoTipo;
  reciboNumero?: string;
  estadoCita: EstadoCitaTipo;
  estadoDocumentos: 'Pendiente Revisión' | 'Aprobados' | 'Observados';
  fotoOrdenUrl?: string;
  fotoOrdenNombre?: string;
  fotoAutorizacionUrl?: string;
  fotoAutorizacionNombre?: string;
  observacionAdmin?: string;
  motivoConsulta?: string;
  calificacionSatisfaccion?: number;
  calificacionEspera?: number;
  calificacionTrato?: number;
  calificacionClaridad?: number;
  comentarioSatisfaccion?: string;
  medicoAnteriorId?: string;
  fechaAnterior?: string;
  motivoReprogramacion?: string;
  reprogramacionesCount?: number;
  fechaCreacion: string;
  createdAtMs?: number;
  correosEnviadosCount?: number;
  ultimoCorreoEnviadoMs?: number;
}

export interface CorreosMetaCita {
  count: number;
  lastMs: number;
  lastTipo?: string;
  cooldownStartMs?: number;
}

export interface TarifasConfig {
  A: number;
  B: number;
  C: number;
  particular: number;
  particularProcedimiento?: number;
}

export type DiaSemanaNum = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AuxiliarTurnoConfig {
  activo: boolean;
  nombre: string;
  codigo: string;
  consultorio: string;
}

export interface RowRecord {
  [key: string]: unknown;
}

export interface RegistroAuditoria {
  id: string;
  fechaHora: string;
  usuario: string;
  rol: string;
  accion: string;
  detalle: string;
}

export interface ConfirmacionModalData {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  peligroso?: boolean;
  onConfirmar: () => Promise<void> | void;
}

export type PasoChat =
  | 'seleccion_area'
  | 'seleccion_medico'
  | 'seleccion_fecha'
  | 'seleccion_hora'
  | 'solicitud_fotos'
  | 'completado';

export interface OpcionChat {
  etiqueta: string;
  valor: string;
  subtexto?: string;
  deshabilitado?: boolean;
}

export interface MensajeChat {
  id: string;
  emisor: 'bot' | 'usuario';
  texto: string;
  hora: string;
  opciones?: OpcionChat[];
}

export interface ArchivoFotoTemp {
  url: string;
  blob?: Blob;
  nombre: string;
  mimeType?: string;
}

export const DIAS_SEMANA_OPCIONES: { valor: DiaSemanaNum; nombre: string }[] = [
  { valor: -1, nombre: 'Sin descanso fijo' },
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 0, nombre: 'Domingo' },
];

export const AUXILIAR_TURNO_DEFAULT: AuxiliarTurnoConfig = {
  activo: true,
  nombre: 'Dr(a). Auxiliar Médico de Turno',
  codigo: 'MED-AUX-001',
  consultorio: 'Cons. Auxiliar 01',
};

export const AREAS_SERVICIO: { id: AreaServicioId; nombre: string }[] = (
  [
    ['general', '1. Consulta Médica General'],
    ['especializada', '2. Consulta Médica Especializada'],
    ['salud_mental', '3. Salud Mental'],
    ['materno_perinatal', '4. Salud Materno-Perinatal'],
    ['apoyo_terapeutico', '5. Apoyo Terapéutico'],
    ['apoyo_diagnostico', '6. Apoyo Diagnóstico y Preventivo'],
  ] as [AreaServicioId, string][]
).map(([id, nombre]) => ({ id, nombre }));

// 51 Especialidades ambulatorias disponibles en EPS de Barranquilla (excluye Medicina Familiar y Ruta PyM)
export const ESPECIALIDADES: EspecialidadInfo[] = (
  [
    // 1. Consulta Médica General (1 especialidad - 5 médicos)
    ['medicina_general', 'general', 'Medicina General', 20, 50000],

    // 2. Consulta Médica Especializada (32 especialidades - 3 médicos c/u)
    ['pediatria', 'especializada', 'Pediatría', 30, 110000],
    ['medicina_interna', 'especializada', 'Medicina Interna', 30, 120000],
    ['dermatologia', 'especializada', 'Dermatología', 30, 130000],
    ['oftalmologia', 'especializada', 'Oftalmología', 30, 135000],
    ['otorrinolaringologia', 'especializada', 'Otorrinolaringología', 30, 135000],
    ['ortopedia', 'especializada', 'Ortopedia y Traumatología', 30, 140000],
    ['urologia', 'especializada', 'Urología', 30, 140000],
    ['alergologia', 'especializada', 'Alergología e Inmunología', 30, 145000],
    ['coloproctologia', 'especializada', 'Coloproctología', 30, 150000],
    ['mastologia', 'especializada', 'Mastología', 30, 150000],
    ['fisiatria', 'especializada', 'Medicina Física y Rehabilitación (Fisiatría)', 30, 130000],
    ['anestesiologia_pre', 'especializada', 'Anestesiología (Valoración Preanestésica)', 30, 125000],
    ['cirugia_maxilofacial', 'especializada', 'Cirugía Oral y Maxilofacial', 30, 150000],
    ['cardiologia', 'especializada', 'Cardiología', 45, 160000],
    ['neurologia', 'especializada', 'Neurología', 45, 165000],
    ['neurocirugia', 'especializada', 'Neurocirugía', 45, 200000],
    ['gastroenterologia', 'especializada', 'Gastroenterología', 45, 155000],
    ['endocrinologia', 'especializada', 'Endocrinología', 45, 155000],
    ['reumatologia', 'especializada', 'Reumatología', 45, 160000],
    ['neumologia', 'especializada', 'Neumología', 45, 155000],
    ['nefrologia', 'especializada', 'Nefrología', 45, 160000],
    ['infectologia', 'especializada', 'Infectología', 45, 165000],
    ['hematologia', 'especializada', 'Hematología', 45, 175000],
    ['geriatria', 'especializada', 'Geriatría', 45, 140000],
    ['dolor_paliativos', 'especializada', 'Medicina del Dolor y Cuidados Paliativos', 45, 160000],
    ['genetica_medica', 'especializada', 'Genética Médica', 45, 190000],
    ['oncologia', 'especializada', 'Oncología', 45, 220000],
    ['cirugia_general', 'especializada', 'Cirugía General', 45, 170000],
    ['cirugia_vascular', 'especializada', 'Cirugía Vascular', 45, 180000],
    ['cirugia_plastica', 'especializada', 'Cirugía Plástica', 45, 190000],
    ['cirugia_pediatrica', 'especializada', 'Cirugía Pediátrica', 45, 185000],
    ['cirugia_torax', 'especializada', 'Cirugía de Tórax', 45, 195000],

    // 3. Salud Mental (4 especialidades - 3 médicos c/u)
    ['psicologia', 'salud_mental', 'Psicología', 45, 80000],
    ['psiquiatria', 'salud_mental', 'Psiquiatría', 45, 160000],
    ['psiquiatria_infantil', 'salud_mental', 'Psiquiatría Infantil y de la Adolescencia', 45, 170000],
    ['neuropsicologia', 'salud_mental', 'Neuropsicología', 45, 130000],

    // 4. Salud Materno-Perinatal (3 especialidades - 3 médicos c/u)
    ['ginecologia', 'materno_perinatal', 'Ginecología y Obstetricia', 30, 120000],
    ['perinatologia', 'materno_perinatal', 'Medicina Materno-Fetal (Perinatología)', 45, 175000],
    ['control_prenatal', 'materno_perinatal', 'Control Prenatal y Ruta Materno-Perinatal', 30, 75000],

    // 5. Apoyo Terapéutico (5 especialidades - 3 médicos c/u)
    ['fisioterapia', 'apoyo_terapeutico', 'Fisioterapia', 30, 65000],
    ['fonoaudiologia', 'apoyo_terapeutico', 'Fonoaudiología', 30, 65000],
    ['terapia_ocupacional', 'apoyo_terapeutico', 'Terapia Ocupacional', 30, 65000],
    ['nutricion_dietetica', 'apoyo_terapeutico', 'Nutrición y Dietética', 30, 75000],
    ['terapia_respiratoria', 'apoyo_terapeutico', 'Terapia Respiratoria', 30, 70000],

    // 6. Apoyo Diagnóstico y Preventivo (6 especialidades - 3 médicos c/u)
    ['optometria', 'apoyo_diagnostico', 'Optometría', 20, 55000],
    ['odontologia', 'apoyo_diagnostico', 'Odontología', 30, 60000],
    ['audiologia', 'apoyo_diagnostico', 'Audiología', 30, 85000],
    ['ecografia_diagnostica', 'apoyo_diagnostico', 'Ecografía Diagnóstica e Imágenes', 30, 110000],
    ['toma_muestras_lab', 'apoyo_diagnostico', 'Toma de Muestras / Laboratorio Clínico', 20, 45000],
    ['vacunacion_pai', 'apoyo_diagnostico', 'Vacunación (PAI y Complementaria)', 20, 40000],
  ] as [string, AreaServicioId, string, number, number][]
).map(([id, areaId, nombre, duracionMin, tarifaParticular]) => ({
  id,
  areaId,
  nombre,
  duracionMin,
  tarifaParticular,
}));

// Catálogo base: 5 en Medicina General + 3 en cada una de las otras 50 especialidades = 155 profesionales
const MEDICOS_TUPLAS: [string, string, string, string, string][] = [
  // Medicina General (5)
  ['m1', 'MED-MG-101', 'Dr. Andrés Felipe Vargas', 'medicina_general', 'Cons. 101'],
  ['m2', 'MED-MG-102', 'Dra. Camila Andrea Ríos', 'medicina_general', 'Cons. 102'],
  ['m3', 'MED-MG-103', 'Dr. Sebastián Morales Gil', 'medicina_general', 'Cons. 103'],
  ['m4', 'MED-MG-104', 'Dra. Valentina Pardo Soto', 'medicina_general', 'Cons. 104'],
  ['m5', 'MED-MG-105', 'Dr. Juan David Quintero', 'medicina_general', 'Cons. 105'],

  // Pediatría (3)
  ['m6', 'MED-PE-201', 'Dra. Laura Cristina Salazar', 'pediatria', 'Cons. 201'],
  ['m7', 'MED-PE-202', 'Dr. Nicolás Eduardo Peña', 'pediatria', 'Cons. 202'],
  ['m8', 'MED-PE-203', 'Dra. Mariana Beltrán Cruz', 'pediatria', 'Cons. 203'],

  // Medicina Interna (3)
  ['m9', 'MED-MI-301', 'Dr. Javier Hernando Castro', 'medicina_interna', 'Cons. 301'],
  ['m10', 'MED-MI-302', 'Dra. Claudia Patricia Mejía', 'medicina_interna', 'Cons. 302'],
  ['m11', 'MED-MI-303', 'Dr. Ricardo Alonso Duarte', 'medicina_interna', 'Cons. 303'],

  // Ginecología y Obstetricia (3)
  ['m12', 'MED-GO-401', 'Dra. Natalia Gómez Restrepo', 'ginecologia', 'Cons. 401'],
  ['m13', 'MED-GO-402', 'Dr. Alejandro Torres Cárdenas', 'ginecologia', 'Cons. 402'],
  ['m14', 'MED-GO-403', 'Dra. Carolina Ospina Vélez', 'ginecologia', 'Cons. 403'],

  // Cardiología (3)
  ['m15', 'MED-CA-501', 'Dra. Sofía Elena Mendoza', 'cardiologia', 'Cons. 501'],
  ['m16', 'MED-CA-502', 'Dr. Carlos Alberto Bermúdez', 'cardiologia', 'Cons. 502'],
  ['m17', 'MED-CA-503', 'Dra. Andrea Carolina Pineda', 'cardiologia', 'Cons. 503'],

  // Dermatología (3)
  ['m18', 'MED-DE-601', 'Dra. Valeria Sánchez Polo', 'dermatologia', 'Cons. 601'],
  ['m19', 'MED-DE-602', 'Dr. Mateo Navarro Díaz', 'dermatologia', 'Cons. 602'],
  ['m20', 'MED-DE-603', 'Dra. Juliana Ortiz Visbal', 'dermatologia', 'Cons. 603'],

  // Oftalmología (3)
  ['m21', 'MED-OF-604', 'Dr. Esteban Rueda Acosta', 'oftalmologia', 'Cons. 604'],
  ['m22', 'MED-OF-605', 'Dra. Lucía Fernanda Barrios', 'oftalmologia', 'Cons. 605'],
  ['m23', 'MED-OF-606', 'Dr. Álvaro José Cepeda', 'oftalmologia', 'Cons. 606'],

  // Otorrinolaringología (3)
  ['m24', 'MED-OT-607', 'Dr. Iván Darío Molina', 'otorrinolaringologia', 'Cons. 607'],
  ['m25', 'MED-OT-608', 'Dra. Gabriela León Arias', 'otorrinolaringologia', 'Cons. 608'],
  ['m26', 'MED-OT-609', 'Dr. Sergio Luis Maestre', 'otorrinolaringologia', 'Cons. 609'],

  // Ortopedia y Traumatología (3)
  ['m27', 'MED-OR-610', 'Dr. Diego Alejandro Hoyos', 'ortopedia', 'Cons. 610'],
  ['m28', 'MED-OR-611', 'Dr. Camilo Andrés Zapata', 'ortopedia', 'Cons. 611'],
  ['m29', 'MED-OR-612', 'Dra. Lorena Patricia Cure', 'ortopedia', 'Cons. 612'],

  // Urología (3)
  ['m30', 'MED-UR-613', 'Dr. Óscar Eduardo Benítez', 'urologia', 'Cons. 613'],
  ['m31', 'MED-UR-614', 'Dr. Mauricio De La Hoz', 'urologia', 'Cons. 614'],
  ['m32', 'MED-UR-615', 'Dra. Carolina Flórez Pertuz', 'urologia', 'Cons. 615'],

  // Alergología e Inmunología (3)
  ['m33', 'MED-AL-616', 'Dra. Mónica Judith Tarud', 'alergologia', 'Cons. 616'],
  ['m34', 'MED-AL-617', 'Dr. Felipe Ignacio Donado', 'alergologia', 'Cons. 617'],
  ['m35', 'MED-AL-618', 'Dra. Luisa Fernanda Char', 'alergologia', 'Cons. 618'],

  // Coloproctología (3)
  ['m36', 'MED-CL-619', 'Dr. Alberto Mario Arteta', 'coloproctologia', 'Cons. 619'],
  ['m37', 'MED-CL-620', 'Dra. Ana María Abuchaibe', 'coloproctologia', 'Cons. 620'],
  ['m38', 'MED-CL-621', 'Dr. Jorge Enrique Ucrós', 'coloproctologia', 'Cons. 621'],

  // Mastología (3)
  ['m39', 'MED-MA-622', 'Dra. Patricia Elena Gerlein', 'mastologia', 'Cons. 622'],
  ['m40', 'MED-MA-623', 'Dr. Hernando José Lafaurie', 'mastologia', 'Cons. 623'],
  ['m41', 'MED-MA-624', 'Dra. Marcela Sofía Vengoechea', 'mastologia', 'Cons. 624'],

  // Fisiatría (3)
  ['m42', 'MED-FR-625', 'Dr. Carlos Enrique Manzur', 'fisiatria', 'Cons. 625'],
  ['m43', 'MED-FR-626', 'Dra. Diana Carolina Pugliese', 'fisiatria', 'Cons. 626'],
  ['m44', 'MED-FR-627', 'Dr. Víctor Hugo Carbonell', 'fisiatria', 'Cons. 627'],

  // Anestesiología Preanestésica (3)
  ['m45', 'MED-AN-628', 'Dr. Ramiro José Noguera', 'anestesiologia_pre', 'Cons. 628'],
  ['m46', 'MED-AN-629', 'Dra. Silvana Beatriz Dangond', 'anestesiologia_pre', 'Cons. 629'],
  ['m47', 'MED-AN-630', 'Dr. Pablo Emilio Visbal', 'anestesiologia_pre', 'Cons. 630'],

  // Cirugía Oral y Maxilofacial (3)
  ['m48', 'MED-CM-631', 'Dr. Jaime Alberto Roncallo', 'cirugia_maxilofacial', 'Cons. 631'],
  ['m49', 'MED-CM-632', 'Dra. Paola Andrea Puccini', 'cirugia_maxilofacial', 'Cons. 632'],
  ['m50', 'MED-CM-633', 'Dr. Gustavo Adolfo Bula', 'cirugia_maxilofacial', 'Cons. 633'],

  // Neurología (3)
  ['m51', 'MED-NE-634', 'Dra. Adriana Lucía Cardona', 'neurologia', 'Cons. 634'],
  ['m52', 'MED-NE-635', 'Dr. César Augusto Henao', 'neurologia', 'Cons. 635'],
  ['m53', 'MED-NE-636', 'Dra. Verónica María Lacouture', 'neurologia', 'Cons. 636'],

  // Neurocirugía (3)
  ['m54', 'MED-NC-637', 'Dr. Rodrigo Alberto Fajardo', 'neurocirugia', 'Cons. 637'],
  ['m55', 'MED-NC-638', 'Dr. Eduardo Enrique Salcedo', 'neurocirugia', 'Cons. 638'],
  ['m56', 'MED-NC-639', 'Dra. Camila María Pretelt', 'neurocirugia', 'Cons. 639'],

  // Gastroenterología (3)
  ['m57', 'MED-GA-640', 'Dra. Paola Andrea Escorcia', 'gastroenterologia', 'Cons. 640'],
  ['m58', 'MED-GA-641', 'Dr. Luis Miguel Abello', 'gastroenterologia', 'Cons. 641'],
  ['m59', 'MED-GA-642', 'Dra. Claudia Marcela Pumarejo', 'gastroenterologia', 'Cons. 642'],

  // Endocrinología (3)
  ['m60', 'MED-EN-643', 'Dra. Tatiana Isabel Galvis', 'endocrinologia', 'Cons. 643'],
  ['m61', 'MED-EN-644', 'Dr. Andrés Mauricio Slebi', 'endocrinologia', 'Cons. 644'],
  ['m62', 'MED-EN-645', 'Dra. María José Charris', 'endocrinologia', 'Cons. 645'],

  // Reumatología (3)
  ['m63', 'MED-RE-646', 'Dr. Luis Fernando Arango', 'reumatologia', 'Cons. 646'],
  ['m64', 'MED-RE-647', 'Dra. Vanessa Milena Roca', 'reumatologia', 'Cons. 647'],
  ['m65', 'MED-RE-648', 'Dr. Álvaro Javier Llanos', 'reumatologia', 'Cons. 648'],

  // Neumología (3)
  ['m66', 'MED-NM-649', 'Dr. Eduardo José Cabrales', 'neumologia', 'Cons. 649'],
  ['m67', 'MED-NM-650', 'Dra. Natalia Sofía Alzamora', 'neumologia', 'Cons. 650'],
  ['m68', 'MED-NM-651', 'Dr. Juan Carlos Berdugo', 'neumologia', 'Cons. 651'],

  // Nefrología (3)
  ['m69', 'MED-NF-652', 'Dra. Sandra Milena Ochoa', 'nefrologia', 'Cons. 652'],
  ['m70', 'MED-NF-653', 'Dr. Roberto Carlos Rosales', 'nefrologia', 'Cons. 653'],
  ['m71', 'MED-NF-654', 'Dra. Laura Alejandra Iguarán', 'nefrologia', 'Cons. 654'],

  // Infectología (3)
  ['m72', 'MED-IN-655', 'Dr. Héctor Julio Mendoza', 'infectologia', 'Cons. 655'],
  ['m73', 'MED-IN-656', 'Dra. Karen Tatiana Villazón', 'infectologia', 'Cons. 656'],
  ['m74', 'MED-IN-657', 'Dr. Iván René Daza', 'infectologia', 'Cons. 657'],

  // Hematología (3)
  ['m75', 'MED-HM-658', 'Dra. Ángela María Gutiérrez', 'hematologia', 'Cons. 658'],
  ['m76', 'MED-HM-659', 'Dr. Gabriel Antonio Martínez', 'hematologia', 'Cons. 659'],
  ['m77', 'MED-HM-660', 'Dra. Sofía Margarita Celedón', 'hematologia', 'Cons. 660'],

  // Geriatría (3)
  ['m78', 'MED-GE-661', 'Dr. Ernesto Rafael De Castro', 'geriatria', 'Cons. 661'],
  ['m79', 'MED-GE-662', 'Dra. Martha Lucía Ariza', 'geriatria', 'Cons. 662'],
  ['m80', 'MED-GE-663', 'Dr. Francisco Javier Otero', 'geriatria', 'Cons. 663'],

  // Medicina del Dolor y Cuidados Paliativos (3)
  ['m81', 'MED-DP-664', 'Dra. Catalina Inés Zúñiga', 'dolor_paliativos', 'Cons. 664'],
  ['m82', 'MED-DP-665', 'Dr. Rafael Eduardo Amaya', 'dolor_paliativos', 'Cons. 665'],
  ['m83', 'MED-DP-666', 'Dra. María Angélica Barros', 'dolor_paliativos', 'Cons. 666'],

  // Genética Médica (3)
  ['m84', 'MED-GN-667', 'Dr. Daniel Alfonso Silvera', 'genetica_medica', 'Cons. 667'],
  ['m85', 'MED-GN-668', 'Dra. Melissa Andrea Baute', 'genetica_medica', 'Cons. 668'],
  ['m86', 'MED-GN-669', 'Dr. José Luis Marchena', 'genetica_medica', 'Cons. 669'],

  // Oncología (3)
  ['m87', 'MED-ON-670', 'Dra. Beatriz Elena Posada', 'oncologia', 'Cons. 670'],
  ['m88', 'MED-ON-671', 'Dr. Miguel Ángel Cárdenas', 'oncologia', 'Cons. 671'],
  ['m89', 'MED-ON-672', 'Dra. Valerie Cristina Gómez', 'oncologia', 'Cons. 672'],

  // Cirugía General (3)
  ['m90', 'MED-CG-673', 'Dr. Rafael Antonio Dávila', 'cirugia_general', 'Cons. 673'],
  ['m91', 'MED-CG-674', 'Dra. Stephany Paola Yepes', 'cirugia_general', 'Cons. 674'],
  ['m92', 'MED-CG-675', 'Dr. Orlando Enrique Cantillo', 'cirugia_general', 'Cons. 675'],

  // Cirugía Vascular (3)
  ['m93', 'MED-CV-676', 'Dr. Guillermo León Caicedo', 'cirugia_vascular', 'Cons. 676'],
  ['m94', 'MED-CV-677', 'Dra. Natalia Andrea Movilla', 'cirugia_vascular', 'Cons. 677'],
  ['m95', 'MED-CV-678', 'Dr. Sergio Andrés Fontalvo', 'cirugia_vascular', 'Cons. 678'],

  // Cirugía Plástica (3)
  ['m96', 'MED-CP-679', 'Dra. Isabella Vergara Solís', 'cirugia_plastica', 'Cons. 679'],
  ['m97', 'MED-CP-680', 'Dr. Juan Sebastián Abisambra', 'cirugia_plastica', 'Cons. 680'],
  ['m98', 'MED-CP-681', 'Dra. Daniela Sofía Herrera', 'cirugia_plastica', 'Cons. 681'],

  // Cirugía Pediátrica (3)
  ['m99', 'MED-CI-682', 'Dr. Leonardo Fabio Chamorro', 'cirugia_pediatrica', 'Cons. 682'],
  ['m100', 'MED-CI-683', 'Dra. Laura Vanessa Sarmiento', 'cirugia_pediatrica', 'Cons. 683'],
  ['m101', 'MED-CI-684', 'Dr. Diego Armando Márquez', 'cirugia_pediatrica', 'Cons. 684'],

  // Cirugía de Tórax (3)
  ['m102', 'MED-CT-685', 'Dr. Alfredo José Gutiérrez', 'cirugia_torax', 'Cons. 685'],
  ['m103', 'MED-CT-686', 'Dra. Adriana Sofía Escalante', 'cirugia_torax', 'Cons. 686'],
  ['m104', 'MED-CT-687', 'Dr. Martín Elías Molina', 'cirugia_torax', 'Cons. 687'],

  // Psicología (3)
  ['m105', 'MED-PS-701', 'Dra. Marcela Quiroz Vega', 'psicologia', 'Cons. 701'],
  ['m106', 'MED-PS-702', 'Dr. Julián David Franco', 'psicologia', 'Cons. 702'],
  ['m107', 'MED-PS-703', 'Dra. Wendy Paola Polo', 'psicologia', 'Cons. 703'],

  // Psiquiatría (3)
  ['m108', 'MED-PQ-704', 'Dr. Fernando José Restrepo', 'psiquiatria', 'Cons. 704'],
  ['m109', 'MED-PQ-705', 'Dra. Claudia Liliana Bolívar', 'psiquiatria', 'Cons. 705'],
  ['m110', 'MED-PQ-706', 'Dr. Mauricio Andrés Rúa', 'psiquiatria', 'Cons. 706'],

  // Psiquiatría Infantil y Adolescencia (3)
  ['m111', 'MED-PI-707', 'Dra. Paola Cristina Mendoza', 'psiquiatria_infantil', 'Cons. 707'],
  ['m112', 'MED-PI-708', 'Dr. Camilo José Buitrago', 'psiquiatria_infantil', 'Cons. 708'],
  ['m113', 'MED-PI-709', 'Dra. Andrea Carolina Niebles', 'psiquiatria_infantil', 'Cons. 709'],

  // Neuropsicología (3)
  ['m114', 'MED-NP-710', 'Dra. Sofía Elena Villalba', 'neuropsicologia', 'Cons. 710'],
  ['m115', 'MED-NP-711', 'Dr. Kevin Andrés Cervantes', 'neuropsicologia', 'Cons. 711'],
  ['m116', 'MED-NP-712', 'Dra. María Camila Morales', 'neuropsicologia', 'Cons. 712'],

  // Medicina Materno-Fetal / Perinatología (3)
  ['m117', 'MED-MF-404', 'Dra. Gina Marcela Navarro', 'perinatologia', 'Cons. 404'],
  ['m118', 'MED-MF-405', 'Dr. Jorge Armando Orozco', 'perinatologia', 'Cons. 405'],
  ['m119', 'MED-MF-406', 'Dra. Liliana Patricia Solano', 'perinatologia', 'Cons. 406'],

  // Control Prenatal y Ruta Materno-Perinatal (3)
  ['m120', 'MED-PR-407', 'Enf. Kelly Johana Redondo', 'control_prenatal', 'Cons. 407'],
  ['m121', 'MED-PR-408', 'Enf. Yuranis Paola Julio', 'control_prenatal', 'Cons. 408'],
  ['m122', 'MED-PR-409', 'Enf. Luisa María Flórez', 'control_prenatal', 'Cons. 409'],

  // Fisioterapia (3)
  ['m123', 'MED-FI-801', 'Ft. Diana Marcela Cifuentes', 'fisioterapia', 'Sala Fisio 1'],
  ['m124', 'MED-FI-802', 'Ft. Andrés Felipe Márquez', 'fisioterapia', 'Sala Fisio 2'],
  ['m125', 'MED-FI-803', 'Ft. Valeria Sofía De Alba', 'fisioterapia', 'Sala Fisio 3'],

  // Fonoaudiología (3)
  ['m126', 'MED-FO-804', 'Flga. Ángela Patricia Luna', 'fonoaudiologia', 'Sala Terapia 1'],
  ['m127', 'MED-FO-805', 'Flga. Cindy Lorena Escorcia', 'fonoaudiologia', 'Sala Terapia 2'],
  ['m128', 'MED-FO-806', 'Flg. Cristian David Paternina', 'fonoaudiologia', 'Sala Terapia 3'],

  // Terapia Ocupacional (3)
  ['m129', 'MED-TO-807', 'T.O. Karen Lorena Buitrago', 'terapia_ocupacional', 'Sala Terapia 4'],
  ['m130', 'MED-TO-808', 'T.O. Melissa Andrea Torres', 'terapia_ocupacional', 'Sala Terapia 5'],
  ['m131', 'MED-TO-809', 'T.O. Sebastián José Barrios', 'terapia_ocupacional', 'Sala Terapia 6'],

  // Nutrición y Dietética (3)
  ['m132', 'MED-NU-810', 'Nut. María Fernanda Consuegra', 'nutricion_dietetica', 'Cons. Nutrición 1'],
  ['m133', 'MED-NU-811', 'Nut. Valeria Isabel Roa', 'nutricion_dietetica', 'Cons. Nutrición 2'],
  ['m134', 'MED-NU-812', 'Nut. Carlos Andrés Pacheco', 'nutricion_dietetica', 'Cons. Nutrición 3'],

  // Terapia Respiratoria (3)
  ['m135', 'MED-TR-813', 'T.R. Angie Paola Pertuz', 'terapia_respiratoria', 'Sala Resp. 1'],
  ['m136', 'MED-TR-814', 'T.R. Brayan Stiven Arroyo', 'terapia_respiratoria', 'Sala Resp. 2'],
  ['m137', 'MED-TR-815', 'T.R. Laura Marcela Ospino', 'terapia_respiratoria', 'Sala Resp. 3'],

  // Optometría (3)
  ['m138', 'MED-OP-901', 'Opt. Laura Vanessa Niño', 'optometria', 'Cons. Opt 1'],
  ['m139', 'MED-OP-902', 'Opt. David Ricardo Salas', 'optometria', 'Cons. Opt 2'],
  ['m140', 'MED-OP-903', 'Opt. María Camila Mercado', 'optometria', 'Cons. Opt 3'],

  // Odontología (3)
  ['m141', 'MED-OD-904', 'Od. Catalina Correa Pérez', 'odontologia', 'Cons. Odo 1'],
  ['m142', 'MED-OD-905', 'Od. Santiago Vélez Mora', 'odontologia', 'Cons. Odo 2'],
  ['m143', 'MED-OD-906', 'Od. Daniela Sofía Mejía', 'odontologia', 'Cons. Odo 3'],

  // Audiología (3)
  ['m144', 'MED-AU-907', 'Aud. Natalia Jiménez Rocha', 'audiologia', 'Cons. Audio 1'],
  ['m145', 'MED-AU-908', 'Aud. Javier Mauricio Guzmán', 'audiologia', 'Cons. Audio 2'],
  ['m146', 'MED-AU-909', 'Aud. Sofía Paola Ariza', 'audiologia', 'Cons. Audio 3'],

  // Ecografía Diagnóstica e Imágenes (3)
  ['m147', 'MED-EC-910', 'Dr. Luis Eduardo Chiquillo', 'ecografia_diagnostica', 'Sala Imágenes 1'],
  ['m148', 'MED-EC-911', 'Dra. Karla Patricia Mendoza', 'ecografia_diagnostica', 'Sala Imágenes 2'],
  ['m149', 'MED-EC-912', 'Dr. Andrés Felipe Tovar', 'ecografia_diagnostica', 'Sala Imágenes 3'],

  // Toma de Muestras / Laboratorio Clínico (3)
  ['m150', 'MED-LB-913', 'Bact. Yisela Paola Cantillo', 'toma_muestras_lab', 'Lab. Toma 1'],
  ['m151', 'MED-LB-914', 'Bact. Jesús David Rhenals', 'toma_muestras_lab', 'Lab. Toma 2'],
  ['m152', 'MED-LB-915', 'Bact. Carmen Alicia Morales', 'toma_muestras_lab', 'Lab. Toma 3'],

  // Vacunación PAI y Complementaria (3)
  ['m153', 'MED-VA-916', 'Enf. Wendy Vanessa Palma', 'vacunacion_pai', 'Sala Vacunación 1'],
  ['m154', 'MED-VA-917', 'Enf. Lina Marcela Sarmiento', 'vacunacion_pai', 'Sala Vacunación 2'],
  ['m155', 'MED-VA-918', 'Enf. Darío José Villarreal', 'vacunacion_pai', 'Sala Vacunación 3'],
];

export const MEDICOS_BASE: MedicoBase[] = MEDICOS_TUPLAS.map(
  ([id, codigo, nombre, especialidad, consultorio]) => ({
    id,
    codigo,
    nombre,
    especialidad,
    consultorio,
  })
);

// Días de descanso escalonados por defecto (Lunes a Sábado) para mantener cobertura continua
export function obtenerDiaDescansoPorDefecto(
  medico: MedicoBase,
  todosLosMedicos: MedicoBase[] = MEDICOS_BASE
): DiaSemanaNum {
  const colegas = todosLosMedicos.filter(
    (m) => m.especialidad === medico.especialidad
  );
  const idx = colegas.findIndex((m) => m.id === medico.id);
  if (idx < 0) return -1;
  if (medico.especialidad === 'medicina_general') {
    const diasMG: DiaSemanaNum[] = [1, 2, 3, 4, 5]; // Lunes..Viernes escalonado
    return diasMG[idx % diasMG.length];
  }
  const diasEsp: DiaSemanaNum[] = [1, 3, 5]; // Lunes, Miércoles, Viernes escalonado
  return diasEsp[idx % diasEsp.length];
}

export function construirMapaDescansosPorDefecto(
  lista: MedicoBase[] = MEDICOS_BASE
): Record<string, DiaSemanaNum> {
  const mapa: Record<string, DiaSemanaNum> = {};
  for (const m of lista) {
    mapa[m.id] = obtenerDiaDescansoPorDefecto(m, lista);
  }
  return mapa;
}

export const PACIENTES_BASE_SISTEMA: Paciente[] = [
  {
    cedula: '1045678901',
    nombres: 'Carlos Andrés',
    apellidos: 'Mendoza',
    telefono: '3004567890',
    correo: 'carlos.mendoza@correo.com',
    eps: 'SURA EPS',
    clasificacion: 'Contributivo · Beneficiario · Rango A',
    estadoAfiliacion: 'Activo',
    pin: '8901',
    aceptoHabeasData: true,
    fechaHabeasData: 'Registro Base Institucional',
  },
  {
    cedula: '1098765432',
    nombres: 'María Fernanda',
    apellidos: 'López',
    telefono: '3119876543',
    correo: 'maria.lopez@correo.com',
    eps: 'Mutual Ser',
    clasificacion: 'Subsidiado · Afiliado subsidiado · Rango A',
    estadoAfiliacion: 'Activo',
    pin: '5432',
    aceptoHabeasData: true,
    fechaHabeasData: 'Registro Base Institucional',
  },
  {
    cedula: '1011223344',
    nombres: 'Jorge Luis',
    apellidos: 'Ramírez',
    telefono: '3201122334',
    correo: 'jorge.ramirez@correo.com',
    eps: 'Nueva EPS',
    clasificacion: 'Contributivo · Cotizante · Rango B',
    estadoAfiliacion: 'Activo',
    pin: '3344',
    aceptoHabeasData: true,
    fechaHabeasData: 'Registro Base Institucional',
  },
];

export const LISTA_EPS = [
  'SURA EPS',
  'Mutual Ser',
  'Nueva EPS',
  'Sanitas EPS',
  'Salud Total EPS',
  'Coosalud EPS',
  'Cajacopi EPS',
];

export const LISTA_REGIMENES: RegimenTipo[] = [
  'Contributivo',
  'Subsidiado',
  'Población no asegurada',
  'Particular',
];

export const LISTA_RANGOS: RangoAfiliacionTipo[] = [
  'Rango A',
  'Rango B',
  'Rango C',
];

export function formatearClasificacion(
  reg: RegimenTipo,
  tipo: TipoAfiliacionTipo,
  rng: RangoAfiliacionTipo
): string {
  if (reg === 'Contributivo')
    return `Contributivo · ${
      tipo === 'Cotizante' || tipo === 'Beneficiario' ? tipo : 'Beneficiario'
    } · ${rng === 'No aplica' ? 'Rango A' : rng}`;
  if (reg === 'Subsidiado')
    return `Subsidiado · Afiliado subsidiado · ${
      rng === 'No aplica' ? 'Rango A' : rng
    }`;
  if (reg === 'Población no asegurada')
    return 'Población no asegurada · No aplica · SISBÉN en trámite';
  return 'Particular · No aplica · Tarifa plena';
}

export function parsearClasificacion(clasif: string): {
  regimen: RegimenTipo;
  tipoAfiliacion: TipoAfiliacionTipo;
  rango: RangoAfiliacionTipo;
} {
  const t = (clasif || '').trim();
  const rango: RangoAfiliacionTipo =
    t.includes('Rango A') || t.includes('Categoría A') || t.includes('Grupo A')
      ? 'Rango A'
      : t.includes('Rango B') ||
        t.includes('Categoría B') ||
        t.includes('Grupo B')
      ? 'Rango B'
      : t.includes('Rango C') ||
        t.includes('Categoría C') ||
        t.includes('Grupo C')
      ? 'Rango C'
      : 'No aplica';
  if (t.startsWith('Particular'))
    return {
      regimen: 'Particular',
      tipoAfiliacion: 'No aplica',
      rango: 'No aplica',
    };
  if (t.startsWith('Población no asegurada') || t.startsWith('Sin EPS'))
    return {
      regimen: 'Población no asegurada',
      tipoAfiliacion: 'No aplica',
      rango: 'No aplica',
    };
  if (t.startsWith('Subsidiado'))
    return {
      regimen: 'Subsidiado',
      tipoAfiliacion: 'Afiliado subsidiado',
      rango: rango === 'No aplica' ? 'Rango A' : rango,
    };
  return {
    regimen: 'Contributivo',
    tipoAfiliacion: t.includes('Cotizante') ? 'Cotizante' : 'Beneficiario',
    rango: rango === 'No aplica' ? 'Rango A' : rango,
  };
}

export function ajustarAfiliacion(
  nuevoReg: RegimenTipo,
  epsAct: string,
  tipoAct: TipoAfiliacionTipo,
  rangoAct: RangoAfiliacionTipo
) {
  if (nuevoReg === 'Contributivo')
    return {
      eps: !epsAct || epsAct === 'Sin EPS / No afiliado' ? 'SURA EPS' : epsAct,
      regimen: 'Contributivo' as RegimenTipo,
      tipoAfiliacion: (tipoAct === 'Cotizante' || tipoAct === 'Beneficiario'
        ? tipoAct
        : 'Cotizante') as TipoAfiliacionTipo,
      rango: (rangoAct === 'No aplica'
        ? 'Rango A'
        : rangoAct) as RangoAfiliacionTipo,
    };
  if (nuevoReg === 'Subsidiado')
    return {
      eps:
        !epsAct || epsAct === 'Sin EPS / No afiliado' ? 'Mutual Ser' : epsAct,
      regimen: 'Subsidiado' as RegimenTipo,
      tipoAfiliacion: 'Afiliado subsidiado' as TipoAfiliacionTipo,
      rango: (rangoAct === 'No aplica'
        ? 'Rango A'
        : rangoAct) as RangoAfiliacionTipo,
    };
  return {
    eps: 'Sin EPS / No afiliado',
    regimen: nuevoReg,
    tipoAfiliacion: 'No aplica' as TipoAfiliacionTipo,
    rango: 'No aplica' as RangoAfiliacionTipo,
  };
}

export function normalizarNivelAdmin(n: number): NivelAdmin {
  return n >= 4 ? 4 : n === 3 ? 3 : n === 2 ? 2 : 1;
}

export const DESCRIPCIONES_POR_NIVEL: Record<
  NivelAdmin,
  { titulo: string; descripcion: string }
> = {
  1: {
    titulo: 'Nivel 1 · Auditoría, KPI y Calidad',
    descripcion:
      'KPI, alertas dobles, satisfacción PQRSD y bitácora de auditoría (enmascaramiento Ley 1581).',
  },
  2: {
    titulo: 'Nivel 2 · Agendas y Autorizaciones',
    descripcion:
      'Supervisión + control unificado de agendas, validación visual de documentos, reprogramación, recordatorios por correo e inasistencias.',
  },
  3: {
    titulo: 'Nivel 3 · Admisiones, Lector QR y Caja',
    descripcion:
      'Agendas/Autorizaciones + lector QR, llegada en sala, caja, recibos de datáfono y factura electrónica.',
  },
  4: {
    titulo: 'Nivel 4 · Administrador General',
    descripcion:
      'Control total: médicos, descansos semanales, auxiliar de turno, administradores, pacientes, tarifas particulares y nube.',
  },
};

export const ADMINISTRADORES_BASE_SISTEMA: UsuarioAdministrativo[] = (
  [
    ['1001001001', 'Supervisor Base N1', 1, '7788', false],
    ['1002002002', 'Coordinador Agendas y Autorizaciones N2', 2, '5566', false],
    ['1003003003', 'Auxiliar Agendas y Autorizaciones N2', 2, '3344', false],
    ['1004004004', 'Analista Admisiones y Caja N3', 3, '1122', false],
    ['1005005005', 'Director General IPS', 4, '2026', true],
    ['4004', 'Administrador General IPS', 4, '4444', true],
  ] as [string, string, NivelAdmin, string, boolean][]
).map(([cedula, nombre, nivel, pin, protegido]) => ({
  cedula,
  nombre,
  ...DESCRIPCIONES_POR_NIVEL[nivel],
  nivel,
  pin,
  protegido,
}));

export function obtenerFechaLocalISO(dias = 0): string {
  const f = new Date();
  f.setDate(f.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(f.getDate()).padStart(2, '0')}`;
}

export function formatearFechaLegible(fechaIso: string): string {
  if (!fechaIso || !fechaIso.includes('-')) return fechaIso;
  const [a, m, d] = fechaIso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function obtenerDiaSemanaIso(fechaIso: string): DiaSemanaNum {
  if (!fechaIso || !fechaIso.includes('-')) return -1;
  const [a, m, d] = fechaIso.split('-').map(Number);
  return new Date(a, m - 1, d).getDay() as DiaSemanaNum;
}

export function obtenerNombreDiaSemana(dia: DiaSemanaNum): string {
  return (
    DIAS_SEMANA_OPCIONES.find((d) => d.valor === dia)?.nombre || 'Sin descanso'
  );
}

export function horaActualFormateada(): string {
  return new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function fechaHoraCompletaFormateada(): string {
  const f = new Date();
  return `${f.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} · ${f.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`;
}

export async function procesarYComprimirImagen(
  file: File,
  maxDim = 1280,
  calidad = 0.78
): Promise<{ url: string; blob: Blob }> {
  return new Promise((resolve) => {
    const leerFallback = () => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: typeof reader.result === 'string' ? reader.result : '',
          blob: file,
        });
      };
      reader.onerror = () => resolve({ url: '', blob: file });
      reader.readAsDataURL(file);
    };

    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objUrl);
          leerFallback();
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', calidad);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objUrl);
            resolve({ url: dataUrl, blob: blob || file });
          },
          'image/jpeg',
          calidad
        );
      } catch {
        URL.revokeObjectURL(objUrl);
        leerFallback();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      leerFallback();
    };
    img.src = objUrl;
  });
}

export function esArchivoPdf(urlOrName?: string, mimeType?: string): boolean {
  if (mimeType && mimeType.toLowerCase().includes('pdf')) return true;
  if (!urlOrName) return false;
  const s = urlOrName.trim().toLowerCase();
  return (
    s.startsWith('data:application/pdf') ||
    /\.pdf($|[?#])/.test(s)
  );
}

export async function procesarArchivoSoporte(
  file: File
): Promise<{ url: string; blob: Blob; mimeType: string }> {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url:
            typeof reader.result === 'string'
              ? reader.result
              : URL.createObjectURL(file),
          blob: file,
          mimeType: 'application/pdf',
        });
      };
      reader.onerror = () =>
        resolve({
          url: URL.createObjectURL(file),
          blob: file,
          mimeType: 'application/pdf',
        });
      reader.readAsDataURL(file);
    });
  }
  const img = await procesarYComprimirImagen(file);
  return { ...img, mimeType: 'image/jpeg' };
}

export function obtenerPinDefaultMedico(codigo: string): string {
  const digits = (codigo || '').replace(/\D/g, '');
  if (!digits) return '2026';
  return digits.padStart(4, '0').slice(-4);
}

export function obtenerPinEfectivoMedico(
  medico: Pick<MedicoBase, 'codigo' | 'pin'>,
  pinPersonalizado?: string
): string {
  const custom = (pinPersonalizado || medico.pin || '').trim();
  if (/^\d{4}$/.test(custom)) return custom;
  return obtenerPinDefaultMedico(medico.codigo);
}

export function validarPinMedico(
  medico: MedicoBase,
  pin: string,
  pinPersonalizado?: string
): boolean {
  const limpio = (pin || '').trim();
  if (!/^\d{4}$/.test(limpio)) return false;
  const custom = (pinPersonalizado || medico.pin || '').trim();
  if (/^\d{4}$/.test(custom)) {
    return limpio === custom;
  }
  return limpio === obtenerPinDefaultMedico(medico.codigo) || limpio === '2026';
}

export function parsearHora12AMinutos(horaStr: string): number {
  if (!horaStr) return -1;
  const p = horaStr.trim().split(' ');
  if (p.length < 2) return -1;
  const [hh, mm] = p[0].split(':');
  let h = Number(hh);
  if (p[1].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (p[1].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + (Number(mm) || 0);
}

export function ordenarCitasCronologicamente(lista: CitaMedica[]): CitaMedica[] {
  return [...lista].sort(
    (a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      parsearHora12AMinutos(a.hora) - parsearHora12AMinutos(b.hora)
  );
}

export function esEstadoCitaCerrado(estado: EstadoCitaTipo): boolean {
  return (
    estado === 'Atendida' ||
    estado === 'Cancelada' ||
    estado === 'No asistió'
  );
}

export function compararCitasMasNuevasPrimero(
  a: CitaMedica,
  b: CitaMedica
): number {
  const ca = a.createdAtMs ?? 0;
  const cb = b.createdAtMs ?? 0;
  if (cb !== ca) return cb - ca;
  const cmpFecha = b.fecha.localeCompare(a.fecha);
  if (cmpFecha !== 0) return cmpFecha;
  return parsearHora12AMinutos(b.hora) - parsearHora12AMinutos(a.hora);
}

export function ordenarCitasNuevasArribaYCerradasAbajo(
  lista: CitaMedica[]
): CitaMedica[] {
  return [...lista].sort((a, b) => {
    const cerrA = esEstadoCitaCerrado(a.estadoCita) ? 1 : 0;
    const cerrB = esEstadoCitaCerrado(b.estadoCita) ? 1 : 0;
    if (cerrA !== cerrB) return cerrA - cerrB;
    return compararCitasMasNuevasPrimero(a, b);
  });
}

export function hayCruceHorario(
  hA: string,
  dA: number,
  hB: string,
  dB: number
): boolean {
  const a = parsearHora12AMinutos(hA),
    b = parsearHora12AMinutos(hB);
  return a >= 0 && b >= 0 && a < b + dB && b < a + dA;
}

export function calcularHoraLlegadaRecomendada(horaStr: string): string {
  const t = parsearHora12AMinutos(horaStr);
  if (t < 0) return '15 minutos antes de la cita';
  const l = Math.max(0, t - 15),
    h24 = Math.floor(l / 60);
  return `${String(h24 % 12 || 12).padStart(2, '0')}:${String(l % 60).padStart(
    2,
    '0'
  )} ${h24 >= 12 ? 'PM' : 'AM'} (15 min antes)`;
}

export function esCitaVencidaSinLlegada(c: CitaMedica): boolean {
  if (
    (c.estadoCita !== 'Pre-admitida' && c.estadoCita !== 'Reprogramada') ||
    !c.fecha?.includes('-')
  )
    return false;
  const hoy = obtenerFechaLocalISO(0);
  if (c.fecha < hoy) return true;
  if (c.fecha > hoy) return false;
  const a = new Date(),
    minC = parsearHora12AMinutos(c.hora);
  return minC >= 0 && a.getHours() * 60 + a.getMinutes() > minC + 15;
}

export function enmascararTextoSensible(
  v: string,
  tipo: 'cedula' | 'telefono' | 'correo'
): string {
  if (!v) return '***';
  if (tipo !== 'correo')
    return v.length <= 5 ? '****' : `${v.slice(0, 3)}****${v.slice(-3)}`;
  const [u, d] = v.split('@');
  return d ? `${u.slice(0, 2)}****@${d}` : '***@***';
}

export function escaparHtml(t: string | number | undefined | null): string {
  return t == null
    ? ''
    : String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function generarFranjasHorariasDisponibles(
  dur: number,
  fechaIso: string,
  ocupadas: (string | { hora: string; duracionMin: number })[],
  horaReferencia?: Date
): string[] {
  const hs: string[] = [],
    hoy = obtenerFechaLocalISO(0),
    a = horaReferencia || new Date();
  const minM = fechaIso === hoy ? a.getHours() * 60 + a.getMinutes() + 20 : -1;
  const paso = dur > 45 ? 30 : dur;
  for (let m = 360; m + dur <= 1080; m += paso) {
    if (m < minM) continue;
    const h24 = Math.floor(m / 60);
    const s = `${String(h24 % 12 || 12).padStart(2, '0')}:${String(
      m % 60
    ).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
    const choca = ocupadas.some((o) =>
      typeof o === 'string'
        ? o === s
        : hayCruceHorario(s, dur, o.hora, o.duracionMin)
    );
    if (!choca) hs.push(s);
  }
  return hs;
}

export const TIEMPO_APARTADO_DOCS_MS = 0;

// Especialidades de acceso directo sin orden ni autorización en consultas: Medicina General, Odontología y Vacunación
export const ESPECIALIDADES_ACCESO_DIRECTO: EspecialidadId[] = [
  'medicina_general',
  'odontologia',
  'vacunacion_pai',
];

export const ESPECIALIDADES_PROCEDIMIENTO_DEFAULT: EspecialidadId[] = [
  'fisioterapia',
  'terapia_ocupacional',
  'terapia_respiratoria',
  'ecografia_diagnostica',
  'toma_muestras_lab',
];

export const ESPECIALIDADES_SOLO_CONSULTA: EspecialidadId[] = [
  'medicina_general',
  'pediatria',
  'medicina_interna',
  'endocrinologia',
  'reumatologia',
  'nefrologia',
  'infectologia',
  'hematologia',
  'geriatria',
  'genetica_medica',
  'anestesiologia_pre',
  'neurologia',
  'psiquiatria',
  'psiquiatria_infantil',
  'control_prenatal',
  'nutricion_dietetica',
  'optometria',
  'vacunacion_pai',
];

export const ESPECIALIDADES_SOLO_PROCEDIMIENTO: EspecialidadId[] = [
  'fisioterapia',
  'terapia_ocupacional',
  'terapia_respiratoria',
  'ecografia_diagnostica',
  'toma_muestras_lab',
];

export function especialidadSoportaTipoAtencion(
  especialidadId: EspecialidadId,
  tipoAtencion: TipoAtencionTipo
): boolean {
  if (tipoAtencion === 'consulta') {
    return !ESPECIALIDADES_SOLO_PROCEDIMIENTO.includes(especialidadId);
  }
  return !ESPECIALIDADES_SOLO_CONSULTA.includes(especialidadId);
}

export function obtenerAreasParaTipoAtencion(tipoAtencion: TipoAtencionTipo) {
  return AREAS_SERVICIO.filter((area) =>
    ESPECIALIDADES.some(
      (e) =>
        e.areaId === area.id &&
        especialidadSoportaTipoAtencion(e.id, tipoAtencion)
    )
  );
}

export function obtenerEspecialidadesParaAreaYTipo(
  areaId: AreaServicioId,
  tipoAtencion: TipoAtencionTipo
): EspecialidadInfo[] {
  return ESPECIALIDADES.filter(
    (e) =>
      e.areaId === areaId &&
      especialidadSoportaTipoAtencion(e.id, tipoAtencion)
  );
}

export interface ProcedimientoCatalogo {
  id: string;
  especialidadId: EspecialidadId;
  areaId: AreaServicioId;
  nombre: string;
  duracionMin: number;
  tarifaParticular: number;
  esVariable?: boolean;
}

export const PROCEDIMIENTO_PERSONALIZADO_ID = 'personalizado';

const PROCEDIMIENTOS_TUPLAS: [
  string,
  EspecialidadId,
  string,
  number,
  number,
  boolean?
][] = [
  // 2. Especializada - Dermatología
  ['proc_derm_biopsia', 'dermatologia', 'Biopsia de piel por punch con sutura', 45, 195000],
  ['proc_derm_crioterapia', 'dermatologia', 'Crioterapia dermatológica de lesiones', 30, 145000],
  ['proc_derm_electrofulg', 'dermatologia', 'Electrofulguración / cauterización cutánea', 30, 155000],
  ['proc_derm_escision', 'dermatologia', 'Escisión ambulatoria de nevo o quiste epidérmico', 60, 230000],
  ['proc_derm_infiltracion', 'dermatologia', 'Infiltración intralesional dermatológica', 30, 140000],

  // 2. Especializada - Oftalmología
  ['proc_oft_tonometria', 'oftalmologia', 'Tonometría ocular y curva de presión intraocular', 30, 130000],
  ['proc_oft_fondo_ojo', 'oftalmologia', 'Fondo de ojo con dilatación y retinografía', 45, 185000],
  ['proc_oft_campimetria', 'oftalmologia', 'Campimetría visual computarizada bilateral', 45, 175000],
  ['proc_oft_cuerpo_extrano', 'oftalmologia', 'Extracción de cuerpo extraño corneal o conjuntival', 30, 165000],
  ['proc_oft_yag_laser', 'oftalmologia', 'Capsulotomía / Iridotomía con YAG Láser', 45, 290000],
  ['proc_oft_topografia', 'oftalmologia', 'Topografía y paquimetría corneal computarizada', 30, 170000],

  // 2. Especializada - Otorrinolaringología
  ['proc_orl_lavado_oido', 'otorrinolaringologia', 'Lavado de oído bilateral / extracción de cerumen', 30, 110000],
  ['proc_orl_nasofibro', 'otorrinolaringologia', 'Nasofibrolaringoscopia diagnóstica', 45, 240000],
  ['proc_orl_cauterizacion', 'otorrinolaringologia', 'Cauterización nasal por epistaxis', 30, 160000],
  ['proc_orl_cuerpo_extrano', 'otorrinolaringologia', 'Extracción de cuerpo extraño en oído o fosa nasal', 30, 165000],
  ['proc_orl_biopsia', 'otorrinolaringologia', 'Biopsia de mucosa ORL bajo anestesia local', 45, 225000],

  // 2. Especializada - Ortopedia y Traumatología
  ['proc_ort_infiltracion', 'ortopedia', 'Infiltración articular terapéutica (hombro/rodilla/cadera)', 45, 210000],
  ['proc_ort_yeso_ferula', 'ortopedia', 'Inmovilización con yeso o férula funcional', 45, 175000],
  ['proc_ort_artrocentesis', 'ortopedia', 'Artrocentesis diagnóstica o evacuadora', 45, 195000],
  ['proc_ort_retiro_mat', 'ortopedia', 'Retiro de material de osteosíntesis superficial', 60, 260000],
  ['proc_ort_drenaje_bursa', 'ortopedia', 'Drenaje de bursa o quiste sinovial ambulatorio', 45, 190000],

  // 2. Especializada - Urología
  ['proc_uro_uroflujometria', 'urologia', 'Uroflujometría computarizada', 30, 165000],
  ['proc_uro_cistoscopia', 'urologia', 'Cistoscopia diagnóstica flexible ambulatoria', 60, 320000],
  ['proc_uro_sonda', 'urologia', 'Cambio o retiro de sonda vesical / catéter', 30, 125000],
  ['proc_uro_dilatacion', 'urologia', 'Dilatación uretral ambulatoria', 45, 220000],
  ['proc_uro_circuncision', 'urologia', 'Circuncisión ambulatoria bajo anestesia local', 90, 420000],
  ['proc_uro_biopsia_prost', 'urologia', 'Biopsia prostática dirigida ambulatoria', 60, 380000],

  // 2. Especializada - Alergología e Inmunología
  ['proc_ale_prick_test', 'alergologia', 'Pruebas cutáneas de alergia (Prick Test completo)', 45, 210000],
  ['proc_ale_provocacion', 'alergologia', 'Prueba de provocación controlada (medicamento/alimento)', 90, 265000],
  ['proc_ale_inmunoterapia', 'alergologia', 'Aplicación y control de inmunoterapia específica', 30, 130000],

  // 2. Especializada - Coloproctología
  ['proc_col_anuscopia', 'coloproctologia', 'Anuscopia diagnóstica de alta resolución', 30, 185000],
  ['proc_col_rectosig', 'coloproctologia', 'Rectosigmoidoscopia diagnóstica', 45, 250000],
  ['proc_col_ligadura', 'coloproctologia', 'Ligadura elástica de hemorroides internas', 45, 280000],
  ['proc_col_drenaje', 'coloproctologia', 'Drenaje ambulatorio de absceso o trombosis hemorroidal', 45, 260000],

  // 2. Especializada - Mastología
  ['proc_mas_biopsia_trucut', 'mastologia', 'Biopsia trucut de mama guiada por ecografía', 60, 310000],
  ['proc_mas_bacaf', 'mastologia', 'Aspiración con aguja fina (BACAF) de nódulo o quiste', 45, 215000],
  ['proc_mas_drenaje', 'mastologia', 'Drenaje de absceso mamario ambulatorio', 45, 220000],
  ['proc_mas_reseccion', 'mastologia', 'Resección ambulatoria de lesión mamaria benigna', 90, 440000],

  // 2. Especializada - Fisiatría
  ['proc_fis_emg', 'fisiatria', 'Electromiografía y neuroconducción periférica (EMG)', 60, 240000],
  ['proc_fis_miofascial', 'fisiatria', 'Bloqueo miofascial y puntos gatillo', 45, 185000],
  ['proc_fis_toxina', 'fisiatria', 'Aplicación terapéutica de toxina botulínica (espasticidad)', 60, 350000],

  // 2. Especializada - Cirugía Oral y Maxilofacial
  ['proc_max_cordales', 'cirugia_maxilofacial', 'Exodoncia quirúrgica de terceros molares incluidos', 60, 280000],
  ['proc_max_biopsia_oral', 'cirugia_maxilofacial', 'Biopsia incisional de mucosa oral o maxilar', 45, 210000],
  ['proc_max_frenilectomia', 'cirugia_maxilofacial', 'Frenilectomía labial o lingual ambulatoria', 45, 195000],
  ['proc_max_drenaje', 'cirugia_maxilofacial', 'Drenaje de absceso odontogénico / maxilofacial', 45, 215000],

  // 2. Especializada - Cardiología
  ['proc_car_ekg', 'cardiologia', 'Electrocardiograma de 12 derivaciones (EKG)', 30, 95000],
  ['proc_car_ecocardio', 'cardiologia', 'Ecocardiograma transtorácico Doppler color', 45, 260000],
  ['proc_car_holter', 'cardiologia', 'Monitoreo Holter ECG de 24 horas', 45, 230000],
  ['proc_car_mapa', 'cardiologia', 'Monitoreo ambulatorio de presión arterial (MAPA 24h)', 30, 195000],
  ['proc_car_esfuerzo', 'cardiologia', 'Prueba de esfuerzo / ergometría cardiovascular', 60, 275000],

  // 2. Especializada - Neurocirugía
  ['proc_neu_bloqueo_fac', 'neurocirugia', 'Bloqueo facetario o radicular lumbar guiado', 60, 380000],
  ['proc_neu_epidural', 'neurocirugia', 'Infiltración epidural caudal analgésica', 60, 340000],
  ['proc_neu_tunel_carpo', 'neurocirugia', 'Descompresión ambulatoria de túnel del carpo', 90, 480000],
  ['proc_neu_curacion', 'neurocirugia', 'Curación y retiro de sutura craneal o espinal', 30, 150000],
  ['proc_neu_compleja', 'neurocirugia', 'Procedimiento neuroquirúrgico de alta complejidad', 180, 0, true],

  // 2. Especializada - Gastroenterología
  ['proc_gas_endoscopia', 'gastroenterologia', 'Endoscopia digestiva alta (EGD) diagnóstica', 45, 290000],
  ['proc_gas_colonoscopia', 'gastroenterologia', 'Colonoscopia total diagnóstica con sedación', 60, 390000],
  ['proc_gas_polipectomia', 'gastroenterologia', 'Polipectomía endoscópica ambulatoria', 60, 450000],
  ['proc_gas_aliento', 'gastroenterologia', 'Test de aliento para Helicobacter pylori', 30, 145000],

  // 2. Especializada - Neumología
  ['proc_nm_espirometria', 'neumologia', 'Espirometría simple y con broncodilatador', 30, 135000],
  ['proc_nm_pletismografia', 'neumologia', 'Pletismografía pulmonar y difusión de CO', 45, 245000],
  ['proc_nm_poligrafia', 'neumologia', 'Poligrafía respiratoria / estudio de apnea del sueño', 60, 290000],
  ['proc_nm_broncoscopia', 'neumologia', 'Broncoscopia diagnóstica ambulatoria', 90, 460000],

  // 2. Especializada - Dolor y Cuidados Paliativos
  ['proc_dol_bloqueo', 'dolor_paliativos', 'Bloqueo nervioso periférico para control del dolor', 45, 260000],
  ['proc_dol_infiltracion', 'dolor_paliativos', 'Infiltración epidural o articular analgésica', 60, 295000],
  ['proc_dol_cateter', 'dolor_paliativos', 'Manejo y recarga de catéter subcutáneo paliativo', 45, 190000],
  ['proc_dol_complejo', 'dolor_paliativos', 'Terapia intervencionista del dolor complejo', 120, 0, true],

  // 2. Especializada - Oncología
  ['proc_onc_biopsia', 'oncologia', 'Biopsia diagnóstica oncológica ambulatoria', 60, 320000],
  ['proc_onc_medula', 'oncologia', 'Aspirado y biopsia de médula ósea', 60, 360000],
  ['proc_onc_portacath', 'oncologia', 'Mantenimiento y heparinización de catéter Port-a-Cath', 30, 165000],
  ['proc_onc_quimio', 'oncologia', 'Terapia sistémica o procedimiento oncológico complejo', 180, 0, true],

  // 2. Especializada - Cirugía General
  ['proc_cg_lipoma', 'cirugia_general', 'Resección de lipoma o quiste subcutáneo ambulatorio', 60, 310000],
  ['proc_cg_herniorrafia', 'cirugia_general', 'Herniorrafia umbilical o inguinal ambulatoria', 120, 580000],
  ['proc_cg_absceso', 'cirugia_general', 'Drenaje quirúrgico de absceso de tejidos blandos', 45, 230000],
  ['proc_cg_curacion', 'cirugia_general', 'Curación avanzada de herida quirúrgica / retiro de dren', 30, 145000],
  ['proc_cg_compleja', 'cirugia_general', 'Cirugía general ambulatoria de duración/costo variable', 180, 0, true],

  // 2. Especializada - Cirugía Vascular
  ['proc_cv_doppler', 'cirugia_vascular', 'Eco-Doppler arterial o venoso de miembros', 45, 250000],
  ['proc_cv_esclero', 'cirugia_vascular', 'Escleroterapia vascular de várices (sesión)', 45, 220000],
  ['proc_cv_ulcera', 'cirugia_vascular', 'Curación avanzada de úlcera vascular / pie diabético', 45, 195000],
  ['proc_cv_flebectomia', 'cirugia_vascular', 'Flebectomía ambulatoria de várices', 90, 490000],
  ['proc_cv_compleja', 'cirugia_vascular', 'Procedimiento vascular periférico complejo', 180, 0, true],

  // 2. Especializada - Cirugía Plástica
  ['proc_cp_tumor', 'cirugia_plastica', 'Resección reconstructiva de tumor cutáneo / colgajo local', 90, 450000],
  ['proc_cp_cicatriz', 'cirugia_plastica', 'Revisión quirúrgica de cicatriz queloide o retráctil', 60, 360000],
  ['proc_cp_quemadura', 'cirugia_plastica', 'Curación especializada de quemadura ambulatoria', 45, 210000],
  ['proc_cp_compleja', 'cirugia_plastica', 'Procedimiento reconstructivo plástico complejo', 180, 0, true],

  // 2. Especializada - Cirugía Pediátrica
  ['proc_ci_hernia', 'cirugia_pediatrica', 'Herniorrafia inguinal o umbilical pediátrica', 90, 520000],
  ['proc_ci_frenillo', 'cirugia_pediatrica', 'Frenilectomía o liberación de sinequias pediátricas', 45, 240000],
  ['proc_ci_quiste', 'cirugia_pediatrica', 'Resección de quiste o fístula superficial pediátrica', 60, 340000],
  ['proc_ci_compleja', 'cirugia_pediatrica', 'Cirugía pediátrica ambulatoria compleja', 150, 0, true],

  // 2. Especializada - Cirugía de Tórax
  ['proc_ct_toracocentesis', 'cirugia_torax', 'Toracocentesis diagnóstica o terapéutica guiada', 60, 350000],
  ['proc_ct_tubo_torax', 'cirugia_torax', 'Curación y retiro de tubo a tórax / drenaje pleural', 45, 230000],
  ['proc_ct_biopsia', 'cirugia_torax', 'Biopsia pleural cerrada ambulatoria', 60, 390000],
  ['proc_ct_compleja', 'cirugia_torax', 'Procedimiento quirúrgico torácico complejo', 180, 0, true],

  // 3. Salud Mental - Psicología y Neuropsicología
  ['proc_psi_individual', 'psicologia', 'Psicoterapia individual ambulatoria (sesión)', 45, 110000],
  ['proc_psi_familiar', 'psicologia', 'Terapia psicológica familiar o de pareja', 60, 145000],
  ['proc_psi_crisis', 'psicologia', 'Intervención psicológica en crisis', 60, 130000],
  ['proc_psi_bateria', 'psicologia', 'Aplicación e informe de batería clínica / psicotécnica', 90, 195000],
  ['proc_npsi_evaluacion', 'neuropsicologia', 'Evaluación neuropsicológica integral', 90, 260000],
  ['proc_npsi_rehab', 'neuropsicologia', 'Sesión de rehabilitación cognitiva', 45, 145000],
  ['proc_npsi_tamizaje', 'neuropsicologia', 'Tamizaje neurocognitivo (memoria / TDAH)', 60, 185000],

  // 4. Salud Materno-Perinatal - Ginecología y Perinatología
  ['proc_gin_colposcopia', 'ginecologia', 'Colposcopia diagnóstica con biopsia de cérvix', 45, 220000],
  ['proc_gin_citologia', 'ginecologia', 'Toma de citología cervicouterina / prueba VPH', 30, 95000],
  ['proc_gin_diu_implante', 'ginecologia', 'Inserción o retiro de DIU / implante subdérmico', 45, 180000],
  ['proc_gin_cauterizacion', 'ginecologia', 'Cauterización o crioterapia cervical', 45, 235000],
  ['proc_gin_histeroscopia', 'ginecologia', 'Histeroscopia diagnóstica ambulatoria', 60, 340000],
  ['proc_per_detalle', 'perinatologia', 'Ecografía obstétrica de detalle anatómico', 45, 260000],
  ['proc_per_doppler', 'perinatologia', 'Perfil biofísico fetal + Doppler fetoplacentario', 45, 240000],
  ['proc_per_monitoreo', 'perinatologia', 'Monitoreo fetal electrónico sin estrés (NST)', 30, 125000],
  ['proc_per_ecofetal', 'perinatologia', 'Ecocardiografía fetal especializada', 60, 310000],

  // 5. Apoyo Terapéutico
  ['proc_ft_osteomuscular', 'fisioterapia', 'Sesión de fisioterapia osteomuscular y rehabilitación', 45, 85000],
  ['proc_ft_postop', 'fisioterapia', 'Terapia física postoperatoria (rodilla/hombro/columna)', 60, 110000],
  ['proc_ft_medios', 'fisioterapia', 'Electroterapia, ultrasonido y termoterapia clínica', 45, 90000],
  ['proc_ft_neuro_piso', 'fisioterapia', 'Rehabilitación neurológica o de piso pélvico', 60, 120000],
  ['proc_fo_lenguaje', 'fonoaudiologia', 'Terapia fonoaudiológica de lenguaje y habla', 45, 85000],
  ['proc_fo_disfagia', 'fonoaudiologia', 'Rehabilitación de deglución / disfagia', 45, 98000],
  ['proc_fo_miofuncional', 'fonoaudiologia', 'Terapia miofuncional orofacial y de voz', 45, 92000],
  ['proc_to_motricidad', 'terapia_ocupacional', 'Sesión de terapia ocupacional en motricidad y AVD', 45, 88000],
  ['proc_to_sensorial', 'terapia_ocupacional', 'Estimulación cognitiva e integración sensorial', 45, 95000],
  ['proc_to_ferulas', 'terapia_ocupacional', 'Adaptación de férula y rehabilitación de miembro superior', 60, 125000],
  ['proc_tr_integral', 'terapia_respiratoria', 'Terapia respiratoria integral con micronebulización', 45, 95000],
  ['proc_tr_pulmonar', 'terapia_respiratoria', 'Higiene bronquial y rehabilitación pulmonar', 45, 105000],
  ['proc_tr_espiro', 'terapia_respiratoria', 'Incentivo respiratorio y terapia de reexpansión', 30, 80000],

  // 6. Apoyo Diagnóstico y Preventivo
  ['proc_od_profilaxis', 'odontologia', 'Profilaxis dental, detartraje y aplicación de flúor', 30, 85000],
  ['proc_od_resina', 'odontologia', 'Obturación dental con resina estética (calza)', 45, 115000],
  ['proc_od_exodoncia', 'odontologia', 'Exodoncia dental simple bajo anestesia local', 45, 120000],
  ['proc_od_urgencia', 'odontologia', 'Urgencia odontológica / apertura cameral endodóntica', 45, 135000],
  ['proc_od_sellantes', 'odontologia', 'Aplicación de sellantes dentales preventivos', 30, 80000],
  ['proc_au_audiometria', 'audiologia', 'Audiometría tonal liminar y logoaudiometría', 30, 95000],
  ['proc_au_impedancia', 'audiologia', 'Impedanciometría / timpanometría clínica', 30, 90000],
  ['proc_au_otoemisiones', 'audiologia', 'Otoemisiones acústicas (tamizaje auditivo)', 30, 105000],
  ['proc_au_peatc', 'audiologia', 'Potenciales evocados auditivos de tallo (PEATC)', 60, 220000],
  ['proc_eco_abdomen', 'ecografia_diagnostica', 'Ecografía abdominal total', 30, 145000],
  ['proc_eco_renal', 'ecografia_diagnostica', 'Ecografía renal y de vías urinarias', 30, 135000],
  ['proc_eco_pelvica', 'ecografia_diagnostica', 'Ecografía pélvica o transvaginal', 30, 140000],
  ['proc_eco_tiroides', 'ecografia_diagnostica', 'Ecografía de tiroides y cuello', 30, 135000],
  ['proc_eco_mama', 'ecografia_diagnostica', 'Ecografía mamaria bilateral', 30, 150000],
  ['proc_eco_osteo', 'ecografia_diagnostica', 'Ecografía articular o de tejidos blandos', 30, 145000],
  ['proc_eco_doppler', 'ecografia_diagnostica', 'Eco-Doppler diagnóstico vascular o carotídeo', 45, 225000],
  ['proc_lab_perfil', 'toma_muestras_lab', 'Toma de muestras perfil general (hemograma, glicemia, lípidos)', 20, 65000],
  ['proc_lab_curva', 'toma_muestras_lab', 'Curva de tolerancia a la glucosa / pruebas seriadas', 60, 95000],
  ['proc_lab_hormonal', 'toma_muestras_lab', 'Toma de muestras hormonales y marcadores especiales', 30, 115000],
  ['proc_lab_cultivos', 'toma_muestras_lab', 'Toma de urocultivo, coprológico y cultivos microbiológicos', 30, 85000],
  ['proc_lab_complejo', 'toma_muestras_lab', 'Panel diagnóstico de laboratorio complejo (valor variable)', 45, 0, true],
];

export const PROCEDIMIENTOS_CATALOGO: ProcedimientoCatalogo[] =
  PROCEDIMIENTOS_TUPLAS.map(
    ([id, especialidadId, nombre, duracionMin, tarifaParticular, esVariable]) => {
      const esp = ESPECIALIDADES.find((e) => e.id === especialidadId);
      return {
        id,
        especialidadId,
        areaId: esp?.areaId ?? 'especializada',
        nombre,
        duracionMin,
        tarifaParticular,
        ...(esVariable ? { esVariable: true } : {}),
      };
    }
  );

export function obtenerProcedimientoPorId(
  procId?: string
): ProcedimientoCatalogo | undefined {
  if (!procId) return undefined;
  return PROCEDIMIENTOS_CATALOGO.find((p) => p.id === procId);
}

export function obtenerProcedimientosPorArea(
  areaId: AreaServicioId
): ProcedimientoCatalogo[] {
  return PROCEDIMIENTOS_CATALOGO.filter((p) => p.areaId === areaId);
}

export function obtenerProcedimientosPorEspecialidad(
  especialidadId: EspecialidadId
): ProcedimientoCatalogo[] {
  return PROCEDIMIENTOS_CATALOGO.filter(
    (p) => p.especialidadId === especialidadId
  );
}

export function obtenerTarifaProcedimientoCatalogo(
  procId: string,
  tarifasCatalogoMap?: Record<string, number>,
  tarifasParticularesMap?: Record<string, number>,
  fallbackGeneral = 50000,
  tarifasProcedimientosMap?: Record<string, number>,
  fallbackGeneralProc?: number
): number {
  if (procId === PROCEDIMIENTO_PERSONALIZADO_ID) return 0;
  const proc = obtenerProcedimientoPorId(procId);
  if (!proc) return fallbackGeneralProc ?? 75000;
  if (tarifasCatalogoMap?.[proc.id] != null) {
    return Math.max(0, Number(tarifasCatalogoMap[proc.id]) || 0);
  }
  if (proc.esVariable) return 0;
  if (proc.tarifaParticular > 0) return proc.tarifaParticular;
  return obtenerValorReferencialProcedimiento(
    proc.especialidadId,
    tarifasParticularesMap,
    fallbackGeneral,
    tarifasProcedimientosMap,
    fallbackGeneralProc
  );
}

export interface OpcionDuracionProcedimiento {
  minutos: number;
  etiqueta: string;
  detalle: string;
}

export const DURACIONES_ADMIN_PROCEDIMIENTO: number[] = [
  20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720,
];

export function formatearDuracionHumana(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return '0 min';
  const total = Math.round(minutos);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function calcularHoraFinEstimada(
  horaInicio: string,
  duracionMin: number
): string {
  const ini = parsearHora12AMinutos(horaInicio);
  if (ini < 0) return '';
  const totalFin = ini + Math.max(1, Math.round(duracionMin));
  const diasExtra = Math.floor(totalFin / 1440);
  const mDia = totalFin % 1440;
  const h24 = Math.floor(mDia / 60);
  const m = mDia % 60;
  const texto = `${String(h24 % 12 || 12).padStart(2, '0')}:${String(
    m
  ).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
  return diasExtra > 0 ? `${texto} (+${diasExtra} día)` : texto;
}

export const OPCIONES_DURACION_PROCEDIMIENTO: OpcionDuracionProcedimiento[] = [
  {
    minutos: 30,
    etiqueta: '30 min · Corto',
    detalle: 'Toma de muestra, curación o procedimiento breve',
  },
  {
    minutos: 45,
    etiqueta: '45 min · Estándar',
    detalle: 'Sesión terapéutica, ecografía o estudio diagnóstico',
  },
  {
    minutos: 60,
    etiqueta: '60 min · Intermedio',
    detalle: 'Procedimiento ambulatorio o terapia extendida',
  },
  {
    minutos: 90,
    etiqueta: '90 min · Complejo',
    detalle: 'Intervención especializada o cirugía menor (bloque 1.5 h)',
  },
  {
    minutos: 120,
    etiqueta: '120 min · Prolongado',
    detalle: 'Procedimiento complejo o tratamiento de alta dedicación (2 h)',
  },
];

export function obtenerDuracionProcedimientoPorDefecto(
  especialidadId: EspecialidadId
): number {
  if (especialidadId === 'toma_muestras_lab') return 30;
  if (
    [
      'fisioterapia',
      'terapia_ocupacional',
      'terapia_respiratoria',
      'fonoaudiologia',
      'ecografia_diagnostica',
      'audiologia',
      'psicologia',
      'neuropsicologia',
    ].includes(especialidadId)
  ) {
    return 45;
  }
  if (
    [
      'neurocirugia',
      'cardiologia',
      'gastroenterologia',
      'oncologia',
      'cirugia_general',
      'cirugia_vascular',
      'cirugia_plastica',
      'cirugia_pediatrica',
      'cirugia_torax',
    ].includes(especialidadId)
  ) {
    return 90;
  }
  return 60;
}

export function obtenerTipoAtencionPorDefecto(
  especialidadId: EspecialidadId
): TipoAtencionTipo {
  return ESPECIALIDADES_PROCEDIMIENTO_DEFAULT.includes(especialidadId)
    ? 'procedimiento'
    : 'consulta';
}

export type DocumentoSolicitadoTipo = 'orden' | 'autorizacion' | 'ambos';

export interface RequisitosDocumentosCita {
  requiereOrden: boolean;
  requiereAutorizacion: boolean;
  permiteAlMenosUno?: boolean;
  motivoExencion: string;
}

export function obtenerRequisitosDocumentos(
  especialidadId: EspecialidadId,
  _clasificacion: string,
  tipoAtencion: TipoAtencionTipo = 'consulta'
): RequisitosDocumentosCita {
  if (tipoAtencion === 'procedimiento') {
    return {
      requiereOrden: true,
      requiereAutorizacion: true,
      permiteAlMenosUno: true,
      motivoExencion:
        'En procedimientos debes adjuntar tu Orden Médica o Autorización EPS al momento de agendar (con uno de los dos es suficiente; no necesitas ambos).',
    };
  }
  if (ESPECIALIDADES_ACCESO_DIRECTO.includes(especialidadId)) {
    const nombreEsp =
      ESPECIALIDADES.find((e) => e.id === especialidadId)?.nombre ||
      'Esta consulta';
    return {
      requiereOrden: false,
      requiereAutorizacion: false,
      permiteAlMenosUno: false,
      motivoExencion: `${nombreEsp}: acceso directo sin orden médica ni autorización previa obligatoria.`,
    };
  }
  if (especialidadId === 'optometria' || especialidadId === 'audiologia') {
    const nombreEsp =
      ESPECIALIDADES.find((e) => e.id === especialidadId)?.nombre ||
      'Esta consulta';
    return {
      requiereOrden: true,
      requiereAutorizacion: false,
      permiteAlMenosUno: false,
      motivoExencion: `Consulta de ${nombreEsp}: requiere adjuntar únicamente Orden Médica al momento de agendar (no requiere autorización EPS).`,
    };
  }
  return {
    requiereOrden: true,
    requiereAutorizacion: true,
    permiteAlMenosUno: false,
    motivoExencion:
      'Esta consulta requiere adjuntar Orden Médica y Autorización EPS al momento de agendar (ambos documentos son obligatorios).',
  };
}

export function obtenerTarifaParticularEspecialidad(
  especialidadId?: EspecialidadId,
  tarifasParticularesMap?: Record<string, number>,
  fallbackGeneral = 50000
): number {
  if (especialidadId && tarifasParticularesMap?.[especialidadId] != null) {
    return tarifasParticularesMap[especialidadId];
  }
  const esp = ESPECIALIDADES.find((e) => e.id === especialidadId);
  return esp ? esp.tarifaParticular : fallbackGeneral;
}

export function obtenerValorReferencialProcedimiento(
  especialidadId?: EspecialidadId,
  tarifasParticularesMap?: Record<string, number>,
  fallbackGeneral = 50000,
  tarifasProcedimientosMap?: Record<string, number>,
  fallbackGeneralProc?: number
): number {
  if (especialidadId && tarifasProcedimientosMap?.[especialidadId] != null) {
    return tarifasProcedimientosMap[especialidadId];
  }
  const base = obtenerTarifaParticularEspecialidad(
    especialidadId,
    tarifasParticularesMap,
    fallbackGeneral
  );
  if (!especialidadId && fallbackGeneralProc != null) {
    return fallbackGeneralProc;
  }
  return Math.max(60000, Math.round((base * 1.5) / 1000) * 1000);
}

// Regla SGSSS:
// - CONSULTA MÉDICA:
//   * Contributivo (Cotizante Y Beneficiario): Cuota Moderadora (Rango A / B / C) antes de la cita.
//   * Subsidiado y Población no asegurada: $0 (Exento).
//   * Particular: Tarifa plena por especialidad.
// - PROCEDIMIENTO / TERAPIA / TRATAMIENTO:
//   * Contributivo Cotizante: $0 (Exento de copago PBS).
//   * Contributivo Beneficiario: Copago porcentual del valor del servicio (Rango A 11.5%, Rango B 17.3%, Rango C 23% con tope legal).
//   * Subsidiado: Rango A (SISBÉN A/B) Exento $0; Rango B/C Copago 10%.
//   * Población no asegurada: $0 (Exento).
//   * Particular: Tarifa plena de procedimiento.
export function calcularLiquidacionDesdeValorBase(
  clasif: string,
  valorServicio: number,
  t: TarifasConfig,
  tipoAtencion: TipoAtencionTipo = 'consulta',
  especialidadId?: EspecialidadId,
  tarifasParticularesMap?: Record<string, number>
): number {
  const { regimen, tipoAfiliacion, rango } = parsearClasificacion(clasif);

  if (tipoAtencion === 'procedimiento') {
    const val = Math.max(0, Math.round(Number(valorServicio) || 0));
    if (regimen === 'Particular') {
      return val;
    }
    if (regimen === 'Población no asegurada') {
      return 0;
    }
    if (regimen === 'Subsidiado') {
      if (rango === 'Rango A') return 0;
      return Math.min(380000, Math.round((val * 0.1) / 100) * 100);
    }
    if (regimen === 'Contributivo') {
      if (tipoAfiliacion === 'Cotizante') return 0;
      if (rango === 'Rango A') {
        return Math.min(380000, Math.round((val * 0.115) / 100) * 100);
      }
      if (rango === 'Rango B') {
        return Math.min(1520000, Math.round((val * 0.173) / 100) * 100);
      }
      if (rango === 'Rango C') {
        return Math.min(3040000, Math.round((val * 0.23) / 100) * 100);
      }
    }
    return 0;
  }

  if (regimen === 'Particular') {
    return obtenerTarifaParticularEspecialidad(
      especialidadId,
      tarifasParticularesMap,
      t.particular
    );
  }
  if (regimen === 'Subsidiado' || regimen === 'Población no asegurada') {
    return 0;
  }
  if (regimen === 'Contributivo') {
    if (rango === 'Rango A') return t.A;
    if (rango === 'Rango B') return t.B;
    if (rango === 'Rango C') return t.C;
  }
  return 0;
}

export function calcularValorConsulta(
  clasif: string,
  t: TarifasConfig,
  especialidadId?: EspecialidadId,
  tarifasParticularesMap?: Record<string, number>,
  tipoAtencion: TipoAtencionTipo = 'consulta',
  tarifasProcedimientosMap?: Record<string, number>,
  procedimientoId?: string,
  tarifasCatalogoProcMap?: Record<string, number>
): number {
  if (tipoAtencion === 'procedimiento') {
    const valorServicio = procedimientoId
      ? obtenerTarifaProcedimientoCatalogo(
          procedimientoId,
          tarifasCatalogoProcMap,
          tarifasParticularesMap,
          t.particular,
          tarifasProcedimientosMap,
          t.particularProcedimiento
        )
      : obtenerValorReferencialProcedimiento(
          especialidadId,
          tarifasParticularesMap,
          t.particular,
          tarifasProcedimientosMap,
          t.particularProcedimiento
        );
    return calcularLiquidacionDesdeValorBase(
      clasif,
      valorServicio,
      t,
      'procedimiento',
      especialidadId,
      tarifasParticularesMap
    );
  }

  return calcularLiquidacionDesdeValorBase(
    clasif,
    0,
    t,
    'consulta',
    especialidadId,
    tarifasParticularesMap
  );
}

export function obtenerEtiquetaConceptoPago(
  clasif: string,
  tipoAtencion: TipoAtencionTipo = 'consulta'
): string {
  const { regimen, tipoAfiliacion, rango } = parsearClasificacion(clasif);

  if (tipoAtencion === 'procedimiento') {
    if (regimen === 'Particular') return 'Tarifa Procedimiento Particular';
    if (regimen === 'Contributivo') {
      if (tipoAfiliacion === 'Cotizante') {
        return 'Exento de Copago (Cotizante PBS)';
      }
      if (rango === 'Rango B') {
        return 'Copago Beneficiario Rango B (17,3% · EPS cubre 82,7%)';
      }
      if (rango === 'Rango C') {
        return 'Copago Beneficiario Rango C (23% · EPS cubre 77%)';
      }
      return 'Copago Beneficiario Rango A (11,5% · EPS cubre 88,5%)';
    }
    if (regimen === 'Subsidiado') {
      if (rango === 'Rango A') return 'Exento de Copago (SISBÉN A/B)';
      return 'Copago Subsidiado (10% · EPS cubre 90%)';
    }
    return 'Exento SGSSS ($0)';
  }

  if (regimen === 'Particular') return 'Tarifa Consulta Particular';
  if (regimen === 'Contributivo') {
    return `Cuota Moderadora (${rango === 'No aplica' ? 'Rango A' : rango})`;
  }
  return 'Exento SGSSS ($0)';
}

export function construirObservacionApartado(limiteMs?: number): string {
  return limiteMs && limiteMs > 0
    ? `[APARTADO_HASTA:${limiteMs}] Apartamiento pendiente de subir soportes médicos.`
    : 'Apartamiento pendiente de subir soportes médicos (sin límite de tiempo).';
}

export function extraerLimiteApartadoMs(
  cita: Pick<CitaMedica, 'id' | 'observacionAdmin' | 'apartadoHastaMs'>,
  apartadosLocal?: Record<string, number>
): number | null {
  if (apartadosLocal?.[cita.id] && apartadosLocal[cita.id] > 0) {
    return apartadosLocal[cita.id];
  }
  if (cita.apartadoHastaMs && cita.apartadoHastaMs > 0) {
    return cita.apartadoHastaMs;
  }
  const m = cita.observacionAdmin?.match(/\[APARTADO_HASTA:(\d+)\]/);
  return m ? Number(m[1]) : null;
}

export function construirObservacionSolicitudDoc(
  tipoDoc: DocumentoSolicitadoTipo,
  mensajeLimpio: string
): string {
  return `[REQ_DOC:${tipoDoc}] ${mensajeLimpio.trim()}`;
}

export function extraerDocumentoSolicitado(
  observacion?: string
): DocumentoSolicitadoTipo | null {
  if (!observacion) return null;
  const m = observacion.match(/\[REQ_DOC:(orden|autorizacion|ambos)\]/i);
  return m ? (m[1].toLowerCase() as DocumentoSolicitadoTipo) : null;
}

export function limpiarEtiquetaApartado(observacion?: string): string {
  if (!observacion) return '';
  return observacion
    .replace(/\[APARTADO_HASTA:\d+\]\s*/g, '')
    .replace(/\[REQ_DOC:(orden|autorizacion|ambos)\]\s*/gi, '')
    .trim();
}

export function formatearCuentaRegresivaMs(msRestantes: number): string {
  const segTotal = Math.max(0, Math.ceil(msRestantes / 1000));
  const min = Math.floor(segTotal / 60);
  const seg = segTotal % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

export function determinarTipoAtencionCita(
  cita: Pick<CitaMedica, 'id' | 'especialidadNombre' | 'tipoAtencion'>,
  tiposLocal?: Record<string, TipoAtencionTipo>
): TipoAtencionTipo {
  if (tiposLocal?.[cita.id]) return tiposLocal[cita.id];
  if (cita.tipoAtencion) return cita.tipoAtencion;
  return cita.especialidadNombre?.includes('(Procedimiento)')
    ? 'procedimiento'
    : 'consulta';
}

export function esDuracionProcedimientoPorDefinir(
  cita: Pick<
    CitaMedica,
    | 'id'
    | 'especialidadNombre'
    | 'tipoAtencion'
    | 'estadoCita'
    | 'estadoDocumentos'
    | 'observacionAdmin'
  >,
  tiposLocal?: Record<string, TipoAtencionTipo>
): boolean {
  if (determinarTipoAtencionCita(cita, tiposLocal) !== 'procedimiento') {
    return false;
  }
  if (
    cita.estadoDocumentos === 'Aprobados' ||
    cita.estadoCita === 'Admitida en Sala' ||
    cita.estadoCita === 'Atendida'
  ) {
    return false;
  }
  if (cita.observacionAdmin && /duraci[oó]n/i.test(cita.observacionAdmin)) {
    return false;
  }
  return true;
}

export function formatearDuracionVisibleCita(
  cita: Pick<
    CitaMedica,
    | 'id'
    | 'especialidadNombre'
    | 'tipoAtencion'
    | 'estadoCita'
    | 'estadoDocumentos'
    | 'observacionAdmin'
    | 'duracionMin'
  >,
  tiposLocal?: Record<string, TipoAtencionTipo>
): string {
  return esDuracionProcedimientoPorDefinir(cita, tiposLocal)
    ? 'Duración por definir IPS'
    : formatearDuracionHumana(cita.duracionMin);
}

export function tieneSoportesCompletos(
  cita: Pick<
    CitaMedica,
    | 'especialidad'
    | 'pacienteClasificacion'
    | 'fotoOrdenUrl'
    | 'fotoAutorizacionUrl'
  >,
  tipoAtencion: TipoAtencionTipo
): boolean {
  const req = obtenerRequisitosDocumentos(
    cita.especialidad,
    cita.pacienteClasificacion,
    tipoAtencion
  );
  if (req.permiteAlMenosUno) {
    return Boolean(cita.fotoOrdenUrl || cita.fotoAutorizacionUrl);
  }
  if (req.requiereOrden && !cita.fotoOrdenUrl) return false;
  if (req.requiereAutorizacion && !cita.fotoAutorizacionUrl) return false;
  return true;
}

export function generarNumeroRecibo(metodoPago: MetodoPagoTipo): string {
  const rnd = Math.floor(100000 + Math.random() * 899999);
  if (metodoPago === 'Datáfono') return `REC-DAT-${rnd}`;
  if (metodoPago === 'Transferencia') return `REC-TRF-${rnd}`;
  if (metodoPago === 'Efectivo') return `REC-EFE-${rnd}`;
  return `REC-EXE-${rnd}`;
}

export function construirIdAuxiliarParaEspecialidad(
  especialidadId: EspecialidadId
): string {
  return `aux_${especialidadId}`;
}

export function obtenerAlternativasPorDescanso(
  medicoDescansando: MedicoBase,
  fechaIso: string,
  todosMedicos: MedicoBase[],
  descansosMap: Record<string, DiaSemanaNum>,
  auxiliarConfig: AuxiliarTurnoConfig,
  citasFecha: CitaMedica[],
  topeMaximoCitas: number
): {
  colegasDisponibles: (MedicoBase & { citasEseDia: number })[];
  auxiliarDisponible: (MedicoBase & { citasEseDia: number }) | null;
} {
  const diaSemana = obtenerDiaSemanaIso(fechaIso);
  const activas = citasFecha.filter(
    (c) => c.estadoCita !== 'Cancelada' && c.estadoCita !== 'No asistió'
  );

  const colegasDisponibles = todosMedicos
    .filter(
      (m) =>
        m.especialidad === medicoDescansando.especialidad &&
        m.id !== medicoDescansando.id &&
        (descansosMap[m.id] ?? -1) !== diaSemana
    )
    .map((m) => ({
      ...m,
      citasEseDia: activas.filter((c) => c.medicoId === m.id).length,
    }))
    .filter((m) => m.citasEseDia < topeMaximoCitas);

  let auxiliarDisponible: (MedicoBase & { citasEseDia: number }) | null = null;
  if (auxiliarConfig.activo) {
    const auxId = construirIdAuxiliarParaEspecialidad(
      medicoDescansando.especialidad
    );
    const citasAux = activas.filter((c) => c.medicoId === auxId).length;
    if (citasAux < topeMaximoCitas) {
      auxiliarDisponible = {
        id: auxId,
        codigo: auxiliarConfig.codigo,
        nombre: `${auxiliarConfig.nombre} (Suplente)`,
        especialidad: medicoDescansando.especialidad,
        consultorio: auxiliarConfig.consultorio || medicoDescansando.consultorio,
        citasEseDia: citasAux,
      };
    }
  }

  return { colegasDisponibles, auxiliarDisponible };
}

export function mapearPacienteDesdeFila(r: RowRecord): Paciente {
  const ced = String(r.cedula);
  return {
    cedula: ced,
    nombres: String(r.nombres),
    apellidos: String(r.apellidos),
    telefono: String(r.telefono),
    correo: String(r.correo),
    eps: String(r.eps),
    clasificacion: String(r.clasificacion),
    estadoAfiliacion: r.estado_afiliacion as 'Activo' | 'Sin EPS / En trámite',
    pin: r.pin ? String(r.pin) : ced.slice(-4),
    aceptoHabeasData: Boolean(r.acepto_habeas_data ?? true),
    fechaHabeasData: String(r.fecha_habeas_data || 'Registrado'),
    esNuevo: true,
  };
}

export function mapearCitaDesdeFila(r: RowRecord): CitaMedica {
  const createdRaw = r.created_at ? Date.parse(String(r.created_at)) : NaN;
  return {
    id: String(r.id),
    pacienteCedula: String(r.paciente_cedula),
    pacienteNombre: String(r.paciente_nombre),
    pacienteEps: String(r.paciente_eps),
    pacienteClasificacion: String(r.paciente_clasificacion),
    especialidad: String(r.especialidad),
    especialidadNombre: String(r.especialidad_nombre),
    tipoAtencion:
      r.tipo_atencion === 'procedimiento' || r.tipo_atencion === 'consulta'
        ? r.tipo_atencion
        : undefined,
    procedimientoId: (r.procedimiento_id as string) || undefined,
    procedimientoNombre: (r.procedimiento_nombre as string) || undefined,
    procedimientoPersonalizado:
      r.procedimiento_personalizado != null
        ? Boolean(r.procedimiento_personalizado)
        : undefined,
    procedimientoDetalle: (r.procedimiento_detalle as string) || undefined,
    valorBaseProcedimiento:
      r.valor_base_procedimiento != null
        ? Number(r.valor_base_procedimiento)
        : undefined,
    costoPendiente:
      r.costo_pendiente != null ? Boolean(r.costo_pendiente) : undefined,
    medicoId: String(r.medico_id),
    medicoNombre: String(r.medico_nombre),
    medicoCodigo: String(r.medico_codigo),
    fecha: String(r.fecha),
    hora: String(r.hora),
    duracionMin: Number(r.duracion_min),
    valorCopago: Number(r.valor_copago),
    metodoPago: (r.metodo_pago as MetodoPagoTipo) || undefined,
    reciboNumero: (r.recibo_numero as string) || undefined,
    estadoCita: r.estado_cita as EstadoCitaTipo,
    estadoDocumentos: r.estado_documentos as CitaMedica['estadoDocumentos'],
    fotoOrdenUrl: (r.foto_orden_url as string) || undefined,
    fotoOrdenNombre: (r.foto_orden_nombre as string) || undefined,
    fotoAutorizacionUrl: (r.foto_autorizacion_url as string) || undefined,
    fotoAutorizacionNombre: (r.foto_autorizacion_nombre as string) || undefined,
    observacionAdmin: (r.observacion_admin as string) || undefined,
    motivoConsulta: (r.motivo_consulta as string) || undefined,
    calificacionSatisfaccion:
      r.calificacion_satisfaccion != null
        ? Number(r.calificacion_satisfaccion)
        : undefined,
    calificacionEspera:
      r.calificacion_espera != null ? Number(r.calificacion_espera) : undefined,
    calificacionTrato:
      r.calificacion_trato != null ? Number(r.calificacion_trato) : undefined,
    calificacionClaridad:
      r.calificacion_claridad != null
        ? Number(r.calificacion_claridad)
        : undefined,
    comentarioSatisfaccion: (r.comentario_satisfaccion as string) || undefined,
    medicoAnteriorId: (r.medico_anterior_id as string) || undefined,
    fechaAnterior: (r.fecha_anterior as string) || undefined,
    motivoReprogramacion: (r.motivo_reprogramacion as string) || undefined,
    reprogramacionesCount:
      r.reprogramaciones_count != null ? Number(r.reprogramaciones_count) : 0,
    fechaCreacion: String(r.fecha_creacion),
    createdAtMs: Number.isFinite(createdRaw) ? createdRaw : undefined,
    correosEnviadosCount:
      r.correos_enviados_count != null
        ? Number(r.correos_enviados_count)
        : undefined,
    ultimoCorreoEnviadoMs:
      r.ultimo_correo_enviado_ms != null
        ? Number(r.ultimo_correo_enviado_ms)
        : undefined,
  };
}

const MAPA_ACCION_AUDITORIA_A_TIPO_CORREO: Record<string, string> = {
  'Recordatorio Correo': 'Recordatorio de cita',
  'Recordatorio Automático 24h': 'Recordatorio automático 24h',
  'Duración Asignada + Correo': 'Duración clínica asignada',
  'Duración y Costo Asignados + Correo': 'Costo y duración asignados',
  'Docs Aprobados': 'Docs aprobados',
  'Docs No Legibles / Reenviar': 'Docs no legibles / reenviar',
  'Solicitud Docs Correo': 'Solicitud de soportes',
  'Reprogramación Real': 'Reprogramación de cita',
  'Cita Cancelada': 'Aviso de cancelación',
  'Cita Atendida': 'Recibo de caja',
  'Nota Clínica Médico': 'Nota clínica médica',
  'Cita Agendada + Factura': 'Pre-factura / Confirmación',
  'Apartamiento 15 min': 'Apartamiento / Pre-factura',
  'Apartamiento Cita': 'Apartamiento / Pre-factura',
};

export function inferirTipoEnvioCorreoDesdeAuditoria(
  citaId: string,
  auditoria: RegistroAuditoria[]
): string | undefined {
  if (!citaId || !auditoria?.length) return undefined;
  const escaped = citaId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patron = new RegExp(`(^|[^A-Za-z0-9-])${escaped}([^A-Za-z0-9-]|$)`);
  for (const reg of auditoria) {
    const tipo = MAPA_ACCION_AUDITORIA_A_TIPO_CORREO[reg.accion];
    if (tipo && patron.test(reg.detalle || '')) {
      return tipo;
    }
  }
  return undefined;
}

export interface ParametrosReporteExcel {
  citas: CitaMedica[];
  verCedulaCompleta: boolean;
  fechaGeneracion: string;
  tiposAtencionCitas?: Record<string, TipoAtencionTipo>;
  recibosCitas?: Record<string, string>;
  obtenerConsultorio: (medicoId: string) => string;
  medicosLista?: MedicoBase[];
}

function describirSoportesParaExcel(c: CitaMedica): string {
  const partes: string[] = [];
  if (c.fotoOrdenUrl) {
    const tipo = esArchivoPdf(c.fotoOrdenNombre, c.fotoOrdenUrl)
      ? 'PDF'
      : 'Imagen';
    partes.push(`Orden (${tipo})`);
  }
  if (c.fotoAutorizacionUrl) {
    const tipo = esArchivoPdf(c.fotoAutorizacionNombre, c.fotoAutorizacionUrl)
      ? 'PDF'
      : 'Imagen';
    partes.push(`Autorización (${tipo})`);
  }
  const base = partes.length > 0 ? partes.join(' + ') : 'Sin soportes';
  const reqDoc = extraerDocumentoSolicitado(c.observacionAdmin);
  if (!reqDoc) return base;
  const etiquetaReq =
    reqDoc === 'ambos'
      ? 'Orden + Autorización'
      : reqDoc === 'orden'
      ? 'Orden médica'
      : 'Autorización EPS';
  return `${base} · Solicitado: ${etiquetaReq}`;
}

export function construirHtmlReporteExcel({
  citas,
  verCedulaCompleta,
  fechaGeneracion,
  tiposAtencionCitas,
  recibosCitas,
  obtenerConsultorio,
  medicosLista,
}: ParametrosReporteExcel): string {
  const citasAtendidas = citas.filter((c) => c.estadoCita === 'Atendida');
  const recaudoTotalConfirmado = citasAtendidas.reduce(
    (acc, c) => acc + (Number(c.valorCopago) || 0),
    0
  );
  const recaudoEfectivo = citasAtendidas
    .filter((c) => c.metodoPago === 'Efectivo')
    .reduce((acc, c) => acc + (Number(c.valorCopago) || 0), 0);
  const recaudoDatafono = citasAtendidas
    .filter((c) => c.metodoPago === 'Datáfono')
    .reduce((acc, c) => acc + (Number(c.valorCopago) || 0), 0);
  const recaudoTransferencia = citasAtendidas
    .filter((c) => c.metodoPago === 'Transferencia')
    .reduce((acc, c) => acc + (Number(c.valorCopago) || 0), 0);
  const exentasAtendidasCount = citasAtendidas.filter(
    (c) => (Number(c.valorCopago) || 0) === 0
  ).length;
  const recaudoPendienteCaja = citas
    .filter(
      (c) =>
        (c.estadoCita === 'Pre-admitida' ||
          c.estadoCita === 'Admitida en Sala' ||
          c.estadoCita === 'Reprogramada') &&
        !c.costoPendiente
    )
    .reduce((acc, c) => acc + (Number(c.valorCopago) || 0), 0);
  const citasPorDefinirCount = citas.filter(
    (c) =>
      Boolean(c.costoPendiente) &&
      c.estadoCita !== 'Cancelada' &&
      c.estadoCita !== 'No asistió'
  ).length;

  const conteoEstados: Record<EstadoCitaTipo, number> = {
    'Pre-admitida': 0,
    'Admitida en Sala': 0,
    Atendida: 0,
    Reprogramada: 0,
    Cancelada: 0,
    'No asistió': 0,
  };
  citas.forEach((c) => {
    if (conteoEstados[c.estadoCita] != null) {
      conteoEstados[c.estadoCita] += 1;
    }
  });

  const docsPendientesOObservados = citas.filter(
    (c) =>
      c.estadoCita !== 'Cancelada' &&
      c.estadoCita !== 'No asistió' &&
      c.estadoDocumentos !== 'Aprobados'
  ).length;

  const calificadas = citas.filter(
    (c) =>
      typeof c.calificacionSatisfaccion === 'number' &&
      c.calificacionSatisfaccion > 0
  );
  const promedioGlobalSatisf =
    calificadas.length > 0
      ? (
          calificadas.reduce(
            (acc, c) => acc + (c.calificacionSatisfaccion || 0),
            0
          ) / calificadas.length
        ).toFixed(2)
      : 'Sin calificar';

  const fmtMoneda = (n: number) => `$${n.toLocaleString('es-CO')} COP`;
  const totalCols = 32;

  const filas =
    citas.length === 0
      ? `<tr><td colspan="${totalCols}" style="text-align:center;color:#64748b">No hay citas registradas para exportar.</td></tr>`
      : citas
          .map((c, i) => {
            const ced = verCedulaCompleta
              ? c.pacienteCedula
              : enmascararTextoSensible(c.pacienteCedula, 'cedula');
            const tipoAt = determinarTipoAtencionCita(c, tiposAtencionCitas);
            const tipoTexto =
              tipoAt === 'procedimiento' ? 'Procedimiento' : 'Consulta';
            const espInfo = ESPECIALIDADES.find((e) => e.id === c.especialidad);
            const areaNombre =
              AREAS_SERVICIO.find((a) => a.id === espInfo?.areaId)?.nombre ||
              'Área Clínica';
            const procBase = c.procedimientoNombre
              ? `${c.procedimientoNombre}${
                  c.procedimientoPersonalizado ? ' (Personalizado)' : ''
                }`
              : tipoAt === 'procedimiento'
              ? 'Procedimiento general'
              : 'Consulta médica';
            const procTexto = c.procedimientoDetalle
              ? `${procBase} — ${c.procedimientoDetalle}`
              : procBase;
            const duracionTexto = esDuracionProcedimientoPorDefinir(
              c,
              tiposAtencionCitas
            )
              ? 'Por definir IPS'
              : String(Number(c.duracionMin) || 0);
            const reciboNum = recibosCitas?.[c.id] || c.reciboNumero || '—';
            const valorNum = Number(c.valorCopago) || 0;
            const metodoPagoTexto = c.costoPendiente
              ? 'Por definir N2/N3'
              : c.metodoPago || (valorNum === 0 ? 'Exento ($0)' : 'Pendiente');
            const estadoRecaudo =
              c.estadoCita === 'Atendida'
                ? valorNum === 0
                  ? 'Atendida (Exento $0)'
                  : 'Recaudo Confirmado'
                : c.costoPendiente
                ? 'Costo por definir (N2/N3)'
                : c.estadoCita === 'Cancelada' || c.estadoCita === 'No asistió'
                ? 'No recaudado (Cerrada)'
                : valorNum === 0
                ? 'Exento ($0)'
                : 'Pendiente Caja';
            const reprogramacionesTexto =
              (c.reprogramacionesCount || 0) > 0 || c.motivoReprogramacion
                ? `${c.reprogramacionesCount || 1}x${
                    c.fechaAnterior ? ` · Ant: ${c.fechaAnterior}` : ''
                  }${
                    c.motivoReprogramacion
                      ? ` · ${c.motivoReprogramacion}`
                      : ''
                  }`
                : '0';
            const observacionTexto =
              limpiarEtiquetaApartado(c.observacionAdmin) || 'Sin novedad';
            const soportesTexto = describirSoportesParaExcel(c);
            return `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
          <td style="mso-number-format:'\\@'">${escaparHtml(c.id)}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(c.fecha)}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(c.hora)}</td>
          <td>${escaparHtml(tipoTexto)}</td>
          <td>${escaparHtml(areaNombre)}</td>
          <td>${escaparHtml(c.especialidadNombre)}</td>
          <td>${escaparHtml(procTexto)}</td>
          <td style="text-align:center">${escaparHtml(duracionTexto)}</td>
          <td>${escaparHtml(c.pacienteNombre)}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(ced)}</td>
          <td>${escaparHtml(c.pacienteEps)}</td>
          <td>${escaparHtml(c.pacienteClasificacion)}</td>
          <td>${escaparHtml(c.medicoNombre)}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(
            c.medicoCodigo || '—'
          )}</td>
          <td>${escaparHtml(obtenerConsultorio(c.medicoId))}</td>
          <td>${escaparHtml(c.estadoCita)}</td>
          <td>${escaparHtml(c.estadoDocumentos)}</td>
          <td>${escaparHtml(soportesTexto)}</td>
          <td>${escaparHtml(c.motivoConsulta || '—')}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(reciboNum)}</td>
          <td>${escaparHtml(metodoPagoTexto)}</td>
          <td style="mso-number-format:'#,##0';text-align:right">${
            c.costoPendiente ? 0 : valorNum
          }</td>
          <td><b>${escaparHtml(estadoRecaudo)}</b></td>
          <td style="text-align:center">${c.calificacionEspera ?? '—'}</td>
          <td style="text-align:center">${c.calificacionTrato ?? '—'}</td>
          <td style="text-align:center">${c.calificacionClaridad ?? '—'}</td>
          <td style="text-align:center">${
            c.calificacionSatisfaccion ?? 'Sin calificar'
          }</td>
          <td>${escaparHtml(c.comentarioSatisfaccion || '—')}</td>
          <td>${escaparHtml(reprogramacionesTexto)}</td>
          <td>${escaparHtml(observacionTexto)}</td>
          <td style="text-align:center">${c.correosEnviadosCount ?? 0}</td>
          <td style="mso-number-format:'\\@'">${escaparHtml(
            c.fechaCreacion || '—'
          )}</td>
        </tr>`;
          })
          .join('');

  const resumenEstadosRows = (
    [
      ['Pre-admitida', conteoEstados['Pre-admitida']],
      ['Admitida en Sala', conteoEstados['Admitida en Sala']],
      ['Atendida', conteoEstados['Atendida']],
      ['Reprogramada', conteoEstados['Reprogramada']],
      ['Cancelada', conteoEstados['Cancelada']],
      ['No asistió', conteoEstados['No asistió']],
    ] as [EstadoCitaTipo, number][]
  )
    .map(
      ([estado, cant]) =>
        `<tr><td colspan="3">${escaparHtml(
          estado
        )}</td><td style="text-align:center;font-weight:bold">${cant}</td><td colspan="4">${
          citas.length > 0 ? `${Math.round((cant / citas.length) * 100)}%` : '0%'
        }</td></tr>`
    )
    .join('');

  const especialistasTexto = medicosLista
    ? ` · Especialistas Activos: ${medicosLista.length}`
    : '';

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><style>body{font-family:Calibri,Arial}table{border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:5px 8px;font-size:10.5pt;vertical-align:top}th{background:#0284c7;color:#ffffff;font-weight:bold}</style></head><body><table><thead>
      <tr><th colspan="${totalCols}" style="background:#0f766e;font-size:13pt">IPS SALUD VIVA · REPORTE INTEGRAL DE CITAS, RECAUDO Y AUDITORÍA (${escaparHtml(
        fechaGeneracion
      )})</th></tr>
      <tr><td colspan="${totalCols}" style="background:#ecfdf5;color:#065f46;font-weight:bold">RECAUDO CONFIRMADO (CITAS ATENDIDAS): ${escaparHtml(
        fmtMoneda(recaudoTotalConfirmado)
      )} · Atendidas: ${citasAtendidas.length} (Efectivo: ${escaparHtml(
    fmtMoneda(recaudoEfectivo)
  )} | Datáfono: ${escaparHtml(
    fmtMoneda(recaudoDatafono)
  )} | Transferencia: ${escaparHtml(
    fmtMoneda(recaudoTransferencia)
  )} | Exentas $0: ${exentasAtendidasCount}) · Pendiente en Caja: ${escaparHtml(
    fmtMoneda(recaudoPendienteCaja)
  )} · Costo por definir N2/N3: ${citasPorDefinirCount}</td></tr>
      <tr><td colspan="${totalCols}" style="background:#f0f9ff;color:#0c4a6e;font-weight:bold">RESUMEN OPERATIVO: Total Citas: ${
    citas.length
  } · Pre-admitidas: ${conteoEstados['Pre-admitida']} · En Sala: ${
    conteoEstados['Admitida en Sala']
  } · Reprogramadas: ${conteoEstados['Reprogramada']} · Canceladas: ${
    conteoEstados['Cancelada']
  } · No asistió: ${
    conteoEstados['No asistió']
  } · Docs Pendientes/Observados: ${docsPendientesOObservados} · Satisfacción Global: ${escaparHtml(
    promedioGlobalSatisf
  )}${calificadas.length > 0 ? `/5 (${calificadas.length} eval.)` : ''}${escaparHtml(
    especialistasTexto
  )}</td></tr>
      <tr><th>ID Cita</th><th>Fecha Cita</th><th>Hora</th><th>Tipo Atención</th><th>Área / Servicio</th><th>Especialidad</th><th>Procedimiento / Detalle</th><th>Duración (min)</th><th>Paciente</th><th>Cédula</th><th>EPS</th><th>Afiliación</th><th>Médico</th><th>Código Médico</th><th>Consultorio</th><th>Estado Cita</th><th>Docs</th><th>Soportes Adjuntos / Solicitados</th><th>Motivo / Síntomas Paciente</th><th>N.° Recibo</th><th>Método Pago</th><th>Valor (COP)</th><th>Estado Recaudo</th><th>Espera</th><th>Trato</th><th>Claridad</th><th>Prom. Satisf.</th><th>Comentario Satisf.</th><th>Reprogramaciones</th><th>Observación Admin / Nota Médica</th><th>Correos Enviados</th><th>Fecha Registro</th></tr>
    </thead><tbody>${filas}
      <tr style="background:#d1fae5;font-weight:bold"><td colspan="21">RECAUDO CONFIRMADO (CITAS ATENDIDAS: ${
        citasAtendidas.length
      })</td><td style="mso-number-format:'#,##0';text-align:right">${recaudoTotalConfirmado}</td><td colspan="10">Confirmado en Caja · SGSSS IPS Salud Viva</td></tr>
      <tr style="background:#f8fafc"><td colspan="21">Desglose Recaudo Confirmado → Efectivo: ${escaparHtml(
        fmtMoneda(recaudoEfectivo)
      )} | Datáfono: ${escaparHtml(
    fmtMoneda(recaudoDatafono)
  )} | Transferencia: ${escaparHtml(
    fmtMoneda(recaudoTransferencia)
  )} | Exentas ($0): ${exentasAtendidasCount}</td><td style="mso-number-format:'#,##0';text-align:right">${recaudoPendienteCaja}</td><td colspan="10">Pendiente por recaudar en citas activas (Por definir N2/N3: ${citasPorDefinirCount})</td></tr>
    </tbody></table><br/><table><thead>
      <tr><th colspan="8" style="background:#0f766e">RESUMEN OPERATIVO POR ESTADO DE CITA</th></tr>
      <tr><th colspan="3">Estado</th><th>Cantidad</th><th colspan="4">Participación (%)</th></tr>
    </thead><tbody>${resumenEstadosRows}</tbody></table></body></html>`;
}


