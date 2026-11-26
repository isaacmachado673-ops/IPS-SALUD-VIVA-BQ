import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ADMINISTRADORES_BASE_SISTEMA,
  AREAS_SERVICIO,
  AUXILIAR_TURNO_DEFAULT,
  DESCRIPCIONES_POR_NIVEL,
  ESPECIALIDADES,
  MEDICOS_BASE,
  PACIENTES_BASE_SISTEMA,
  PROCEDIMIENTOS_CATALOGO,
  PROCEDIMIENTO_PERSONALIZADO_ID,
  calcularHoraFinEstimada,
  calcularHoraLlegadaRecomendada,
  calcularLiquidacionDesdeValorBase,
  calcularValorConsulta,
  construirHtmlReporteExcel,
  construirMapaDescansosPorDefecto,
  construirObservacionSolicitudDoc,
  determinarTipoAtencionCita,
  enmascararTextoSensible,
  esArchivoPdf,
  escaparHtml,
  esCitaVencidaSinLlegada,
  extraerDocumentoSolicitado,
  fechaHoraCompletaFormateada,
  formatearClasificacion,
  formatearDuracionHumana,
  formatearDuracionVisibleCita,
  formatearFechaLegible,
  generarFranjasHorariasDisponibles,
  generarNumeroRecibo,
  hayCruceHorario,
  horaActualFormateada,
  limpiarEtiquetaApartado,
  mapearCitaDesdeFila,
  mapearPacienteDesdeFila,
  normalizarNivelAdmin,
  obtenerAlternativasPorDescanso,
  obtenerDiaSemanaIso,
  obtenerDuracionProcedimientoPorDefecto,
  obtenerEtiquetaConceptoPago,
  obtenerFechaLocalISO,
  obtenerNombreDiaSemana,
  obtenerPinDefaultMedico,
  obtenerProcedimientoPorId,
  obtenerProcedimientosPorArea,
  obtenerRequisitosDocumentos,
  obtenerTarifaProcedimientoCatalogo,
  obtenerTipoAtencionPorDefecto,
  obtenerValorReferencialProcedimiento,
  ordenarCitasCronologicamente,
  parsearClasificacion,
  procesarArchivoSoporte,
  validarPinMedico,
  type AreaServicioId,
  type ArchivoFotoTemp,
  type AuxiliarTurnoConfig,
  type CitaMedica,
  type ConfirmacionModalData,
  type CorreosMetaCita,
  type DiaSemanaNum,
  type DocumentoSolicitadoTipo,
  type EspecialidadId,
  type EspecialidadInfo,
  type EstadoCitaTipo,
  type MedicoBase,
  type MedicoConOcupacion,
  type MensajeChat,
  type MetodoPagoTipo,
  type NivelAdmin,
  type OpcionChat,
  type Paciente,
  type PasoChat,
  type RangoAfiliacionTipo,
  type RegimenTipo,
  type RegistroAuditoria,
  type RowRecord,
  type TarifasConfig,
  type TipoAfiliacionTipo,
  type TipoAtencionTipo,
  type UsuarioAdministrativo,
} from './data/saludVivaData';
import {
  CORREO_INSTITUCIONAL,
  construirHtmlFacturaORecibo,
  construirHtmlNotificacionCita,
  construirHtmlPinTemporal,
  enviarCorreoAppsScript,
} from './services/mailer';
import {
  Ic,
  IconHeartPulse,
  ModalConfirmacion,
  ModalFacturaRecibo,
  ModalImagenSoporte,
  ModalReprogramacion,
  ModalTirillaQr,
} from './components/uiShared';
import { LoginView } from './components/LoginView';
import {
  AsistenteVirtualView,
  MisCitasView,
  type AlertaDescansoChat,
} from './components/PatientViews';
import { MedicoPanelView } from './components/MedicoView';
import { AdminPanelView } from './components/AdminViews';
import { ContactoView, NormativaSgsssView } from './components/InfoViews';

const SUPABASE_URL = 'https://sxgcvrksrtahdhxopkgo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xSa_DvWi5DRHN4u_54tLPw_lEq7Dj9P';
const SUPABASE_HEADERS: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};
const sb = (path: string, method = 'GET', body?: unknown, upsert = false) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: upsert
      ? {
          ...SUPABASE_HEADERS,
          Prefer: 'resolution=merge-duplicates,return=representation',
        }
      : SUPABASE_HEADERS,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

const LS_DESCANSOS_KEY = 'ips_descansos_medicos_v1';
const LS_AUXILIAR_KEY = 'ips_auxiliar_turno_v1';
const LS_TARIFAS_PART_KEY = 'ips_tarifas_particulares_v1';
const LS_TARIFAS_PROC_KEY = 'ips_tarifas_procedimientos_v1';
const LS_TARIFAS_CATALOGO_PROC_KEY = 'ips_tarifas_catalogo_proc_v1';
const LS_RECIBOS_KEY = 'ips_recibos_citas_v1';
const LS_TIPOS_ATENCION_KEY = 'ips_tipos_atencion_citas_v1';
const LS_APARTADOS_KEY = 'ips_apartados_docs_v1';
const LS_CORREOS_META_KEY = 'ips_correos_meta_v1';
const LS_MOTIVOS_CITAS_KEY = 'ips_motivos_citas_v1';
const LS_AUTO_REC_24H_KEY = 'ips_auto_rec_24h_v1';
const LS_AUTO_REC_ACTIVO_KEY = 'ips_auto_rec_activo_v1';
const LS_MEDICOS_PERFIL_KEY = 'ips_medicos_perfil_v1';
const COOLDOWN_CORREO_ADMIN_MS = 60_000;

async function sbCitaConFallback(
  path: string,
  method: 'POST' | 'PATCH',
  payloadCompleto: Record<string, unknown>,
  camposOpcionales: string[]
) {
  const res = await sb(path, method, payloadCompleto);
  if (res.ok) return res;
  const txt = await res.clone().text().catch(() => '');
  if (res.status === 400 || res.status === 404 || txt.includes('column')) {
    const reducido = { ...payloadCompleto };
    camposOpcionales.forEach((k) => delete reducido[k]);
    return sb(path, method, reducido);
  }
  return res;
}

async function guardarMedicoConFallback(
  id: string,
  payloadCompleto: Record<string, unknown>
): Promise<{ ok: boolean; soloBaseNube: boolean }> {
  const path = `medicos?id=eq.${encodeURIComponent(id)}`;
  const res = await sb(path, 'PATCH', payloadCompleto);
  if (res.ok) return { ok: true, soloBaseNube: false };
  const txt = (await res.clone().text().catch(() => '')).toLowerCase();
  if (res.status === 400 || res.status === 404 || txt.includes('column')) {
    const { pin: _p, telefono: _t, correo: _c, ...soloBase } = payloadCompleto;
    const resBase = await sb(path, 'PATCH', soloBase);
    return { ok: resBase.ok, soloBaseNube: resBase.ok };
  }
  return { ok: false, soloBaseNube: false };
}

function leerJsonLocal<T>(clave: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function subirSoporteStorage(
  cedula: string,
  citaId: string,
  tipo: 'orden' | 'autorizacion',
  archivo: ArchivoFotoTemp
): Promise<string> {
  try {
    const blob = archivo.blob || (await (await fetch(archivo.url)).blob());
    const esPdf = esArchivoPdf(
      archivo.nombre || archivo.url,
      archivo.mimeType || blob.type
    );
    const ext = esPdf ? 'pdf' : 'jpg';
    const contentType = esPdf ? 'application/pdf' : 'image/jpeg';
    const ruta = `${encodeURIComponent(cedula)}/${encodeURIComponent(
      citaId
    )}/${tipo}_${Date.now()}.${ext}`;
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/soportes-citas/${ruta}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: blob,
      }
    );
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/soportes-citas/${ruta}`;
    }
  } catch (err) {
    console.error('Error Storage:', err);
  }
  return archivo.url;
}

async function guardarPacienteConPinSeguro(
  path: string,
  method: string,
  payload: Record<string, unknown>,
  upsert = false
): Promise<Response> {
  const res = await sb(path, method, payload, upsert);
  if (!res.ok && (await res.clone().text()).toLowerCase().includes('pin')) {
    const { pin: _omitido, ...sinPin } = payload;
    return sb(path, method, sinPin, upsert);
  }
  return res;
}

export default function App() {
  const [pacientes, setPacientes] = useState<Paciente[]>(
    PACIENTES_BASE_SISTEMA
  );
  const [administradores, setAdministradores] = useState<
    UsuarioAdministrativo[]
  >(ADMINISTRADORES_BASE_SISTEMA);
  const [medicosPerfilLocal, setMedicosPerfilLocal] = useState<
    Record<
      string,
      Partial<
        Pick<
          MedicoBase,
          'nombre' | 'consultorio' | 'pin' | 'telefono' | 'correo'
        >
      >
    >
  >(() => leerJsonLocal(LS_MEDICOS_PERFIL_KEY, {}));
  const medicosPerfilLocalRef = useRef(medicosPerfilLocal);
  useEffect(() => {
    medicosPerfilLocalRef.current = medicosPerfilLocal;
    try {
      localStorage.setItem(
        LS_MEDICOS_PERFIL_KEY,
        JSON.stringify(medicosPerfilLocal)
      );
    } catch {
      /* ignore */
    }
  }, [medicosPerfilLocal]);

  const [medicosLista, setMedicosLista] = useState<MedicoBase[]>(() =>
    MEDICOS_BASE.map((m) => ({
      ...m,
      ...(leerJsonLocal<
        Record<
          string,
          Partial<
            Pick<
              MedicoBase,
              'nombre' | 'consultorio' | 'pin' | 'telefono' | 'correo'
            >
          >
        >
      >(LS_MEDICOS_PERFIL_KEY, {})[m.id] || {}),
    }))
  );
  const [citas, setCitas] = useState<CitaMedica[]>([]);
  const [nubeConectada, setNubeConectada] = useState(false);
  const [sincronizandoNube, setSincronizandoNube] = useState(false);
  const [ultimaSyncHora, setUltimaSyncHora] = useState('');
  const [toast, setToast] = useState<{
    tipo: 'ok' | 'error' | 'info';
    texto: string;
  } | null>(null);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>([
    {
      id: 'AUD-INIT',
      fechaHora: 'Hoy · 06:00 AM',
      usuario: 'Sistema IPS',
      rol: 'Cloud + Apps Script',
      accion: 'Inicio de Operación',
      detalle: `${ESPECIALIDADES.length} especialidades · ${MEDICOS_BASE.length} profesionales · Storage · 4 Niveles Admin.`,
    },
  ]);

  const [umbralAlertaAgendadas, setUmbralAlertaAgendadas] = useState(10);
  const [umbralAlertaAtendidas, setUmbralAlertaAtendidas] = useState(12);
  const [topeMaximoCitas, setTopeMaximoCitas] = useState(20);
  const [tarifas, setTarifas] = useState<TarifasConfig>({
    A: 4700,
    B: 19200,
    C: 50300,
    particular: 50000,
    particularProcedimiento: 75000,
  });

  const [descansosMedicos, setDescansosMedicos] = useState<
    Record<string, DiaSemanaNum>
  >(() => ({
    ...construirMapaDescansosPorDefecto(MEDICOS_BASE),
    ...leerJsonLocal<Record<string, DiaSemanaNum>>(LS_DESCANSOS_KEY, {}),
  }));
  const [auxiliarTurno, setAuxiliarTurno] = useState<AuxiliarTurnoConfig>(() =>
    leerJsonLocal<AuxiliarTurnoConfig>(LS_AUXILIAR_KEY, AUXILIAR_TURNO_DEFAULT)
  );
  const [tarifasParticulares, setTarifasParticulares] = useState<
    Record<string, number>
  >(() => leerJsonLocal<Record<string, number>>(LS_TARIFAS_PART_KEY, {}));
  const [tarifasProcedimientos, setTarifasProcedimientos] = useState<
    Record<string, number>
  >(() => leerJsonLocal<Record<string, number>>(LS_TARIFAS_PROC_KEY, {}));
  const [tarifasCatalogoProcedimientos, setTarifasCatalogoProcedimientos] =
    useState<Record<string, number>>(() =>
      leerJsonLocal<Record<string, number>>(LS_TARIFAS_CATALOGO_PROC_KEY, {})
    );
  const [recibosCitas, setRecibosCitas] = useState<Record<string, string>>(() =>
    leerJsonLocal<Record<string, string>>(LS_RECIBOS_KEY, {})
  );
  const [tiposAtencionCitas, setTiposAtencionCitas] = useState<
    Record<string, TipoAtencionTipo>
  >(() =>
    leerJsonLocal<Record<string, TipoAtencionTipo>>(LS_TIPOS_ATENCION_KEY, {})
  );
  const [apartadosDocs, setApartadosDocs] = useState<Record<string, number>>(
    () => leerJsonLocal<Record<string, number>>(LS_APARTADOS_KEY, {})
  );
  const [correosMetaCitas, setCorreosMetaCitas] = useState<
    Record<string, CorreosMetaCita>
  >(() =>
    leerJsonLocal<Record<string, CorreosMetaCita>>(LS_CORREOS_META_KEY, {})
  );
  const [motivosCitasLocal, setMotivosCitasLocal] = useState<
    Record<string, string>
  >(() => leerJsonLocal<Record<string, string>>(LS_MOTIVOS_CITAS_KEY, {}));
  const motivosCitasRef = useRef<Record<string, string>>(motivosCitasLocal);
  useEffect(() => {
    motivosCitasRef.current = motivosCitasLocal;
    try {
      localStorage.setItem(
        LS_MOTIVOS_CITAS_KEY,
        JSON.stringify(motivosCitasLocal)
      );
    } catch {
      /* ignore */
    }
  }, [motivosCitasLocal]);

  const [autoRecordatorios24hActivo, setAutoRecordatorios24hActivo] = useState<boolean>(
    () => leerJsonLocal<boolean>(LS_AUTO_REC_ACTIVO_KEY, true)
  );
  const [recordatorios24hEnviados, setRecordatorios24hEnviados] = useState<
    Record<string, string>
  >(() => leerJsonLocal<Record<string, string>>(LS_AUTO_REC_24H_KEY, {}));
  const [ejecutandoRecordatorios24h, setEjecutandoRecordatorios24h] =
    useState(false);
  const autoRecLockRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_AUTO_REC_ACTIVO_KEY,
        JSON.stringify(autoRecordatorios24hActivo)
      );
    } catch {
      /* ignore */
    }
  }, [autoRecordatorios24hActivo]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_AUTO_REC_24H_KEY,
        JSON.stringify(recordatorios24hEnviados)
      );
    } catch {
      /* ignore */
    }
  }, [recordatorios24hEnviados]);

  const [ahoraMs, setAhoraMs] = useState<number>(() => Date.now());
  const [soportesPendientesTemp, setSoportesPendientesTemp] = useState<
    Record<string, { orden?: ArchivoFotoTemp; autorizacion?: ArchivoFotoTemp }>
  >({});
  const [subiendoApartadoId, setSubiendoApartadoId] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(LS_DESCANSOS_KEY, JSON.stringify(descansosMedicos));
    } catch {
      /* ignore storage quota */
    }
  }, [descansosMedicos]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_AUXILIAR_KEY, JSON.stringify(auxiliarTurno));
    } catch {
      /* ignore */
    }
  }, [auxiliarTurno]);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_TARIFAS_PART_KEY,
        JSON.stringify(tarifasParticulares)
      );
    } catch {
      /* ignore */
    }
  }, [tarifasParticulares]);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_TARIFAS_PROC_KEY,
        JSON.stringify(tarifasProcedimientos)
      );
    } catch {
      /* ignore */
    }
  }, [tarifasProcedimientos]);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_TARIFAS_CATALOGO_PROC_KEY,
        JSON.stringify(tarifasCatalogoProcedimientos)
      );
    } catch {
      /* ignore */
    }
  }, [tarifasCatalogoProcedimientos]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_RECIBOS_KEY, JSON.stringify(recibosCitas));
    } catch {
      /* ignore */
    }
  }, [recibosCitas]);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_TIPOS_ATENCION_KEY,
        JSON.stringify(tiposAtencionCitas)
      );
    } catch {
      /* ignore */
    }
  }, [tiposAtencionCitas]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_APARTADOS_KEY, JSON.stringify(apartadosDocs));
    } catch {
      /* ignore */
    }
  }, [apartadosDocs]);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_CORREOS_META_KEY,
        JSON.stringify(correosMetaCitas)
      );
    } catch {
      /* ignore */
    }
  }, [correosMetaCitas]);

  const [mensajeConfigAdmin, setMensajeConfigAdmin] = useState('');
  const [mensajeTarifarioAdmin, setMensajeTarifarioAdmin] = useState('');
  const [guardandoTarifario, setGuardandoTarifario] = useState(false);
  const [mensajeTarifarioProcAdmin, setMensajeTarifarioProcAdmin] =
    useState('');
  const [guardandoTarifarioProc, setGuardandoTarifarioProc] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] =
    useState<ConfirmacionModalData | null>(null);
  const [ejecutandoConfirmacion, setEjecutandoConfirmacion] = useState(false);

  const [sesionActual, setSesionActual] = useState<
    | { tipo: 'paciente'; paciente: Paciente }
    | { tipo: 'medico'; medico: MedicoBase }
    | { tipo: 'admin'; admin: UsuarioAdministrativo }
    | null
  >(null);
  const [modoAccesoInicio, setModoAccesoInicio] = useState<
    'registrado' | 'nuevo' | 'medico' | 'admin'
  >('registrado');
  const [cedulaLogin, setCedulaLogin] = useState('');
  const [pinPacienteLogin, setPinPacienteLogin] = useState('');
  const [codigoMedicoLogin, setCodigoMedicoLogin] = useState('');
  const [pinMedicoLogin, setPinMedicoLogin] = useState('');
  const [notaClinicaTemp, setNotaClinicaTemp] = useState<Record<string, string>>(
    {}
  );
  const [guardandoCitaMedicoId, setGuardandoCitaMedicoId] = useState<
    string | null
  >(null);
  const [motivoConsultaTemp, setMotivoConsultaTemp] = useState('');
  const [recuperandoPin, setRecuperandoPin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);

  const [nuevoNombres, setNuevoNombres] = useState('');
  const [nuevoApellidos, setNuevoApellidos] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevoCedula, setNuevoCedula] = useState('');
  const [nuevoPinPaciente, setNuevoPinPaciente] = useState('');
  const [nuevoEps, setNuevoEps] = useState('SURA EPS');
  const [nuevoRegimen, setNuevoRegimen] =
    useState<RegimenTipo>('Contributivo');
  const [nuevoTipoAfiliacion, setNuevoTipoAfiliacion] =
    useState<TipoAfiliacionTipo>('Cotizante');
  const [nuevoRango, setNuevoRango] = useState<RangoAfiliacionTipo>('Rango A');
  const [aceptoHabeasDataNuevo, setAceptoHabeasDataNuevo] = useState(false);

  const [editandoPerfilPaciente, setEditandoPerfilPaciente] = useState(false);
  const [editPacCedula, setEditPacCedula] = useState('');
  const [editPacPin, setEditPacPin] = useState('');
  const [editPacNombres, setEditPacNombres] = useState('');
  const [editPacApellidos, setEditPacApellidos] = useState('');
  const [editPacTelefono, setEditPacTelefono] = useState('');
  const [editPacCorreo, setEditPacCorreo] = useState('');
  const [editPacEps, setEditPacEps] = useState('SURA EPS');
  const [editPacRegimen, setEditPacRegimen] =
    useState<RegimenTipo>('Contributivo');
  const [editPacTipoAfiliacion, setEditPacTipoAfiliacion] =
    useState<TipoAfiliacionTipo>('Cotizante');
  const [editPacRango, setEditPacRango] =
    useState<RangoAfiliacionTipo>('Rango A');
  const [mensajePerfilPaciente, setMensajePerfilPaciente] = useState('');

  const [cedulaAdminLogin, setCedulaAdminLogin] = useState('');
  const [pinAdmin, setPinAdmin] = useState('');
  const [intentosFallidosAdmin, setIntentosFallidosAdmin] = useState(0);
  const [segundosBloqueoAdmin, setSegundosBloqueoAdmin] = useState(0);

  const [pestanaActiva, setPestanaActiva] = useState<
    | 'asistente'
    | 'mis_citas'
    | 'medico_panel'
    | 'admin_panel'
    | 'normativa'
    | 'contacto'
  >('asistente');
  const [subTabAdmin, setSubTabAdmin] = useState<
    | 'kpi_alertas'
    | 'agendas_autorizaciones'
    | 'duracion_procedimientos'
    | 'admisiones'
    | 'parametrizacion'
  >('kpi_alertas');

  const [editandoPerfilMedico, setEditandoPerfilMedico] = useState(false);
  const [guardandoPerfilMedico, setGuardandoPerfilMedico] = useState(false);

  const editandoPerfilRef = useRef(false);
  const editandoPerfilMedicoRef = useRef(false);
  const enParametrizacionRef = useRef(false);
  useEffect(() => {
    editandoPerfilRef.current = editandoPerfilPaciente;
  }, [editandoPerfilPaciente]);
  useEffect(() => {
    editandoPerfilMedicoRef.current = editandoPerfilMedico;
  }, [editandoPerfilMedico]);
  useEffect(() => {
    enParametrizacionRef.current =
      sesionActual?.tipo === 'admin' &&
      pestanaActiva === 'admin_panel' &&
      subTabAdmin === 'parametrizacion';
  }, [sesionActual, pestanaActiva, subTabAdmin]);

  const mostrarToast = (tipo: 'ok' | 'error' | 'info', texto: string) => {
    setToast({ tipo, texto });
    setTimeout(
      () => setToast((prev) => (prev?.texto === texto ? null : prev)),
      5000
    );
  };

  const registrarAuditoria = useCallback(
    async (usuario: string, rol: string, accion: string, detalle: string) => {
      const nuevo: RegistroAuditoria = {
        id: `AUD-${Date.now()}-${Math.floor(10 + Math.random() * 89)}`,
        fechaHora: fechaHoraCompletaFormateada(),
        usuario,
        rol,
        accion,
        detalle,
      };
      setAuditoria((prev) => [nuevo, ...prev]);
      try {
        await sb('auditoria', 'POST', {
          id: nuevo.id,
          fecha_hora: nuevo.fechaHora,
          usuario: nuevo.usuario,
          rol: nuevo.rol,
          accion: nuevo.accion,
          detalle: nuevo.detalle,
        });
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const cargarDatosDesdeSupabase = useCallback(async (silencioso = false) => {
    if (!silencioso) setSincronizandoNube(true);
    try {
      const [
        resPac,
        resCitas,
        resAdmins,
        resMedicos,
        resAud,
        resConfig,
        resTarifasEsp,
        resTarifasProc,
      ] = await Promise.all([
        sb('pacientes?select=*'),
        sb('citas?select=*&order=created_at.desc'),
        sb('administradores?select=*'),
        sb('medicos?select=*&order=codigo.asc'),
        sb('auditoria?select=*&order=created_at.desc&limit=80'),
        sb('configuracion?id=eq.global&select=*'),
        sb('tarifas_especialidades?select=*'),
        sb('tarifas_procedimientos?select=*').catch(
          () => new Response(null, { status: 404 })
        ),
      ]);
      if (resPac.ok && resCitas.ok) {
        const dataPac: RowRecord[] = await resPac.json();
        const dataCitas: RowRecord[] = await resCitas.json();
        const mapaPac = new Map<string, Paciente>();
        PACIENTES_BASE_SISTEMA.forEach((p) => mapaPac.set(p.cedula, p));
        (dataPac || []).forEach((r) =>
          mapaPac.set(String(r.cedula), mapearPacienteDesdeFila(r))
        );
        setPacientes(Array.from(mapaPac.values()));
        setSesionActual((prev) =>
          prev?.tipo === 'paciente' &&
          !editandoPerfilRef.current &&
          mapaPac.has(prev.paciente.cedula)
            ? { tipo: 'paciente', paciente: mapaPac.get(prev.paciente.cedula)! }
            : prev
        );
        const citasMapeadas = (dataCitas || []).map((fila) => {
          const mapped = mapearCitaDesdeFila(fila);
          return {
            ...mapped,
            motivoConsulta:
              mapped.motivoConsulta || motivosCitasRef.current[mapped.id],
          };
        });
        setTiposAtencionCitas((prev) => {
          const next = { ...prev };
          let cambio = false;
          citasMapeadas.forEach((c) => {
            if (c.tipoAtencion && next[c.id] !== c.tipoAtencion) {
              next[c.id] = c.tipoAtencion;
              cambio = true;
            }
          });
          return cambio ? next : prev;
        });
        setCorreosMetaCitas((prev) => {
          const next = { ...prev };
          let cambio = false;
          citasMapeadas.forEach((c) => {
            const remCount = c.correosEnviadosCount ?? 0;
            const remMs = c.ultimoCorreoEnviadoMs ?? 0;
            const loc = next[c.id];
            if (
              remCount > (loc?.count ?? 0) ||
              remMs > (loc?.lastMs ?? 0)
            ) {
              next[c.id] = {
                count: Math.max(remCount, loc?.count ?? 0),
                lastMs: Math.max(remMs, loc?.lastMs ?? 0),
                lastTipo: loc?.lastTipo,
                cooldownStartMs: Math.max(
                  remMs,
                  loc?.cooldownStartMs !== undefined
                    ? loc.cooldownStartMs
                    : loc?.lastMs ?? 0
                ),
              };
              cambio = true;
            }
          });
          return cambio ? next : prev;
        });
        setCitas(ordenarCitasCronologicamente(citasMapeadas));

        if (resAdmins.ok) {
          const dataAdmins: RowRecord[] = await resAdmins.json();
          if (Array.isArray(dataAdmins) && dataAdmins.length === 0) {
            await sb(
              'administradores',
              'POST',
              ADMINISTRADORES_BASE_SISTEMA.map((a) => ({
                cedula: a.cedula,
                nombre: a.nombre,
                rol_titulo: a.titulo,
                nivel: a.nivel,
                pin: a.pin,
              }))
            );
          }
          const mapaAdmins = new Map<string, UsuarioAdministrativo>();
          ADMINISTRADORES_BASE_SISTEMA.forEach((a) =>
            mapaAdmins.set(a.cedula, a)
          );
          (dataAdmins || []).forEach((r) => {
            const ced = String(r.cedula);
            const n =
              ced === '1004004004' && Number(r.nivel) === 4
                ? 3
                : normalizarNivelAdmin(Number(r.nivel) || 1);
            const info = DESCRIPCIONES_POR_NIVEL[n];
            mapaAdmins.set(ced, {
              cedula: ced,
              nombre: String(r.nombre),
              titulo: info.titulo,
              nivel: n,
              pin: String(r.pin),
              descripcion: info.descripcion,
              protegido: ced === '1005005005' || ced === '4004',
            });
          });
          setAdministradores(Array.from(mapaAdmins.values()));
        }

        if (resMedicos.ok) {
          const dataMeds: RowRecord[] = await resMedicos.json();
          const idsValidosEsp = new Set(ESPECIALIDADES.map((e) => e.id));
          const esCatalogoViejo =
            !Array.isArray(dataMeds) ||
            dataMeds.length === 0 ||
            !dataMeds.some((r) => String(r.id) === 'm155');

          const mapearConPerfilLocal = (r: RowRecord): MedicoBase => {
            const id = String(r.id);
            const loc = medicosPerfilLocalRef.current[id] || {};
            return {
              id,
              codigo: String(r.codigo),
              nombre: String(r.nombre || loc.nombre || ''),
              especialidad: String(r.especialidad),
              consultorio: String(r.consultorio || loc.consultorio || ''),
              pin: (r.pin ? String(r.pin) : undefined) || loc.pin,
              telefono:
                (r.telefono ? String(r.telefono) : undefined) || loc.telefono,
              correo: (r.correo ? String(r.correo) : undefined) || loc.correo,
            };
          };

          let listaMedsFinal: MedicoBase[] = MEDICOS_BASE;
          if (esCatalogoViejo) {
            try {
              await sb('medicos', 'POST', MEDICOS_BASE, true);
            } catch (err) {
              console.warn('Auto-sync catálogo 155 médicos:', err);
            }
            const personalizados = (dataMeds || [])
              .filter(
                (r) =>
                  String(r.id).startsWith('m-') &&
                  idsValidosEsp.has(String(r.especialidad))
              )
              .map(mapearConPerfilLocal);
            listaMedsFinal = [
              ...MEDICOS_BASE.map((m) => ({
                ...m,
                ...(medicosPerfilLocalRef.current[m.id] || {}),
              })),
              ...personalizados,
            ];
          } else {
            const limpios = dataMeds
              .filter((r) => idsValidosEsp.has(String(r.especialidad)))
              .map(mapearConPerfilLocal);
            listaMedsFinal =
              limpios.length > 0
                ? limpios
                : MEDICOS_BASE.map((m) => ({
                    ...m,
                    ...(medicosPerfilLocalRef.current[m.id] || {}),
                  }));
          }
          setMedicosLista(listaMedsFinal);
          setSesionActual((prev) => {
            if (prev?.tipo !== 'medico' || editandoPerfilMedicoRef.current)
              return prev;
            const actualizado = listaMedsFinal.find(
              (m) => m.id === prev.medico.id
            );
            return actualizado
              ? { tipo: 'medico', medico: actualizado }
              : prev;
          });
        }

        if (resAud.ok) {
          const dataAud: RowRecord[] = await resAud.json();
          if (Array.isArray(dataAud) && dataAud.length > 0) {
            setAuditoria(
              dataAud.map((r) => ({
                id: String(r.id),
                fechaHora: String(r.fecha_hora),
                usuario: String(r.usuario),
                rol: String(r.rol),
                accion: String(r.accion),
                detalle: String(r.detalle),
              }))
            );
          }
        }

        if (resConfig.ok && (!silencioso || !enParametrizacionRef.current)) {
          const dataCfg: RowRecord[] = await resConfig.json();
          if (Array.isArray(dataCfg) && dataCfg.length > 0) {
            const c = dataCfg[0];
            if (typeof c.umbral_alerta_agendadas === 'number')
              setUmbralAlertaAgendadas(c.umbral_alerta_agendadas);
            if (typeof c.umbral_alerta_atendidas === 'number')
              setUmbralAlertaAtendidas(c.umbral_alerta_atendidas);
            if (typeof c.tope_maximo_citas === 'number')
              setTopeMaximoCitas(c.tope_maximo_citas);
            setTarifas({
              A: Number(c.tarifa_a ?? 4700),
              B: Number(c.tarifa_b ?? 19200),
              C: Number(c.tarifa_c ?? 50300),
              particular: Number(c.tarifa_particular ?? 50000),
              particularProcedimiento: Number(
                c.tarifa_particular_procedimiento ?? 75000
              ),
            });
          }
        }

        if (
          resTarifasEsp.ok &&
          (!silencioso || !enParametrizacionRef.current)
        ) {
          const dataTar: RowRecord[] = await resTarifasEsp.json();
          if (Array.isArray(dataTar) && dataTar.length === 0) {
            const filasBase = ESPECIALIDADES.map((esp) => ({
              especialidad_id: esp.id,
              especialidad_nombre: esp.nombre,
              area_id: esp.areaId,
              tarifa_consulta: esp.tarifaParticular,
              tarifa_procedimiento: obtenerValorReferencialProcedimiento(
                esp.id
              ),
            }));
            try {
              await sb('tarifas_especialidades', 'POST', filasBase, true);
            } catch (err) {
              console.warn('Auto-sync tarifas_especialidades:', err);
            }
          } else if (Array.isArray(dataTar) && dataTar.length > 0) {
            const mapCons: Record<string, number> = {};
            const mapProc: Record<string, number> = {};
            dataTar.forEach((r) => {
              const id = String(r.especialidad_id);
              if (r.tarifa_consulta != null) {
                mapCons[id] = Number(r.tarifa_consulta);
              }
              if (r.tarifa_procedimiento != null) {
                mapProc[id] = Number(r.tarifa_procedimiento);
              }
            });
            setTarifasParticulares(mapCons);
            setTarifasProcedimientos(mapProc);
          }
        }

        if (
          resTarifasProc.ok &&
          (!silencioso || !enParametrizacionRef.current)
        ) {
          const dataTarProc: RowRecord[] = await resTarifasProc.json();
          if (Array.isArray(dataTarProc) && dataTarProc.length === 0) {
            const filasProcBase = PROCEDIMIENTOS_CATALOGO.map((proc) => ({
              procedimiento_id: proc.id,
              especialidad_id: proc.especialidadId,
              area_id: proc.areaId,
              nombre: proc.nombre,
              duracion_min: proc.duracionMin,
              tarifa_particular: proc.tarifaParticular,
              es_variable: Boolean(proc.esVariable),
              activo: true,
            }));
            try {
              await sb('tarifas_procedimientos', 'POST', filasProcBase, true);
            } catch (err) {
              console.warn('Auto-sync tarifas_procedimientos:', err);
            }
          } else if (Array.isArray(dataTarProc) && dataTarProc.length > 0) {
            const mapCatalogoProc: Record<string, number> = {};
            dataTarProc.forEach((r) => {
              const id = String(r.procedimiento_id);
              if (r.tarifa_particular != null) {
                mapCatalogoProc[id] = Number(r.tarifa_particular);
              }
            });
            setTarifasCatalogoProcedimientos(mapCatalogoProc);
          }
        }
        setNubeConectada(true);
        setUltimaSyncHora(horaActualFormateada());
      } else {
        setNubeConectada(false);
      }
    } catch (e) {
      console.error('Error Supabase:', e);
      setNubeConectada(false);
    } finally {
      if (!silencioso) setSincronizandoNube(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosDesdeSupabase(false);
  }, [cargarDatosDesdeSupabase]);
  useEffect(() => {
    const i = setInterval(() => cargarDatosDesdeSupabase(true), 8000);
    return () => clearInterval(i);
  }, [cargarDatosDesdeSupabase]);
  useEffect(() => {
    if (segundosBloqueoAdmin <= 0) return;
    const t = setInterval(
      () => setSegundosBloqueoAdmin((p) => (p <= 1 ? 0 : p - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [segundosBloqueoAdmin]);

  const esCitaOcupandoCupo = useCallback((c: CitaMedica, _ahora?: number) => {
    return c.estadoCita !== 'Cancelada' && c.estadoCita !== 'No asistió';
  }, []);

  const hayCooldownCorreoActivo =
    sesionActual?.tipo === 'admin' &&
    (Object.values(correosMetaCitas).some((m) => {
      const cdMs =
        m.cooldownStartMs !== undefined ? m.cooldownStartMs : m.lastMs;
      return cdMs > 0 && ahoraMs - cdMs < COOLDOWN_CORREO_ADMIN_MS;
    }) ||
      citas.some(
        (c) =>
          (c.ultimoCorreoEnviadoMs ?? 0) > 0 &&
          ahoraMs - (c.ultimoCorreoEnviadoMs ?? 0) < COOLDOWN_CORREO_ADMIN_MS
      ));

  useEffect(() => {
    if (!hayCooldownCorreoActivo) return;
    setAhoraMs(Date.now());
    const tick = setInterval(() => setAhoraMs(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [hayCooldownCorreoActivo]);

  const hoyIsoActual = obtenerFechaLocalISO(0);
  const maxFechaMesIso = obtenerFechaLocalISO(30);

  const medicos: MedicoConOcupacion[] = medicosLista.map((m) => {
    const duracionEsp =
      ESPECIALIDADES.find((e) => e.id === m.especialidad)?.duracionMin ?? 30;
    const esHoy = (f: string) => f === hoyIsoActual || f.startsWith('Hoy');
    const delMedHoy = citas.filter(
      (c) => c.medicoId === m.id && esHoy(c.fecha)
    );
    const vigentesHoy = delMedHoy.filter((c) =>
      esCitaOcupandoCupo(c, ahoraMs)
    );
    const franjasRestantes = generarFranjasHorariasDisponibles(
      duracionEsp,
      hoyIsoActual,
      vigentesHoy.map((c) => ({ hora: c.hora, duracionMin: c.duracionMin }))
    );
    return {
      ...m,
      citasHoy: vigentesHoy.length,
      atendidasHoy: delMedHoy.filter((c) => c.estadoCita === 'Atendida').length,
      enEsperaOSalaHoy: delMedHoy.filter(
        (c) =>
          c.estadoCita === 'Pre-admitida' ||
          c.estadoCita === 'Admitida en Sala' ||
          c.estadoCita === 'Reprogramada'
      ).length,
      noAsistioHoy: delMedHoy.filter((c) => c.estadoCita === 'No asistió')
        .length,
      reprogramadasHoy:
        delMedHoy.filter((c) => c.estadoCita === 'Reprogramada').length +
        citas.filter(
          (c) =>
            c.medicoAnteriorId === m.id &&
            c.fechaAnterior &&
            esHoy(c.fechaAnterior) &&
            !(c.medicoId === m.id && esHoy(c.fecha))
        ).length,
      canceladasHoy: delMedHoy.filter((c) => c.estadoCita === 'Cancelada')
        .length,
      capacidadMaxima: topeMaximoCitas,
      cuposDisponiblesHoy: Math.min(
        franjasRestantes.length,
        Math.max(0, topeMaximoCitas - vigentesHoy.length)
      ),
    };
  });

  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [pasoChat, setPasoChat] = useState<PasoChat>('seleccion_area');
  const [chatAreaServicio, setChatAreaServicio] =
    useState<AreaServicioId>('general');
  const [chatEspId, setChatEspId] =
    useState<EspecialidadId>('medicina_general');
  const [chatTipoAtencion, setChatTipoAtencion] =
    useState<TipoAtencionTipo>('consulta');
  const [chatProcId, setChatProcId] = useState('');
  const [chatProcPersonalizadoNombre, setChatProcPersonalizadoNombre] =
    useState('');
  const [chatProcPersonalizadoDetalle, setChatProcPersonalizadoDetalle] =
    useState('');
  const [areaSeleccionada, setAreaSeleccionada] =
    useState<EspecialidadInfo | null>(null);
  const [medicoSeleccionado, setMedicoSeleccionado] =
    useState<MedicoConOcupacion | null>(null);
  const [fechaInputTemp, setFechaInputTemp] = useState(obtenerFechaLocalISO(0));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    obtenerFechaLocalISO(0)
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [alertaDescansoChat, setAlertaDescansoChat] =
    useState<AlertaDescansoChat | null>(null);
  const [ultimaCitaAgendada, setUltimaCitaAgendada] =
    useState<CitaMedica | null>(null);
  const [fotoOrdenData, setFotoOrdenData] = useState<ArchivoFotoTemp | null>(
    null
  );
  const [fotoAutorizacionData, setFotoAutorizacionData] =
    useState<ArchivoFotoTemp | null>(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [busquedaAgendaAdmin, setBusquedaAgendaAdmin] = useState('');
  const [filtroAreaAdmin, setFiltroAreaAdmin] = useState('todas');
  const [filtroEstadoCitaAdmin, setFiltroEstadoCitaAdmin] = useState('todas');
  const [filtroEstadoDocAdmin, setFiltroEstadoDocAdmin] = useState('todas');
  const [observacionTemp, setObservacionTemp] = useState<
    Record<string, string>
  >({});
  const [enviandoCorreoId, setEnviandoCorreoId] = useState<string | null>(null);
  const [modalImagenUrl, setModalImagenUrl] = useState<{
    titulo: string;
    url: string;
  } | null>(null);
  const [modalTirillaCita, setModalTirillaCita] = useState<CitaMedica | null>(
    null
  );
  const [modalFacturaCita, setModalFacturaCita] = useState<CitaMedica | null>(
    null
  );

  const [citaReprogramando, setCitaReprogramando] = useState<CitaMedica | null>(
    null
  );
  const [reproAreaServicio, setReproAreaServicio] =
    useState<AreaServicioId>('general');
  const [reproEspecialidad, setReproEspecialidad] =
    useState<EspecialidadId>('medicina_general');
  const [reproMedicoId, setReproMedicoId] = useState('');
  const [reproFecha, setReproFecha] = useState(obtenerFechaLocalISO(0));
  const [reproHora, setReproHora] = useState('');
  const [reproMotivo, setReproMotivo] = useState('');
  const [errorReprogramacion, setErrorReprogramacion] = useState('');

  const [codigoQrInput, setCodigoQrInput] = useState('');
  const [resultadoLectorQr, setResultadoLectorQr] = useState<{
    tipo: 'ok' | 'error';
    mensaje: string;
    cita?: CitaMedica;
  } | null>(null);
  const [metodoPagoTemp, setMetodoPagoTemp] = useState<
    Record<string, MetodoPagoTipo>
  >({});
  const [reciboInputTemp, setReciboInputTemp] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const faltantes: Record<string, string> = {};
    citas.forEach((c) => {
      if (
        c.estadoCita === 'Admitida en Sala' &&
        c.valorCopago > 0 &&
        reciboInputTemp[c.id] === undefined &&
        !recibosCitas[c.id] &&
        !c.reciboNumero
      ) {
        const met = metodoPagoTemp[c.id] || 'Efectivo';
        faltantes[c.id] = generarNumeroRecibo(met);
      }
    });
    if (Object.keys(faltantes).length > 0) {
      setReciboInputTemp((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(faltantes).forEach(([id, val]) => {
          if (next[id] === undefined) {
            next[id] = val;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [citas, metodoPagoTemp, reciboInputTemp, recibosCitas]);

  const [califEsperaTemp, setCalifEsperaTemp] = useState<
    Record<string, number>
  >({});
  const [califTratoTemp, setCalifTratoTemp] = useState<Record<string, number>>(
    {}
  );
  const [califClaridadTemp, setCalifClaridadTemp] = useState<
    Record<string, number>
  >({});
  const [comentarioSatTemp, setComentarioSatTemp] = useState<
    Record<string, string>
  >({});

  const [nuevoMedNombre, setNuevoMedNombre] = useState('');
  const [nuevoMedCodigo, setNuevoMedCodigo] = useState('');
  const [nuevoMedAreaServ, setNuevoMedAreaServ] =
    useState<AreaServicioId>('general');
  const [nuevoMedArea, setNuevoMedArea] =
    useState<EspecialidadId>('medicina_general');
  const [nuevoMedConsultorio, setNuevoMedConsultorio] = useState('Cons. 106');
  const [nuevoMedDescanso, setNuevoMedDescanso] = useState<DiaSemanaNum>(6);
  const [filtroMedGestion, setFiltroMedGestion] = useState('todas');
  const [mensajeMedicoGestion, setMensajeMedicoGestion] = useState('');

  const [nuevoAdminNombre, setNuevoAdminNombre] = useState('');
  const [nuevoAdminCedula, setNuevoAdminCedula] = useState('');
  const [nuevoAdminNivel, setNuevoAdminNivel] = useState<NivelAdmin>(2);
  const [nuevoAdminPin, setNuevoAdminPin] = useState('');
  const [mensajeAdminGestion, setMensajeAdminGestion] = useState('');

  const [busquedaPacienteAdmin, setBusquedaPacienteAdmin] = useState('');
  const [pacienteOriginalCedulaAdmin, setPacienteOriginalCedulaAdmin] =
    useState('');
  const [pacienteSeleccionadoAdmin, setPacienteSeleccionadoAdmin] =
    useState<Paciente | null>(null);
  const [adminPacRegimen, setAdminPacRegimen] =
    useState<RegimenTipo>('Contributivo');
  const [adminPacTipoAfiliacion, setAdminPacTipoAfiliacion] =
    useState<TipoAfiliacionTipo>('Cotizante');
  const [adminPacRango, setAdminPacRango] =
    useState<RangoAfiliacionTipo>('Rango A');
  const [mensajePacienteAdmin, setMensajePacienteAdmin] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, pasoChat]);

  const solicitarConfirmacion = (data: ConfirmacionModalData) =>
    setModalConfirmacion(data);
  const ejecutarConfirmacion = async () => {
    if (!modalConfirmacion || ejecutandoConfirmacion) return;
    setEjecutandoConfirmacion(true);
    try {
      await modalConfirmacion.onConfirmar();
      setModalConfirmacion(null);
    } finally {
      setEjecutandoConfirmacion(false);
    }
  };

  const obtenerConsultorioPorMedico = (medicoId: string) => {
    if (medicoId.startsWith('aux_')) {
      return auxiliarTurno.consultorio || 'Cons. Auxiliar 01';
    }
    return (
      medicosLista.find((m) => m.id === medicoId)?.consultorio ||
      'Cons. Asignado'
    );
  };

  const enviarFacturaPorCorreo = async (
    cita: CitaMedica,
    prefijo: string,
    estadoPago: string,
    correoDirecto?: string,
    reciboNumero?: string
  ) => {
    const toEmail =
      correoDirecto ||
      pacientes.find((p) => p.cedula === cita.pacienteCedula)?.correo;
    if (!toEmail?.includes('@')) {
      return { ok: false, error: 'Sin correo registrado' };
    }
    const facturaId = `${prefijo}-${Math.floor(10000 + Math.random() * 90000)}`;
    const valorTexto = cita.costoPendiente
      ? 'Valor por definir (Autorizaciones N2/N3)'
      : cita.valorCopago === 0
      ? '$0 COP (Exento)'
      : `$${cita.valorCopago.toLocaleString('es-CO')} COP`;
    const mail = construirHtmlFacturaORecibo({
      facturaId,
      reciboNumero: reciboNumero || recibosCitas[cita.id] || cita.reciboNumero,
      citaId: cita.id,
      pacienteNombre: cita.pacienteNombre,
      pacienteCedula: cita.pacienteCedula,
      pacienteEps: cita.pacienteEps,
      pacienteClasificacion: cita.pacienteClasificacion,
      conceptoPago: obtenerEtiquetaConceptoPago(
        cita.pacienteClasificacion,
        determinarTipoAtencionCita(cita, tiposAtencionCitas)
      ),
      especialidad: `${cita.especialidadNombre} (${formatearDuracionVisibleCita(
        cita,
        tiposAtencionCitas
      )})`,
      procedimientoNombre: cita.procedimientoNombre,
      procedimientoDetalle: cita.procedimientoDetalle,
      costoPendiente: cita.costoPendiente,
      medico: cita.medicoNombre,
      consultorio: obtenerConsultorioPorMedico(cita.medicoId),
      fechaCita: cita.fecha,
      horaCita: cita.hora,
      valorTexto,
      metodoPago: cita.costoPendiente
        ? 'Por definir en Autorizaciones (N2/N3)'
        : cita.metodoPago ||
          (cita.valorCopago === 0 ? 'Exento ($0)' : 'Pendiente en Caja'),
      estadoPago,
      fechaEmision: fechaHoraCompletaFormateada(),
    });
    return enviarCorreoAppsScript({ to: toEmail, ...mail });
  };

  const notificarCitaPorCorreo = async (
    cita: CitaMedica,
    asunto: string,
    titulo: string,
    mensaje: string
  ) => {
    const pac = pacientes.find((p) => p.cedula === cita.pacienteCedula);
    if (!pac?.correo?.includes('@')) {
      return { ok: false, error: 'Paciente sin correo válido' };
    }
    const mail = construirHtmlNotificacionCita({
      asunto,
      titulo,
      citaId: cita.id,
      pacienteNombre: cita.pacienteNombre,
      mensaje,
      especialidad: `${cita.especialidadNombre} (${formatearDuracionVisibleCita(
        cita,
        tiposAtencionCitas
      )})`,
      procedimientoNombre: cita.procedimientoNombre,
      medico: cita.medicoNombre,
      consultorio: obtenerConsultorioPorMedico(cita.medicoId),
      fechaCita: cita.fecha,
      horaCita: cita.hora,
    });
    return enviarCorreoAppsScript({ to: pac.correo, ...mail });
  };

  const obtenerCooldownCorreoRestanteMs = (cita: CitaMedica): number => {
    const meta = correosMetaCitas[cita.id];
    const metaCooldownMs =
      meta?.cooldownStartMs !== undefined
        ? meta.cooldownStartMs
        : meta?.lastMs ?? 0;
    const lastMs = Math.max(cita.ultimoCorreoEnviadoMs ?? 0, metaCooldownMs);
    if (!lastMs) return 0;
    return Math.max(0, COOLDOWN_CORREO_ADMIN_MS - (Date.now() - lastMs));
  };

  const registrarEnvioCorreoExitoso = async (
    citaId: string,
    tipoEnvio: string,
    activarCooldown = true
  ) => {
    const ahora = Date.now();
    const citaAct = citas.find((c) => c.id === citaId);
    const metaPrev = correosMetaCitas[citaId];
    const prevCount = Math.max(
      citaAct?.correosEnviadosCount ?? 0,
      metaPrev?.count ?? 0
    );
    const nuevoCount = prevCount + 1;
    const prevCooldownMs = Math.max(
      citaAct?.ultimoCorreoEnviadoMs ?? 0,
      metaPrev?.cooldownStartMs !== undefined
        ? metaPrev.cooldownStartMs
        : metaPrev?.lastMs ?? 0
    );
    const nextCooldownMs = activarCooldown ? ahora : prevCooldownMs;
    setCorreosMetaCitas((prev) => ({
      ...prev,
      [citaId]: {
        count: nuevoCount,
        lastMs: ahora,
        lastTipo: tipoEnvio,
        cooldownStartMs: nextCooldownMs,
      },
    }));
    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaId
          ? {
              ...c,
              correosEnviadosCount: nuevoCount,
              ...(activarCooldown ? { ultimoCorreoEnviadoMs: ahora } : {}),
            }
          : c
      )
    );
    setAhoraMs(ahora);
    try {
      const payload: Record<string, unknown> = {
        correos_enviados_count: nuevoCount,
        updated_at: new Date().toISOString(),
      };
      if (activarCooldown) {
        payload.ultimo_correo_enviado_ms = ahora;
      }
      await sbCitaConFallback(
        `citas?id=eq.${encodeURIComponent(citaId)}`,
        'PATCH',
        payload,
        ['correos_enviados_count', 'ultimo_correo_enviado_ms']
      );
    } catch {
      /* ignore optional schema fields */
    }
  };

  const handleEnviarRecordatorioCorreo = async (cita: CitaMedica) => {
    if (
      cita.estadoCita === 'Atendida' ||
      cita.estadoCita === 'Cancelada' ||
      cita.estadoCita === 'No asistió'
    ) {
      mostrarToast(
        'info',
        `La cita ${cita.id} ya figura como "${cita.estadoCita}"; no requiere recordatorio por correo.`
      );
      return;
    }
    const restanteMs = obtenerCooldownCorreoRestanteMs(cita);
    if (restanteMs > 0) {
      mostrarToast(
        'info',
        `⏳ Espera ${Math.ceil(
          restanteMs / 1000
        )}s (cooldown de 1 min) antes de enviar otro correo a ${cita.id}.`
      );
      return;
    }
    setEnviandoCorreoId(cita.id);
    const res = await notificarCitaPorCorreo(
      cita,
      `Recordatorio Cita (${cita.fecha}) - IPS Salud Viva`,
      '📅 Recordatorio de Cita Médica',
      `Te recordamos tu consulta en IPS Salud Viva Barranquilla. Por prevención preséntate 15 min antes (${calcularHoraLlegadaRecomendada(
        cita.hora
      )}) con documento y Pase QR.`
    );
    if (res.ok) {
      await registrarEnvioCorreoExitoso(
        cita.id,
        'Recordatorio de cita',
        true
      );
    }
    if (sesionActual?.tipo === 'admin') {
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        'Recordatorio Correo',
        `Cita ${cita.id}${res.ok ? ' · OK' : ` · ${res.error}`}`
      );
    }
    setEnviandoCorreoId(null);
    mostrarToast(
      res.ok ? 'ok' : 'error',
      res.ok
        ? `Recordatorio enviado para ${cita.id}.`
        : `No se pudo enviar: ${res.error}`
    );
  };

  const citasAtendidas = citas.filter((c) => c.estadoCita === 'Atendida');
  const recaudoTotalConfirmado = citasAtendidas.reduce(
    (acc, c) => acc + (Number(c.valorCopago) || 0),
    0
  );

  const descargarReporteExcel = () => {
    const verCed =
      sesionActual?.tipo === 'admin' && sesionActual.admin.nivel >= 3;
    const html = construirHtmlReporteExcel({
      citas,
      verCedulaCompleta: verCed,
      fechaGeneracion: fechaHoraCompletaFormateada(),
      tiposAtencionCitas,
      recibosCitas,
      obtenerConsultorio: obtenerConsultorioPorMedico,
      medicosLista,
    });
    const blob = new Blob(['\uFEFF' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Reporte_IPS_SaludViva_${obtenerFechaLocalISO(0)}.xls`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (sesionActual?.tipo === 'admin') {
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        'Exportación Excel',
        `${citas.length} citas · Recaudo Confirmado: $${recaudoTotalConfirmado.toLocaleString(
          'es-CO'
        )}.`
      );
    }
  };

  const iniciarAsistenteParaPaciente = (pac: Paciente) => {
    setMensajes([
      {
        id: 'msg-1',
        emisor: 'bot',
        hora: horaActualFormateada(),
        texto: `¡Hola, ${pac.nombres} ${pac.apellidos}! Cobertura: ${pac.eps} (${pac.clasificacion}). Jornada 6:00 a. m. – 6:00 p. m. Elige primero el Tipo de Atención, Área y Especialidad o Procedimiento abajo:`,
      },
    ]);
    setPasoChat('seleccion_area');
    setChatAreaServicio('general');
    setChatEspId('medicina_general');
    setChatTipoAtencion(obtenerTipoAtencionPorDefecto('medicina_general'));
    setChatProcId('');
    setChatProcPersonalizadoNombre('');
    setChatProcPersonalizadoDetalle('');
    setAreaSeleccionada(null);
    setMedicoSeleccionado(null);
    setFechaInputTemp(obtenerFechaLocalISO(0));
    setHoraSeleccionada('');
    setAlertaDescansoChat(null);
    setUltimaCitaAgendada(null);
    setFotoOrdenData(null);
    setFotoAutorizacionData(null);
    setMotivoConsultaTemp('');
  };

  const handleLoginPacienteRegistrado = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    const limpia = cedulaLogin.trim();
    const pinIng = pinPacienteLogin.trim();
    if (limpia.length < 6 || !/^\d{4}$/.test(pinIng)) {
      setErrorLogin('Ingresa cédula válida (6+ dígitos) y PIN de 4 dígitos.');
      return;
    }
    setEnviandoFormulario(true);
    try {
      let enc = pacientes.find((p) => p.cedula === limpia);
      const res = await sb(
        `pacientes?cedula=eq.${encodeURIComponent(limpia)}&select=*`
      );
      if (res.ok) {
        const rows: RowRecord[] = await res.json();
        if (rows?.length) enc = mapearPacienteDesdeFila(rows[0]);
      }
      if (!enc) {
        setErrorLogin(
          'Cédula no registrada. Selecciona "Usuario Nuevo" para crear tu cuenta.'
        );
        return;
      }
      if (enc.pin !== pinIng) {
        setErrorLogin(
          'PIN incorrecto. Usa "¿Olvidaste tu PIN?" para recibir un código temporal en tu correo.'
        );
        return;
      }
      await cargarDatosDesdeSupabase(false);
      setSesionActual({ tipo: 'paciente', paciente: enc });
      setEditandoPerfilPaciente(false);
      setMensajePerfilPaciente('');
      setPestanaActiva('asistente');
      setPinPacienteLogin('');
      iniciarAsistenteParaPaciente(enc);
      registrarAuditoria(
        `${enc.nombres} ${enc.apellidos}`,
        'Paciente Registrado',
        'Inicio de Sesión',
        `CC ${enmascararTextoSensible(enc.cedula, 'cedula')}.`
      );
      mostrarToast('ok', `Bienvenido(a), ${enc.nombres} ${enc.apellidos}.`);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleRecuperarPinCorreo = async () => {
    setErrorLogin('');
    const cc = cedulaLogin.trim();
    if (cc.length < 6) {
      setErrorLogin('Escribe primero tu cédula para enviarte un PIN temporal.');
      return;
    }
    setRecuperandoPin(true);
    try {
      let enc = pacientes.find((p) => p.cedula === cc);
      const res = await sb(
        `pacientes?cedula=eq.${encodeURIComponent(cc)}&select=*`
      );
      if (res.ok) {
        const rows: RowRecord[] = await res.json();
        if (rows?.length) enc = mapearPacienteDesdeFila(rows[0]);
      }
      if (!enc) {
        setErrorLogin('No encontramos ningún paciente con esa cédula.');
        return;
      }
      if (!enc.correo?.includes('@')) {
        setErrorLogin('El paciente no tiene correo válido.');
        return;
      }
      const pinTemp = String(Math.floor(1000 + Math.random() * 9000));
      setPacientes((prev) =>
        prev.map((p) => (p.cedula === cc ? { ...p, pin: pinTemp } : p))
      );
      await guardarPacienteConPinSeguro(
        `pacientes?cedula=eq.${encodeURIComponent(cc)}`,
        'PATCH',
        { pin: pinTemp, updated_at: new Date().toISOString() }
      );
      const mailPin = construirHtmlPinTemporal({
        pacienteNombre: `${enc.nombres} ${enc.apellidos}`,
        pinTemp,
        fecha: hoyIsoActual,
      });
      const resMail = await enviarCorreoAppsScript({
        to: enc.correo,
        ...mailPin,
      });
      registrarAuditoria(
        `Paciente ${enmascararTextoSensible(cc, 'cedula')}`,
        'Paciente',
        'Recuperación PIN',
        `Enviado a ${enmascararTextoSensible(enc.correo, 'correo')}`
      );
      mostrarToast(
        resMail.ok ? 'ok' : 'info',
        resMail.ok
          ? `Enviamos PIN temporal a ${enmascararTextoSensible(
              enc.correo,
              'correo'
            )}.`
          : `PIN temporal: ${pinTemp} (${resMail.error})`
      );
    } finally {
      setRecuperandoPin(false);
    }
  };

  const handleRegistroUsuarioNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    if (
      !nuevoNombres.trim() ||
      !nuevoApellidos.trim() ||
      !nuevoTelefono.trim() ||
      !nuevoCorreo.trim() ||
      !nuevoCedula.trim()
    ) {
      setErrorLogin('Todos los campos son obligatorios.');
      return;
    }
    const cedLimpia = nuevoCedula.trim();
    const pinLimpio = nuevoPinPaciente.trim();
    if (cedLimpia.length < 6) {
      setErrorLogin('La cédula debe tener mínimo 6 dígitos.');
      return;
    }
    if (!/^\d{4}$/.test(pinLimpio)) {
      setErrorLogin('Crea un PIN numérico de exactamente 4 dígitos.');
      return;
    }
    if (!aceptoHabeasDataNuevo) {
      setErrorLogin('Debes aceptar la Política Habeas Data (Ley 1581).');
      return;
    }
    setEnviandoFormulario(true);
    try {
      const resCheck = await sb(
        `pacientes?cedula=eq.${encodeURIComponent(cedLimpia)}&select=cedula`
      );
      if (
        pacientes.some((p) => p.cedula === cedLimpia) ||
        (resCheck.ok && (await resCheck.json()).length > 0)
      ) {
        setErrorLogin('Esta cédula ya existe. Ingresa por "Ya Registrado".');
        return;
      }
      const marca = fechaHoraCompletaFormateada();
      const clasifFinal = formatearClasificacion(
        nuevoRegimen,
        nuevoTipoAfiliacion,
        nuevoRango
      );
      const sinEps =
        nuevoRegimen === 'Población no asegurada' ||
        nuevoRegimen === 'Particular';
      const creado: Paciente = {
        cedula: cedLimpia,
        nombres: nuevoNombres.trim(),
        apellidos: nuevoApellidos.trim(),
        telefono: nuevoTelefono.trim(),
        correo: nuevoCorreo.trim(),
        eps: sinEps ? 'Sin EPS / No afiliado' : nuevoEps,
        clasificacion: clasifFinal,
        estadoAfiliacion: sinEps ? 'Sin EPS / En trámite' : 'Activo',
        pin: pinLimpio,
        aceptoHabeasData: true,
        fechaHabeasData: marca,
        esNuevo: true,
      };
      await guardarPacienteConPinSeguro('pacientes', 'POST', {
        cedula: creado.cedula,
        nombres: creado.nombres,
        apellidos: creado.apellidos,
        telefono: creado.telefono,
        correo: creado.correo,
        eps: creado.eps,
        clasificacion: creado.clasificacion,
        estado_afiliacion: creado.estadoAfiliacion,
        pin: creado.pin,
        acepto_habeas_data: true,
        fecha_habeas_data: marca,
      });
      setPacientes((p) => [...p, creado]);
      setSesionActual({ tipo: 'paciente', paciente: creado });
      setEditandoPerfilPaciente(false);
      setPestanaActiva('asistente');
      iniciarAsistenteParaPaciente(creado);
      registrarAuditoria(
        `${creado.nombres} ${creado.apellidos}`,
        'Usuario Nuevo',
        'Registro + Habeas Data',
        `Ley 1581 (${marca}) · ${creado.eps}.`
      );
      mostrarToast('ok', 'Registro completado. Ya puedes agendar tu cita.');
    } catch {
      setErrorLogin('Error de conexión con la nube.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const actualizarPacienteEnNube = async (
    cedulaOriginal: string,
    actualizado: Paciente,
    actorNombre: string,
    actorRol: string
  ): Promise<{ ok: boolean; error?: string; paciente?: Paciente }> => {
    const nuevaCedula = actualizado.cedula.trim();
    const nuevoPin = actualizado.pin.trim();
    if (nuevaCedula.length < 6)
      return { ok: false, error: 'La cédula debe tener mínimo 6 dígitos.' };
    if (!/^\d{4}$/.test(nuevoPin))
      return { ok: false, error: 'El PIN debe tener 4 dígitos numéricos.' };
    if (
      !actualizado.nombres.trim() ||
      !actualizado.apellidos.trim() ||
      !actualizado.telefono.trim() ||
      !actualizado.correo.trim()
    )
      return { ok: false, error: 'Todos los campos son obligatorios.' };
    const cambioCedula = nuevaCedula !== cedulaOriginal;
    if (cambioCedula) {
      if (pacientes.some((p) => p.cedula === nuevaCedula))
        return {
          ok: false,
          error: `Ya existe otro paciente con la cédula ${nuevaCedula}.`,
        };
      const resDup = await sb(
        `pacientes?cedula=eq.${encodeURIComponent(nuevaCedula)}&select=cedula`
      );
      if (resDup.ok && (await resDup.json()).length > 0)
        return {
          ok: false,
          error: `La cédula ${nuevaCedula} ya pertenece a otro registro.`,
        };
    }
    const parsed = parsearClasificacion(actualizado.clasificacion);
    const sinEps =
      parsed.regimen === 'Población no asegurada' ||
      parsed.regimen === 'Particular';
    const pacienteFinal: Paciente = {
      ...actualizado,
      cedula: nuevaCedula,
      pin: nuevoPin,
      nombres: actualizado.nombres.trim(),
      apellidos: actualizado.apellidos.trim(),
      telefono: actualizado.telefono.trim(),
      correo: actualizado.correo.trim(),
      eps: sinEps ? 'Sin EPS / No afiliado' : actualizado.eps,
      estadoAfiliacion: sinEps ? 'Sin EPS / En trámite' : 'Activo',
    };
    const payloadPac = {
      cedula: pacienteFinal.cedula,
      nombres: pacienteFinal.nombres,
      apellidos: pacienteFinal.apellidos,
      telefono: pacienteFinal.telefono,
      correo: pacienteFinal.correo,
      eps: pacienteFinal.eps,
      clasificacion: pacienteFinal.clasificacion,
      estado_afiliacion: pacienteFinal.estadoAfiliacion,
      pin: pacienteFinal.pin,
      acepto_habeas_data: pacienteFinal.aceptoHabeasData ?? true,
      fecha_habeas_data: pacienteFinal.fechaHabeasData || 'Registrado',
      updated_at: new Date().toISOString(),
    };
    let res: Response;
    if (cambioCedula) {
      const checkOrig = await sb(
        `pacientes?cedula=eq.${encodeURIComponent(
          cedulaOriginal
        )}&select=cedula`
      );
      res =
        checkOrig.ok && (await checkOrig.json()).length > 0
          ? await guardarPacienteConPinSeguro(
              `pacientes?cedula=eq.${encodeURIComponent(cedulaOriginal)}`,
              'PATCH',
              payloadPac
            )
          : await guardarPacienteConPinSeguro('pacientes', 'POST', payloadPac);
    } else {
      res = await guardarPacienteConPinSeguro(
        'pacientes',
        'POST',
        payloadPac,
        true
      );
    }
    if (!res.ok)
      return { ok: false, error: `Error Supabase: ${await res.text()}` };

    const nombreCompleto = `${pacienteFinal.nombres} ${pacienteFinal.apellidos}`;
    await sb(
      `citas?paciente_cedula=eq.${encodeURIComponent(cedulaOriginal)}`,
      'PATCH',
      {
        paciente_cedula: pacienteFinal.cedula,
        paciente_nombre: nombreCompleto,
        paciente_eps: pacienteFinal.eps,
        updated_at: new Date().toISOString(),
      }
    );
    setPacientes((prev) =>
      prev.some((p) => p.cedula === cedulaOriginal)
        ? prev.map((p) => (p.cedula === cedulaOriginal ? pacienteFinal : p))
        : [...prev, pacienteFinal]
    );
    setCitas((prev) =>
      prev.map((c) =>
        c.pacienteCedula === cedulaOriginal
          ? {
              ...c,
              pacienteCedula: pacienteFinal.cedula,
              pacienteNombre: nombreCompleto,
              pacienteEps: pacienteFinal.eps,
            }
          : c
      )
    );
    registrarAuditoria(
      actorNombre,
      actorRol,
      cambioCedula ? 'Cambio de Cédula y Ficha' : 'Actualización Ficha',
      cambioCedula
        ? `CC ${enmascararTextoSensible(
            cedulaOriginal,
            'cedula'
          )} → ${enmascararTextoSensible(pacienteFinal.cedula, 'cedula')} · ${
            pacienteFinal.clasificacion
          }`
        : `${nombreCompleto} · ${pacienteFinal.eps}`
    );
    return { ok: true, paciente: pacienteFinal };
  };

  const abrirEdicionPerfilPaciente = () => {
    if (sesionActual?.tipo !== 'paciente') return;
    const p = sesionActual.paciente;
    const parsed = parsearClasificacion(p.clasificacion);
    setEditPacCedula(p.cedula);
    setEditPacPin(p.pin || p.cedula.slice(-4));
    setEditPacNombres(p.nombres);
    setEditPacApellidos(p.apellidos);
    setEditPacTelefono(p.telefono);
    setEditPacCorreo(p.correo);
    setEditPacEps(p.eps);
    setEditPacRegimen(parsed.regimen);
    setEditPacTipoAfiliacion(parsed.tipoAfiliacion);
    setEditPacRango(parsed.rango);
    setMensajePerfilPaciente('');
    setEditandoPerfilPaciente(true);
  };

  const guardarEdicionPerfilPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sesionActual?.tipo !== 'paciente') return;
    setEnviandoFormulario(true);
    setMensajePerfilPaciente('');
    try {
      const res = await actualizarPacienteEnNube(
        sesionActual.paciente.cedula,
        {
          ...sesionActual.paciente,
          cedula: editPacCedula,
          pin: editPacPin,
          nombres: editPacNombres,
          apellidos: editPacApellidos,
          telefono: editPacTelefono,
          correo: editPacCorreo,
          eps: editPacEps,
          clasificacion: formatearClasificacion(
            editPacRegimen,
            editPacTipoAfiliacion,
            editPacRango
          ),
        },
        `${editPacNombres.trim()} ${editPacApellidos.trim()}`,
        'Paciente'
      );
      if (res.ok && res.paciente) {
        setSesionActual({ tipo: 'paciente', paciente: res.paciente });
        setEditandoPerfilPaciente(false);
        setMensajePerfilPaciente('✓ Datos y PIN actualizados.');
        mostrarToast('ok', 'Perfil y PIN actualizados.');
      } else {
        setMensajePerfilPaciente(res.error || 'No se pudo actualizar.');
      }
    } catch {
      setMensajePerfilPaciente('Error de conexión.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const seleccionarPacienteEnAdmin = (p: Paciente) => {
    const parsed = parsearClasificacion(p.clasificacion);
    setPacienteOriginalCedulaAdmin(p.cedula);
    setPacienteSeleccionadoAdmin({ ...p, pin: p.pin || p.cedula.slice(-4) });
    setAdminPacRegimen(parsed.regimen);
    setAdminPacTipoAfiliacion(parsed.tipoAfiliacion);
    setAdminPacRango(parsed.rango);
    setMensajePacienteAdmin('');
  };

  const guardarEdicionPacienteDesdeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      sesionActual?.tipo !== 'admin' ||
      sesionActual.admin.nivel < 4 ||
      !pacienteSeleccionadoAdmin
    )
      return;
    setEnviandoFormulario(true);
    setMensajePacienteAdmin('');
    try {
      const res = await actualizarPacienteEnNube(
        pacienteOriginalCedulaAdmin,
        {
          ...pacienteSeleccionadoAdmin,
          clasificacion: formatearClasificacion(
            adminPacRegimen,
            adminPacTipoAfiliacion,
            adminPacRango
          ),
        },
        sesionActual.admin.nombre,
        sesionActual.admin.titulo
      );
      if (res.ok && res.paciente) {
        setPacienteOriginalCedulaAdmin(res.paciente.cedula);
        setPacienteSeleccionadoAdmin(res.paciente);
        setMensajePacienteAdmin(
          `✓ Ficha de ${res.paciente.nombres} (CC ${res.paciente.cedula}) actualizada.`
        );
      } else {
        setMensajePacienteAdmin(res.error || 'Error al guardar.');
      }
    } catch {
      setMensajePacienteAdmin('Error de red al guardar.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (segundosBloqueoAdmin > 0) return;
    setErrorLogin('');
    const ced = cedulaAdminLogin.trim();
    const pin = pinAdmin.trim();
    if (ced.length < 4 || pin.length < 4) {
      setErrorLogin('Ingresa cédula administrativa y PIN de 4 dígitos.');
      return;
    }
    setEnviandoFormulario(true);
    try {
      let adm = administradores.find((a) => a.cedula === ced);
      const res = await sb(
        `administradores?cedula=eq.${encodeURIComponent(ced)}&select=*`
      );
      if (res.ok) {
        const rows: RowRecord[] = await res.json();
        if (rows?.length) {
          const r = rows[0];
          const n =
            ced === '1004004004' && Number(r.nivel) === 4
              ? 3
              : normalizarNivelAdmin(Number(r.nivel) || 1);
          const info = DESCRIPCIONES_POR_NIVEL[n];
          adm = {
            cedula: String(r.cedula),
            nombre: String(r.nombre),
            titulo: info.titulo,
            nivel: n,
            pin: String(r.pin),
            descripcion: info.descripcion,
            protegido: ced === '1005005005' || ced === '4004',
          };
        }
      }
      if (!adm || adm.pin !== pin) {
        const intentos = intentosFallidosAdmin + 1;
        setIntentosFallidosAdmin(intentos);
        setPinAdmin('');
        if (intentos >= 3) {
          setSegundosBloqueoAdmin(30);
          setIntentosFallidosAdmin(0);
          setErrorLogin('Acceso bloqueado 30s tras 3 intentos fallidos.');
          registrarAuditoria(
            `ID ${enmascararTextoSensible(ced, 'cedula')}`,
            'Seguridad',
            'Bloqueo 30s',
            '3 intentos fallidos de PIN.'
          );
        } else {
          setErrorLogin(`Credenciales incorrectas. Intento ${intentos} de 3.`);
        }
        return;
      }
      setIntentosFallidosAdmin(0);
      await cargarDatosDesdeSupabase(false);
      setSesionActual({ tipo: 'admin', admin: adm });
      setPestanaActiva('admin_panel');
      setSubTabAdmin(
        adm.nivel === 2
          ? 'agendas_autorizaciones'
          : adm.nivel === 3
          ? 'admisiones'
          : 'kpi_alertas'
      );
      setPinAdmin('');
      setCedulaAdminLogin('');
      registrarAuditoria(
        adm.nombre,
        adm.titulo,
        'Acceso Administrativo',
        `Nivel ${adm.nivel} verificado.`
      );
      mostrarToast(
        'ok',
        `Acceso concedido: ${adm.nombre} (Nivel ${adm.nivel})`
      );
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleLoginMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    const cod = codigoMedicoLogin.trim().toUpperCase();
    const pin = pinMedicoLogin.trim();
    if (cod.length < 4 || !/^\d{4}$/.test(pin)) {
      setErrorLogin(
        'Ingresa tu código de médico (ej: MED-MG-101) y tu PIN de 4 dígitos.'
      );
      return;
    }
    setEnviandoFormulario(true);
    try {
      let med = medicosLista.find((m) => m.codigo.toUpperCase() === cod);
      if (!med) {
        try {
          const res = await sb(
            `medicos?codigo=eq.${encodeURIComponent(cod)}&select=*`
          );
          if (res.ok) {
            const rows: RowRecord[] = await res.json();
            if (rows?.length) {
              const r = rows[0];
              const id = String(r.id);
              const loc = medicosPerfilLocalRef.current[id] || {};
              med = {
                id,
                codigo: String(r.codigo),
                nombre: String(r.nombre || loc.nombre || ''),
                especialidad: String(r.especialidad),
                consultorio: String(r.consultorio || loc.consultorio || ''),
                pin: (r.pin ? String(r.pin) : undefined) || loc.pin,
                telefono:
                  (r.telefono ? String(r.telefono) : undefined) || loc.telefono,
                correo: (r.correo ? String(r.correo) : undefined) || loc.correo,
              };
            }
          }
        } catch {
          /* ignore */
        }
      }
      if (!med) {
        setErrorLogin(
          `No se encontró ningún médico con el código "${cod}". Verifica en Parametrización (Nivel 4).`
        );
        return;
      }
      if (!validarPinMedico(med, pin)) {
        setErrorLogin(
          med.pin
            ? `PIN incorrecto para ${med.codigo}. Ingresa tu PIN personalizado de 4 dígitos.`
            : `PIN incorrecto para ${med.codigo}. Puedes usar los 4 dígitos de tu código (${obtenerPinDefaultMedico(
                med.codigo
              )}) o el PIN institucional 2026.`
        );
        return;
      }
      await cargarDatosDesdeSupabase(false);
      const medActualizado =
        medicosLista.find((m) => m.id === med!.id) || med;
      setSesionActual({ tipo: 'medico', medico: medActualizado });
      setPestanaActiva('medico_panel');
      setEditandoPerfilMedico(false);
      setCodigoMedicoLogin('');
      setPinMedicoLogin('');
      registrarAuditoria(
        medActualizado.nombre,
        `Médico (${medActualizado.codigo})`,
        'Acceso Médico',
        `Ingresó al consultorio ${medActualizado.consultorio}.`
      );
      mostrarToast(
        'ok',
        `Bienvenido(a), ${medActualizado.nombre} (${medActualizado.codigo}).`
      );
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const guardarPerfilMedico = async (datos: {
    nombre: string;
    consultorio: string;
    telefono: string;
    correo: string;
    pin: string;
    confirmarPin: string;
  }): Promise<{ ok: boolean; error?: string; warning?: string }> => {
    if (sesionActual?.tipo !== 'medico') {
      return { ok: false, error: 'Sesión médica no activa.' };
    }
    const nombreLimpio = datos.nombre.trim();
    const consultorioLimpio = datos.consultorio.trim();
    const telefonoLimpio = datos.telefono.trim();
    const correoLimpio = datos.correo.trim();
    const pinLimpio = datos.pin.trim();
    const confirmarPinLimpio = datos.confirmarPin.trim();

    if (nombreLimpio.length < 3) {
      return { ok: false, error: 'Ingresa tu nombre completo (mínimo 3 caracteres).' };
    }
    if (consultorioLimpio.length < 2) {
      return { ok: false, error: 'Ingresa un consultorio o ubicación válida.' };
    }
    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      return { ok: false, error: 'El formato del correo electrónico no es válido.' };
    }
    if (!/^\d{4}$/.test(pinLimpio)) {
      return { ok: false, error: 'El PIN debe tener exactamente 4 dígitos numéricos.' };
    }
    if (pinLimpio !== confirmarPinLimpio) {
      return { ok: false, error: 'Los dos campos de PIN no coinciden.' };
    }

    setGuardandoPerfilMedico(true);
    const actual = sesionActual.medico;
    const medicoActualizado: MedicoBase = {
      ...actual,
      nombre: nombreLimpio,
      consultorio: consultorioLimpio,
      pin: pinLimpio,
      telefono: telefonoLimpio || undefined,
      correo: correoLimpio || undefined,
    };

    try {
      setMedicosPerfilLocal((prev) => ({
        ...prev,
        [actual.id]: {
          nombre: nombreLimpio,
          consultorio: consultorioLimpio,
          pin: pinLimpio,
          telefono: telefonoLimpio || undefined,
          correo: correoLimpio || undefined,
        },
      }));
      setMedicosLista((prev) =>
        prev.map((m) => (m.id === actual.id ? medicoActualizado : m))
      );
      setSesionActual({ tipo: 'medico', medico: medicoActualizado });

      if (nombreLimpio !== actual.nombre) {
        setCitas((prev) =>
          prev.map((c) =>
            c.medicoId === actual.id ? { ...c, medicoNombre: nombreLimpio } : c
          )
        );
      }

      const resNube = await guardarMedicoConFallback(actual.id, {
        nombre: nombreLimpio,
        consultorio: consultorioLimpio,
        pin: pinLimpio,
        telefono: telefonoLimpio || null,
        correo: correoLimpio || null,
      });

      registrarAuditoria(
        medicoActualizado.nombre,
        `Médico (${medicoActualizado.codigo})`,
        'Actualización Perfil Médico',
        `Actualizó datos/PIN (${medicoActualizado.consultorio}).`
      );

      if (resNube.ok && !resNube.soloBaseNube) {
        mostrarToast('ok', '✓ Datos del médico y PIN guardados en la nube.');
        return { ok: true };
      }
      if (resNube.soloBaseNube) {
        mostrarToast(
          'info',
          'Nombre y consultorio guardados en la nube; PIN/contacto guardados localmente.'
        );
        return {
          ok: true,
          warning:
            '✓ Nombre y consultorio actualizados en Supabase. El PIN y contacto se guardaron localmente (ejecuta el SQL opcional si deseas sincronizarlos en otros equipos).',
        };
      }
      mostrarToast('info', 'Datos actualizados localmente.');
      return {
        ok: true,
        warning:
          '✓ Datos y PIN actualizados en este navegador (sin conexión de escritura a Supabase).',
      };
    } finally {
      setGuardandoPerfilMedico(false);
    }
  };

  const guardarNotaClinicaMedico = async (cita: CitaMedica, nota: string) => {
    if (sesionActual?.tipo !== 'medico') return;
    const texto = nota.trim();
    if (!texto) {
      mostrarToast('error', 'Escribe una nota clínica antes de guardar.');
      return;
    }
    setGuardandoCitaMedicoId(cita.id);
    const notaFinal = `Nota médica (${sesionActual.medico.nombre}): ${texto}`;
    try {
      setCitas((prev) =>
        prev.map((c) =>
          c.id === cita.id ? { ...c, observacionAdmin: notaFinal } : c
        )
      );
      await sb(`citas?id=eq.${encodeURIComponent(cita.id)}`, 'PATCH', {
        observacion_admin: notaFinal,
        updated_at: new Date().toISOString(),
      });
      setNotaClinicaTemp((prev) => ({ ...prev, [cita.id]: '' }));
      registrarAuditoria(
        sesionActual.medico.nombre,
        `Médico (${sesionActual.medico.codigo})`,
        'Nota Clínica Médico',
        `Cita ${cita.id} · ${texto}`
      );
      mostrarToast('ok', `Nota clínica guardada en la cita ${cita.id}.`);
    } finally {
      setGuardandoCitaMedicoId(null);
    }
  };

  const finalizarConsultaMedico = async (cita: CitaMedica, nota: string) => {
    if (sesionActual?.tipo !== 'medico') return;
    if (cita.estadoCita !== 'Admitida en Sala') {
      mostrarToast(
        'info',
        'El paciente debe ser admitido en sala primero desde Ventanilla (Nivel 3).'
      );
      return;
    }
    if (cita.valorCopago > 0 || cita.costoPendiente) {
      mostrarToast(
        'info',
        'Esta cita tiene copago/tarifa pendiente de recaudo en Caja (Nivel 3).'
      );
      return;
    }
    setGuardandoCitaMedicoId(cita.id);
    const recibo = generarNumeroRecibo('Exento ($0)');
    const notaFinal = nota.trim()
      ? `Atendida por ${sesionActual.medico.nombre}: ${nota.trim()}`
      : cita.observacionAdmin;
    try {
      setRecibosCitas((prev) => ({ ...prev, [cita.id]: recibo }));
      const citaActualizada: CitaMedica = {
        ...cita,
        estadoCita: 'Atendida',
        metodoPago: 'Exento ($0)',
        reciboNumero: recibo,
        observacionAdmin: notaFinal,
      };
      setCitas((prev) =>
        prev.map((c) => (c.id === cita.id ? citaActualizada : c))
      );
      await sbCitaConFallback(
        `citas?id=eq.${encodeURIComponent(cita.id)}`,
        'PATCH',
        {
          estado_cita: 'Atendida',
          metodo_pago: 'Exento ($0)',
          recibo_numero: recibo,
          ...(notaFinal !== undefined ? { observacion_admin: notaFinal } : {}),
          updated_at: new Date().toISOString(),
        },
        ['recibo_numero']
      );
      setNotaClinicaTemp((prev) => ({ ...prev, [cita.id]: '' }));
      await enviarFacturaPorCorreo(
        citaActualizada,
        'REC-MED',
        'ATENDIDA EN CONSULTORIO ($0 EXENTO)',
        undefined,
        recibo
      );
      registrarAuditoria(
        sesionActual.medico.nombre,
        `Médico (${sesionActual.medico.codigo})`,
        'Cita Atendida',
        `Cita ${cita.id} finalizada en consultorio (${recibo}).`
      );
      mostrarToast(
        'ok',
        `✓ Consulta ${cita.id} finalizada como Atendida (${recibo}).`
      );
    } finally {
      setGuardandoCitaMedicoId(null);
    }
  };

  const mananaIsoActual = obtenerFechaLocalISO(1);
  const citasParaManana = citas.filter(
    (c) =>
      c.fecha === mananaIsoActual &&
      (c.estadoCita === 'Pre-admitida' || c.estadoCita === 'Reprogramada')
  );
  const enviados24hMananaCount = citasParaManana.filter(
    (c) => recordatorios24hEnviados[c.id] === c.fecha
  ).length;

  const ejecutarAutoRecordatorios24h = useCallback(
    async (manual = false) => {
      const manana = obtenerFechaLocalISO(1);
      const pendientes = citas.filter(
        (c) =>
          c.fecha === manana &&
          (c.estadoCita === 'Pre-admitida' ||
            c.estadoCita === 'Reprogramada') &&
          recordatorios24hEnviados[c.id] !== c.fecha &&
          !autoRecLockRef.current.has(`${c.id}_${c.fecha}`)
      );
      if (pendientes.length === 0) {
        if (manual) {
          mostrarToast(
            'info',
            `No hay recordatorios 24h pendientes para mañana (${manana}).`
          );
        }
        return;
      }
      setEjecutandoRecordatorios24h(true);
      let okCount = 0;
      const actor =
        sesionActual?.tipo === 'admin'
          ? sesionActual.admin.nombre
          : 'Sistema Automático 24h';
      const rol =
        sesionActual?.tipo === 'admin'
          ? sesionActual.admin.titulo
          : 'Auto-Scheduler';
      try {
        for (const c of pendientes) {
          const clave = `${c.id}_${c.fecha}`;
          autoRecLockRef.current.add(clave);
          const res = await notificarCitaPorCorreo(
            c,
            `Recordatorio Automático (Mañana ${c.fecha}) · ${c.id} - IPS Salud Viva`,
            '⏰ Recordatorio Automático: Tu Cita es Mañana',
            `Te recordamos que mañana ${formatearFechaLegible(
              c.fecha
            )} a las ${c.hora} tienes tu atención en IPS Salud Viva (${obtenerConsultorioPorMedico(
              c.medicoId
            )}). Preséntate 15 minutos antes (${calcularHoraLlegadaRecomendada(
              c.hora
            )}) con documento de identidad y Pase QR.`
          );
          if (res.ok) {
            okCount += 1;
            setRecordatorios24hEnviados((prev) => ({
              ...prev,
              [c.id]: c.fecha,
            }));
            await registrarEnvioCorreoExitoso(
              c.id,
              'Recordatorio automático 24h',
              false
            );
          } else {
            autoRecLockRef.current.delete(clave);
          }
          registrarAuditoria(
            actor,
            rol,
            'Recordatorio Automático 24h',
            `Cita ${c.id} (${c.fecha} ${c.hora})${
              res.ok ? ' · Enviado' : ` · ${res.error}`
            }`
          );
        }
        if (okCount > 0) {
          mostrarToast(
            'ok',
            `✉️ Se enviaron ${okCount} recordatorio(s) automático(s) 24h para mañana (${manana}).`
          );
        } else if (manual) {
          mostrarToast(
            'error',
            'No se pudieron enviar los recordatorios 24h (verifica correos válidos).'
          );
        }
      } finally {
        setEjecutandoRecordatorios24h(false);
      }
    },
    [citas, recordatorios24hEnviados, registrarAuditoria, sesionActual]
  );

  useEffect(() => {
    if (
      sesionActual?.tipo === 'admin' &&
      sesionActual.admin.nivel >= 2 &&
      autoRecordatorios24hActivo &&
      nubeConectada
    ) {
      ejecutarAutoRecordatorios24h(false);
    }
  }, [
    autoRecordatorios24hActivo,
    ejecutarAutoRecordatorios24h,
    nubeConectada,
    sesionActual,
  ]);

  const cerrarSesion = () => {
    setSesionActual(null);
    setEditandoPerfilPaciente(false);
    setErrorLogin('');
    setCedulaLogin('');
    setPinPacienteLogin('');
    setCodigoMedicoLogin('');
    setPinMedicoLogin('');
    setCedulaAdminLogin('');
    setPinAdmin('');
    setResultadoLectorQr(null);
    setCodigoQrInput('');
    setCitaReprogramando(null);
    setModalConfirmacion(null);
    setModalTirillaCita(null);
    setModalFacturaCita(null);
  };

  const addUserMsg = (texto: string) =>
    setMensajes((p) => [
      ...p,
      {
        id: `u-${Date.now()}`,
        emisor: 'usuario',
        texto,
        hora: horaActualFormateada(),
      },
    ]);
  const addBotMsg = (texto: string, opciones?: OpcionChat[]) =>
    setMensajes((p) => [
      ...p,
      {
        id: `b-${Date.now() + Math.random()}`,
        emisor: 'bot',
        texto,
        hora: horaActualFormateada(),
        opciones,
      },
    ]);

  const consultarCitasFechaNube = async (
    fechaIso: string
  ): Promise<CitaMedica[]> => {
    try {
      const res = await sb(
        `citas?fecha=eq.${encodeURIComponent(fechaIso)}&select=*`
      );
      if (res.ok) {
        return (((await res.json()) as RowRecord[]) || []).map(
          mapearCitaDesdeFila
        );
      }
    } catch (err) {
      console.error(err);
    }
    return citas.filter((c) => c.fecha === fechaIso);
  };

  const obtenerInfoProcedimientoChat = (esp: EspecialidadInfo) => {
    if (chatTipoAtencion !== 'procedimiento') {
      return {
        procId: undefined as string | undefined,
        procNombre: undefined as string | undefined,
        procPersonalizado: false,
        procDetalle: undefined as string | undefined,
        duracionMin: esp.duracionMin,
        valorBaseProc: undefined as number | undefined,
        costoPendiente: false,
      };
    }
    const procsArea = obtenerProcedimientosPorArea(esp.areaId);
    const procIdEf =
      chatProcId === PROCEDIMIENTO_PERSONALIZADO_ID ||
      procsArea.some((p) => p.id === chatProcId)
        ? chatProcId
        : procsArea[0]?.id ?? PROCEDIMIENTO_PERSONALIZADO_ID;

    if (procIdEf === PROCEDIMIENTO_PERSONALIZADO_ID) {
      return {
        procId: PROCEDIMIENTO_PERSONALIZADO_ID,
        procNombre:
          chatProcPersonalizadoNombre.trim() || 'Procedimiento Personalizado',
        procPersonalizado: true,
        procDetalle: chatProcPersonalizadoDetalle.trim() || undefined,
        duracionMin: obtenerDuracionProcedimientoPorDefecto(esp.id),
        valorBaseProc: 0,
        costoPendiente: true,
      };
    }

    const procObj = obtenerProcedimientoPorId(procIdEf);
    const tarifaBase = obtenerTarifaProcedimientoCatalogo(
      procIdEf,
      tarifasCatalogoProcedimientos,
      tarifasParticulares,
      tarifas.particular,
      tarifasProcedimientos,
      tarifas.particularProcedimiento
    );
    return {
      procId: procObj?.id ?? procIdEf,
      procNombre: procObj?.nombre,
      procPersonalizado: false,
      procDetalle: undefined,
      duracionMin:
        procObj?.duracionMin ?? obtenerDuracionProcedimientoPorDefecto(esp.id),
      valorBaseProc: tarifaBase,
      costoPendiente: tarifaBase <= 0,
    };
  };

  const construirOpcionesHorarioPaciente = (
    citasFecha: CitaMedica[],
    med: MedicoBase,
    esp: EspecialidadInfo,
    fechaIso: string,
    pacienteCedula: string
  ): OpcionChat[] => {
    const activas = citasFecha.filter((c) =>
      esCitaOcupandoCupo(c, Date.now())
    );
    const ocupadasMed = activas.filter((c) => c.medicoId === med.id);
    if (ocupadasMed.length >= topeMaximoCitas) return [];
    const citasPac = activas.filter((c) => c.pacienteCedula === pacienteCedula);
    const procInfo = obtenerInfoProcedimientoChat(esp);
    const durSolicitada = procInfo.duracionMin;
    return generarFranjasHorariasDisponibles(
      durSolicitada,
      fechaIso,
      ocupadasMed.map((c) => ({ hora: c.hora, duracionMin: c.duracionMin }))
    ).map((h) => {
      const cruce = citasPac.find((c) =>
        hayCruceHorario(h, durSolicitada, c.hora, c.duracionMin)
      );
      return {
        etiqueta: h,
        valor: h,
        deshabilitado: Boolean(cruce),
        subtexto: cruce
          ? `Bloqueado · Tienes cita de ${cruce.especialidadNombre} a las ${cruce.hora}`
          : chatTipoAtencion === 'procedimiento'
          ? `Disponible · Duración asignada por IPS · ${med.consultorio}`
          : `Disponible · ${durSolicitada} min · ${med.consultorio}`,
      };
    });
  };

  const confirmarEspecialidadChat = () => {
    if (sesionActual?.tipo !== 'paciente') return;
    const esp = ESPECIALIDADES.find((e) => e.id === chatEspId);
    const areaObj = AREAS_SERVICIO.find((a) => a.id === chatAreaServicio);
    if (!esp || !areaObj) return;
    const procInfo = obtenerInfoProcedimientoChat(esp);
    if (
      chatTipoAtencion === 'procedimiento' &&
      procInfo.procPersonalizado &&
      chatProcPersonalizadoNombre.trim().length < 3
    ) {
      mostrarToast(
        'error',
        'Escribe el nombre del procedimiento personalizado (mínimo 3 caracteres).'
      );
      return;
    }
    const tipoLabel =
      chatTipoAtencion === 'procedimiento'
        ? `${procInfo.procNombre || 'Procedimiento'} (${
            procInfo.costoPendiente
              ? 'Valor y duración por definir IPS'
              : 'Duración por definir IPS'
          })`
        : `Consulta Médica (${esp.duracionMin} min)`;
    addUserMsg(`${areaObj.nombre} → ${esp.nombre} · ${tipoLabel}`);
    setAreaSeleccionada(esp);
    setAlertaDescansoChat(null);
    const medArea = medicos.filter((m) => m.especialidad === esp.id);
    if (!medArea.length) {
      setTimeout(
        () =>
          addBotMsg(
            `Sin médicos en ${esp.nombre} ahora. Selecciona otra especialidad:`
          ),
        200
      );
      return;
    }
    setPasoChat('seleccion_medico');
    setTimeout(
      () =>
        addBotMsg(
          chatTipoAtencion === 'procedimiento'
            ? procInfo.costoPendiente
              ? `Selecciona el profesional para "${procInfo.procNombre}" (Autorizaciones N2/N3 asignará el costo y duración exacta por correo):`
              : `Selecciona el profesional para "${procInfo.procNombre}" (${esp.nombre}):`
            : `Selecciona el especialista para ${esp.nombre} (${esp.duracionMin} min):`,
          medArea.map((m) => {
            const desc = descansosMedicos[m.id] ?? -1;
            const notaDesc =
              desc !== -1
                ? ` · Descansa: ${obtenerNombreDiaSemana(desc)}`
                : '';
            return {
              etiqueta: `${m.nombre} · Cód: ${m.codigo}`,
              valor: m.id,
              subtexto:
                m.cuposDisponiblesHoy > 0
                  ? `${m.consultorio} · Cupos hoy: ${m.cuposDisponiblesHoy}${notaDesc}`
                  : `${m.consultorio} · Disponible desde mañana${notaDesc}`,
            };
          })
        ),
      200
    );
  };

  const manejarSeleccionOpcionChat = (valor: string, etiqueta: string) => {
    if (sesionActual?.tipo !== 'paciente') return;
    if (pasoChat === 'seleccion_medico') {
      const med = medicos.find((m) => m.id === valor);
      if (!med) return;
      addUserMsg(`${med.nombre} (${med.codigo})`);
      setMedicoSeleccionado(med);
      setAlertaDescansoChat(null);
      setFechaInputTemp(
        med.cuposDisponiblesHoy > 0
          ? obtenerFechaLocalISO(0)
          : obtenerFechaLocalISO(1)
      );
      setPasoChat('seleccion_fecha');
      const desc = descansosMedicos[med.id] ?? -1;
      const textoDesc =
        desc !== -1
          ? ` (Descanso semanal: ${obtenerNombreDiaSemana(desc)}).`
          : '.';
      setTimeout(
        () =>
          addBotMsg(
            `Seleccionaste a ${med.nombre} (${med.consultorio})${textoDesc} Elige la fecha en el calendario (hasta 30 días):`
          ),
        200
      );
    } else if (pasoChat === 'seleccion_hora') {
      const medNombre = medicoSeleccionado?.nombre || 'el profesional';
      const espIdActual = areaSeleccionada?.id || chatEspId;
      const req = obtenerRequisitosDocumentos(
        espIdActual,
        sesionActual.paciente.clasificacion,
        chatTipoAtencion
      );
      addUserMsg(etiqueta);
      setHoraSeleccionada(valor);
      setPasoChat('solicitud_fotos');
      setTimeout(
        () =>
          addBotMsg(
            !req.requiereOrden && !req.requiereAutorizacion
              ? `Horario elegido: ${formatearFechaLegible(
                  fechaSeleccionada
                )} a las ${valor} con ${medNombre}. ${req.motivoExencion} (opcionalmente puedes adjuntar documentos abajo). Pulsa "Confirmar" para finalizar:`
              : req.permiteAlMenosUno
              ? `Para confirmar con ${medNombre} el ${formatearFechaLegible(
                  fechaSeleccionada
                )} a las ${valor}, adjunta ahora tu Orden Médica o tu Autorización EPS (con uno de los dos es suficiente, no se necesitan ambos).`
              : req.requiereOrden && !req.requiereAutorizacion
              ? `Para confirmar con ${medNombre} el ${formatearFechaLegible(
                  fechaSeleccionada
                )} a las ${valor}, adjunta ahora tu Orden Médica (no requiere autorización EPS).`
              : `Para confirmar con ${medNombre} el ${formatearFechaLegible(
                  fechaSeleccionada
                )} a las ${valor}, adjunta ahora tu Orden Médica y tu Autorización EPS (ambas obligatorias).`
          ),
        200
      );
    }
  };

  const consultarHorariosConMedicoYFecha = async (
    medObj: MedicoBase,
    fechaIso: string,
    areaActual: EspecialidadInfo,
    pacienteCedula: string
  ) => {
    const citasFecha = await consultarCitasFechaNube(fechaIso);
    const ahora = Date.now();
    const ocupadasMed = citasFecha.filter(
      (c) => c.medicoId === medObj.id && esCitaOcupandoCupo(c, ahora)
    );
    const leg = formatearFechaLegible(fechaIso);
    if (ocupadasMed.length >= topeMaximoCitas) {
      addBotMsg(
        `${medObj.nombre} alcanzó el tope (${topeMaximoCitas}) el ${leg}. Elige otra fecha:`
      );
      return;
    }
    setFechaSeleccionada(fechaIso);
    const opciones = construirOpcionesHorarioPaciente(
      citasFecha,
      medObj,
      areaActual,
      fechaIso,
      pacienteCedula
    );
    const disp = opciones.filter((o) => !o.deshabilitado);
    if (opciones.length === 0) {
      addBotMsg(`No quedan horarios el ${leg}. Elige otra fecha:`);
      return;
    }
    if (disp.length === 0) {
      addBotMsg(
        `Todas las franjas de ese día se cruzan con citas que ya tienes. Elige otra fecha:`
      );
      return;
    }
    setPasoChat('seleccion_hora');
    setTimeout(
      () =>
        addBotMsg(
          `Hay ${disp.length} horario(s) disponibles con ${medObj.nombre} el ${leg}:`,
          opciones
        ),
      200
    );
  };

  const confirmarFechaCalendarioPaciente = async () => {
    const medActual = medicoSeleccionado;
    const areaActual = areaSeleccionada;
    if (
      sesionActual?.tipo !== 'paciente' ||
      !medActual ||
      !areaActual ||
      !fechaInputTemp
    )
      return;

    const citasFecha = await consultarCitasFechaNube(fechaInputTemp);
    const diaSemana = obtenerDiaSemanaIso(fechaInputTemp);
    const descansoMed = descansosMedicos[medActual.id] ?? -1;

    if (descansoMed !== -1 && descansoMed === diaSemana) {
      const { colegasDisponibles, auxiliarDisponible } =
        obtenerAlternativasPorDescanso(
          medActual,
          fechaInputTemp,
          medicosLista,
          descansosMedicos,
          auxiliarTurno,
          citasFecha,
          topeMaximoCitas
        );
      setAlertaDescansoChat({
        medicoDescansando: medActual,
        fechaIso: fechaInputTemp,
        diaNombre: obtenerNombreDiaSemana(descansoMed),
        colegasDisponibles,
        auxiliarDisponible,
      });
      const leg = formatearFechaLegible(fechaInputTemp);
      addUserMsg(`Fecha: ${leg}`);
      addBotMsg(
        `${medActual.nombre} tiene su día de descanso semanal los ${obtenerNombreDiaSemana(
          descansoMed
        )}. Elige abajo uno de los especialistas sugeridos o al Auxiliar Médico de Turno, o cambia de fecha.`
      );
      return;
    }

    setAlertaDescansoChat(null);
    addUserMsg(`Fecha: ${formatearFechaLegible(fechaInputTemp)}`);
    await consultarHorariosConMedicoYFecha(
      medActual,
      fechaInputTemp,
      areaActual,
      sesionActual.paciente.cedula
    );
  };

  const seleccionarSuplentePorDescanso = async (suplente: MedicoBase) => {
    const areaActual = areaSeleccionada;
    if (sesionActual?.tipo !== 'paciente' || !areaActual) return;
    const suplenteConOcup: MedicoConOcupacion = {
      ...suplente,
      citasHoy: 0,
      atendidasHoy: 0,
      enEsperaOSalaHoy: 0,
      noAsistioHoy: 0,
      reprogramadasHoy: 0,
      canceladasHoy: 0,
      capacidadMaxima: topeMaximoCitas,
      cuposDisponiblesHoy: topeMaximoCitas,
    };
    setMedicoSeleccionado(suplenteConOcup);
    setAlertaDescansoChat(null);
    addUserMsg(`Suplente elegido: ${suplente.nombre}`);
    await consultarHorariosConMedicoYFecha(
      suplente,
      fechaInputTemp,
      areaActual,
      sesionActual.paciente.cedula
    );
  };

  const manejarArchivoFoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'orden' | 'autorizacion'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      mostrarToast('error', 'El archivo supera el límite de 10 MB.');
      return;
    }
    setCargandoImagen(true);
    try {
      const { url, blob, mimeType } = await procesarArchivoSoporte(file);
      const data: ArchivoFotoTemp = { url, blob, nombre: file.name, mimeType };
      if (tipo === 'orden') setFotoOrdenData(data);
      else setFotoAutorizacionData(data);
    } finally {
      setCargandoImagen(false);
    }
  };

  const procesarAgendamientoCita = async () => {
    const medActual = medicoSeleccionado;
    const areaActual = areaSeleccionada;
    if (sesionActual?.tipo !== 'paciente' || !areaActual || !medActual) return;
    const pac = sesionActual.paciente;
    const reqDocs = obtenerRequisitosDocumentos(
      areaActual.id,
      pac.clasificacion,
      chatTipoAtencion
    );
    if (reqDocs.permiteAlMenosUno) {
      if (!fotoOrdenData && !fotoAutorizacionData) return;
    } else {
      if (reqDocs.requiereOrden && !fotoOrdenData) return;
      if (reqDocs.requiereAutorizacion && !fotoAutorizacionData) return;
    }

    setEnviandoFormulario(true);
    try {
      const citasFrescas = await consultarCitasFechaNube(fechaSeleccionada);
      const ahora = Date.now();
      const activas = citasFrescas.filter((c) => esCitaOcupandoCupo(c, ahora));
      const procInfo = obtenerInfoProcedimientoChat(areaActual);
      const durSolicitada = procInfo.duracionMin;
      const delMed = activas.filter((c) => c.medicoId === medActual.id);
      const choqueMed = delMed.some((c) =>
        hayCruceHorario(horaSeleccionada, durSolicitada, c.hora, c.duracionMin)
      );
      const topeMed = delMed.length >= topeMaximoCitas;
      const choquePac = activas.find(
        (c) =>
          c.pacienteCedula === pac.cedula &&
          hayCruceHorario(
            horaSeleccionada,
            durSolicitada,
            c.hora,
            c.duracionMin
          )
      );

      if (choqueMed || topeMed || choquePac) {
        cargarDatosDesdeSupabase(true);
        const nuevasOpciones = construirOpcionesHorarioPaciente(
          citasFrescas,
          medActual,
          areaActual,
          fechaSeleccionada,
          pac.cedula
        );
        const hayLibres = nuevasOpciones.some((o) => !o.deshabilitado);
        const aviso = choquePac
          ? `⚠️ Ya tienes una cita de ${choquePac.especialidadNombre} a las ${choquePac.hora} ese mismo día.`
          : topeMed
          ? `⚠️ ${medActual.nombre} completó su tope de ${topeMaximoCitas} citas.`
          : `⚠️ La franja de las ${horaSeleccionada} con ${medActual.nombre} acaba de ser reservada.`;
        if (hayLibres && !topeMed) {
          setPasoChat('seleccion_hora');
          addBotMsg(
            `${aviso} Conservamos tus datos; elige otro horario para ${formatearFechaLegible(
              fechaSeleccionada
            )}:`,
            nuevasOpciones
          );
        } else {
          setPasoChat('seleccion_fecha');
          addBotMsg(`${aviso} Selecciona otra fecha:`);
        }
        return;
      }

      const citaId = `CIT-${Math.floor(10000 + Math.random() * 90000)}`;
      const [ordenUrlFinal, autorizacionUrlFinal] = await Promise.all([
        fotoOrdenData
          ? subirSoporteStorage(pac.cedula, citaId, 'orden', fotoOrdenData)
          : Promise.resolve(''),
        fotoAutorizacionData
          ? subirSoporteStorage(
              pac.cedula,
              citaId,
              'autorizacion',
              fotoAutorizacionData
            )
          : Promise.resolve(''),
      ]);

      const valorLiquidado = procInfo.costoPendiente
        ? 0
        : calcularValorConsulta(
            pac.clasificacion,
            tarifas,
            areaActual.id,
            tarifasParticulares,
            chatTipoAtencion,
            tarifasProcedimientos,
            procInfo.procId,
            tarifasCatalogoProcedimientos
          );

      const especialidadLabel =
        chatTipoAtencion === 'procedimiento'
          ? `${areaActual.nombre} (Procedimiento)`
          : areaActual.nombre;

      const sinDocsRequeridos =
        !reqDocs.requiereOrden && !reqDocs.requiereAutorizacion;
      const estadoDocsInicial: CitaMedica['estadoDocumentos'] =
        sinDocsRequeridos ? 'Aprobados' : 'Pendiente Revisión';

      const nueva: CitaMedica = {
        id: citaId,
        pacienteCedula: pac.cedula,
        pacienteNombre: `${pac.nombres} ${pac.apellidos}`,
        pacienteEps: pac.eps,
        pacienteClasificacion: pac.clasificacion,
        especialidad: areaActual.id,
        especialidadNombre: especialidadLabel,
        tipoAtencion: chatTipoAtencion,
        procedimientoId: procInfo.procId,
        procedimientoNombre: procInfo.procNombre,
        procedimientoPersonalizado: procInfo.procPersonalizado,
        procedimientoDetalle: procInfo.procDetalle,
        valorBaseProcedimiento: procInfo.valorBaseProc,
        costoPendiente: procInfo.costoPendiente,
        medicoId: medActual.id,
        medicoNombre: medActual.nombre,
        medicoCodigo: medActual.codigo,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        duracionMin: durSolicitada,
        valorCopago: valorLiquidado,
        estadoCita: 'Pre-admitida',
        estadoDocumentos: estadoDocsInicial,
        fotoOrdenUrl: ordenUrlFinal || undefined,
        fotoOrdenNombre: fotoOrdenData?.nombre,
        fotoAutorizacionUrl: autorizacionUrlFinal || undefined,
        fotoAutorizacionNombre: fotoAutorizacionData?.nombre,
        motivoConsulta: motivoConsultaTemp.trim() || undefined,
        reprogramacionesCount: 0,
        fechaCreacion: `Hoy · ${horaActualFormateada()}`,
        createdAtMs: Date.now(),
      };
      await sbCitaConFallback(
        'citas',
        'POST',
        {
          id: nueva.id,
          paciente_cedula: nueva.pacienteCedula,
          paciente_nombre: nueva.pacienteNombre,
          paciente_eps: nueva.pacienteEps,
          paciente_clasificacion: nueva.pacienteClasificacion,
          especialidad: nueva.especialidad,
          especialidad_nombre: nueva.especialidadNombre,
          tipo_atencion: chatTipoAtencion,
          procedimiento_id: nueva.procedimientoId || null,
          procedimiento_nombre: nueva.procedimientoNombre || null,
          procedimiento_personalizado: Boolean(nueva.procedimientoPersonalizado),
          procedimiento_detalle: nueva.procedimientoDetalle || null,
          valor_base_procedimiento: nueva.valorBaseProcedimiento ?? null,
          costo_pendiente: Boolean(nueva.costoPendiente),
          medico_id: nueva.medicoId,
          medico_nombre: nueva.medicoNombre,
          medico_codigo: nueva.medicoCodigo,
          fecha: nueva.fecha,
          hora: nueva.hora,
          duracion_min: nueva.duracionMin,
          valor_copago: nueva.valorCopago,
          estado_cita: nueva.estadoCita,
          estado_documentos: nueva.estadoDocumentos,
          foto_orden_url: nueva.fotoOrdenUrl || null,
          foto_orden_nombre: nueva.fotoOrdenNombre || null,
          foto_autorizacion_url: nueva.fotoAutorizacionUrl || null,
          foto_autorizacion_nombre: nueva.fotoAutorizacionNombre || null,
          observacion_admin: nueva.observacionAdmin || null,
          motivo_consulta: nueva.motivoConsulta || null,
          reprogramaciones_count: 0,
          fecha_creacion: nueva.fechaCreacion,
        },
        [
          'tipo_atencion',
          'procedimiento_id',
          'procedimiento_nombre',
          'procedimiento_personalizado',
          'procedimiento_detalle',
          'valor_base_procedimiento',
          'costo_pendiente',
          'motivo_consulta',
        ]
      );
      if (nueva.motivoConsulta) {
        setMotivosCitasLocal((prev) => ({
          ...prev,
          [nueva.id]: nueva.motivoConsulta!,
        }));
      }
      setTiposAtencionCitas((prev) => ({
        ...prev,
        [nueva.id]: chatTipoAtencion,
      }));
      setCitas((p) => ordenarCitasCronologicamente([nueva, ...p]));
      setUltimaCitaAgendada(nueva);
      setMotivoConsultaTemp('');
      const resFac = await enviarFacturaPorCorreo(
        nueva,
        'FE-SV',
        nueva.costoPendiente
          ? 'VALOR POR DEFINIR EN AUTORIZACIONES (N2/N3)'
          : nueva.valorCopago === 0
          ? 'LIQUIDADO EXENTO'
          : 'PENDIENTE RECAUDO EN CAJA',
        pac.correo
      );
      if (resFac.ok) {
        await registrarEnvioCorreoExitoso(
          nueva.id,
          'Pre-factura / Confirmación',
          false
        );
      }
      registrarAuditoria(
        nueva.pacienteNombre,
        'Paciente',
        'Cita Agendada + Factura',
        `${nueva.id} · ${
          nueva.procedimientoNombre || nueva.especialidadNombre
        } (${nueva.fecha} ${nueva.hora}).`
      );
      addUserMsg(
        sinDocsRequeridos
          ? 'Confirmación directa (sin orden médica ni autorización requerida).'
          : 'Soportes cargados a Storage.'
      );
      setPasoChat('completado');
      mostrarToast(
        resFac.ok ? 'ok' : 'info',
        resFac.ok
          ? `Cita ${nueva.id} confirmada y factura enviada a ${pac.correo}.`
          : `Cita ${nueva.id} guardada (Correo: ${resFac.error}).`
      );
      const fechaLeg = formatearFechaLegible(fechaSeleccionada);
      const horaSel = horaSeleccionada;
      const conceptoMsg = obtenerEtiquetaConceptoPago(
        pac.clasificacion,
        chatTipoAtencion
      );
      const valorMsg = nueva.costoPendiente
        ? 'Valor por definir (Autorizaciones N2/N3 te enviará el costo al correo)'
        : nueva.valorCopago === 0
        ? '$0 COP (Exento)'
        : `$${nueva.valorCopago.toLocaleString('es-CO')} COP (${conceptoMsg})`;
      setTimeout(
        () =>
          addBotMsg(
            `¡Cita guardada! Código: ${nueva.id}. ${medActual.nombre} (${
              medActual.consultorio
            }) el ${fechaLeg} a las ${horaSel}. Llegada: ${calcularHoraLlegadaRecomendada(
              horaSel
            )}. Liquidación: ${valorMsg}. Comprobante enviado a ${pac.correo}.`
          ),
        250
      );
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const confirmarEnvioFotosYAgendar = () => procesarAgendamientoCita();

  const manejarArchivoApartado = async (
    citaId: string,
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'orden' | 'autorizacion'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      mostrarToast('error', 'El archivo supera el límite de 10 MB.');
      return;
    }
    setCargandoImagen(true);
    try {
      const { url, blob, mimeType } = await procesarArchivoSoporte(file);
      setSoportesPendientesTemp((prev) => ({
        ...prev,
        [citaId]: {
          ...prev[citaId],
          [tipo]: { url, blob, nombre: file.name, mimeType },
        },
      }));
    } finally {
      setCargandoImagen(false);
    }
  };

  const confirmarSubidaApartado = async (cita: CitaMedica) => {
    const temp = soportesPendientesTemp[cita.id] || {};
    const tipoAt = determinarTipoAtencionCita(cita, tiposAtencionCitas);
    const req = obtenerRequisitosDocumentos(
      cita.especialidad,
      cita.pacienteClasificacion,
      tipoAt
    );
    const esReenvioObservado = cita.estadoDocumentos === 'Observados';
    const docSolicitado = esReenvioObservado
      ? extraerDocumentoSolicitado(cita.observacionAdmin) || 'ambos'
      : null;
    if (esReenvioObservado) {
      if (docSolicitado === 'orden' && !temp.orden) {
        mostrarToast('error', 'Debes adjuntar la Orden Médica solicitada.');
        return;
      }
      if (docSolicitado === 'autorizacion' && !temp.autorizacion) {
        mostrarToast('error', 'Debes adjuntar la Autorización EPS solicitada.');
        return;
      }
      if (
        docSolicitado === 'ambos' &&
        (!temp.orden && !temp.autorizacion)
      ) {
        mostrarToast(
          'error',
          'Sube al menos un archivo nuevo (Orden Médica o Autorización EPS) para volver a enviar.'
        );
        return;
      }
      if (
        docSolicitado === 'ambos' &&
        (!(temp.orden || cita.fotoOrdenUrl) ||
          !(temp.autorizacion || cita.fotoAutorizacionUrl))
      ) {
        mostrarToast(
          'error',
          'Autorizaciones solicitó ambos documentos (Orden Médica y Autorización EPS).'
        );
        return;
      }
    } else if (req.permiteAlMenosUno) {
      if (
        !temp.orden &&
        !temp.autorizacion &&
        !cita.fotoOrdenUrl &&
        !cita.fotoAutorizacionUrl
      ) {
        mostrarToast(
          'error',
          'Adjunta al menos 1 soporte (Orden Médica o Autorización EPS).'
        );
        return;
      }
    } else {
      const faltaOrden = req.requiereOrden && !cita.fotoOrdenUrl;
      const faltaAut = req.requiereAutorizacion && !cita.fotoAutorizacionUrl;
      if ((faltaOrden && !temp.orden) || (faltaAut && !temp.autorizacion)) {
        mostrarToast('error', 'Adjunta todos los documentos requeridos.');
        return;
      }
    }

    setSubiendoApartadoId(cita.id);
    try {
      const [ordenUrlFinal, autUrlFinal] = await Promise.all([
        temp.orden
          ? subirSoporteStorage(
              cita.pacienteCedula,
              cita.id,
              'orden',
              temp.orden
            )
          : Promise.resolve(cita.fotoOrdenUrl || ''),
        temp.autorizacion
          ? subirSoporteStorage(
              cita.pacienteCedula,
              cita.id,
              'autorizacion',
              temp.autorizacion
            )
          : Promise.resolve(cita.fotoAutorizacionUrl || ''),
      ]);

      const nuevaObs = esReenvioObservado
        ? 'Documentos corregidos reenviados por el paciente para nueva revisión.'
        : 'Soportes médicos subidos por el paciente para revisión.';
      await sb(`citas?id=eq.${encodeURIComponent(cita.id)}`, 'PATCH', {
        foto_orden_url: ordenUrlFinal || null,
        foto_orden_nombre: temp.orden?.nombre || cita.fotoOrdenNombre || null,
        foto_autorizacion_url: autUrlFinal || null,
        foto_autorizacion_nombre:
          temp.autorizacion?.nombre || cita.fotoAutorizacionNombre || null,
        estado_documentos: 'Pendiente Revisión',
        observacion_admin: nuevaObs,
        updated_at: new Date().toISOString(),
      });

      setCitas((prev) =>
        prev.map((c) =>
          c.id === cita.id
            ? {
                ...c,
                fotoOrdenUrl: ordenUrlFinal || c.fotoOrdenUrl,
                fotoOrdenNombre: temp.orden?.nombre || c.fotoOrdenNombre,
                fotoAutorizacionUrl: autUrlFinal || c.fotoAutorizacionUrl,
                fotoAutorizacionNombre:
                  temp.autorizacion?.nombre || c.fotoAutorizacionNombre,
                estadoDocumentos: 'Pendiente Revisión',
                observacionAdmin: nuevaObs,
                apartadoHastaMs: undefined,
              }
            : c
        )
      );
      setApartadosDocs((prev) => {
        const copia = { ...prev };
        delete copia[cita.id];
        return copia;
      });
      setSoportesPendientesTemp((prev) => {
        const copia = { ...prev };
        delete copia[cita.id];
        return copia;
      });
      registrarAuditoria(
        cita.pacienteNombre,
        'Paciente',
        esReenvioObservado ? 'Reenvío Soportes Corregidos' : 'Soportes Apartamiento',
        `${cita.id} · ${
          esReenvioObservado
            ? 'Documentos corregidos enviados a revisión.'
            : 'Soportes subidos por el paciente.'
        }`
      );
      mostrarToast(
        'ok',
        esReenvioObservado
          ? `✓ Documentos corregidos reenviados para ${cita.id}. Autorizaciones los revisará.`
          : `✓ Soportes guardados para ${cita.id}. Tu cita quedó firme.`
      );
    } finally {
      setSubiendoApartadoId(null);
    }
  };

  const cancelarCitaPaciente = (cita: CitaMedica) => {
    if (sesionActual?.tipo !== 'paciente') return;
    const nombrePac = `${sesionActual.paciente.nombres} ${sesionActual.paciente.apellidos}`;
    solicitarConfirmacion({
      titulo: 'Cancelar Cita Médica',
      mensaje: `¿Seguro que deseas cancelar tu cita ${cita.id} (${cita.fecha} ${cita.hora})?`,
      textoConfirmar: 'Sí, cancelar cita',
      peligroso: true,
      onConfirmar: async () => {
        setCitas((p) =>
          p.map((c) =>
            c.id === cita.id ? { ...c, estadoCita: 'Cancelada' } : c
          )
        );
        await sb(`citas?id=eq.${encodeURIComponent(cita.id)}`, 'PATCH', {
          estado_cita: 'Cancelada',
          updated_at: new Date().toISOString(),
        });
        registrarAuditoria(
          nombrePac,
          'Paciente',
          'Cancelación Cita',
          `Canceló ${cita.id}.`
        );
        mostrarToast('info', `Cita ${cita.id} cancelada.`);
      },
    });
  };

  const guardarEncuestaSatisfaccionPaciente = async (citaId: string) => {
    if (sesionActual?.tipo !== 'paciente') return;
    const esp = califEsperaTemp[citaId] ?? 5;
    const tra = califTratoTemp[citaId] ?? 5;
    const cla = califClaridadTemp[citaId] ?? 5;
    const prom = Number(((esp + tra + cla) / 3).toFixed(1));
    const com = (comentarioSatTemp[citaId] || '').trim() || 'Sin comentarios';
    setCitas((p) =>
      p.map((c) =>
        c.id === citaId
          ? {
              ...c,
              calificacionEspera: esp,
              calificacionTrato: tra,
              calificacionClaridad: cla,
              calificacionSatisfaccion: prom,
              comentarioSatisfaccion: com,
            }
          : c
      )
    );
    await sb(`citas?id=eq.${encodeURIComponent(citaId)}`, 'PATCH', {
      calificacion_espera: esp,
      calificacion_trato: tra,
      calificacion_claridad: cla,
      calificacion_satisfaccion: prom,
      comentario_satisfaccion: com,
      updated_at: new Date().toISOString(),
    });
    registrarAuditoria(
      `${sesionActual.paciente.nombres} ${sesionActual.paciente.apellidos}`,
      'Paciente',
      'Encuesta 3 Criterios',
      `Cita ${citaId}: Prom ${prom}/5.`
    );
    mostrarToast('ok', '¡Gracias por calificar tu atención!');
  };

  const asignarDuracionCitaAdmin = async (
    cita: CitaMedica,
    nuevaDuracionMin: number,
    obs?: string,
    nuevoValorBaseProc?: number
  ) => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 2) return;
    if (
      cita.estadoCita === 'Atendida' ||
      cita.estadoCita === 'Cancelada' ||
      cita.estadoCita === 'No asistió'
    ) {
      mostrarToast(
        'info',
        `La cita ${cita.id} ya figura como "${cita.estadoCita}" y no permite modificar duración ni enviar correo.`
      );
      return;
    }
    if (nuevaDuracionMin < 15 || nuevaDuracionMin > 1440) {
      mostrarToast(
        'error',
        'Ingresa una duración válida entre 15 minutos y 24 horas.'
      );
      return;
    }
    const esProc =
      determinarTipoAtencionCita(cita, tiposAtencionCitas) === 'procedimiento';
    if (
      esProc &&
      cita.costoPendiente &&
      (nuevoValorBaseProc == null || nuevoValorBaseProc <= 0)
    ) {
      mostrarToast(
        'error',
        'Asigna un "Valor base procedimiento (COP)" mayor a $0 para liquidar este procedimiento variable y notificarlo al correo.'
      );
      return;
    }
    const restanteMs = obtenerCooldownCorreoRestanteMs(cita);
    if (restanteMs > 0) {
      mostrarToast(
        'info',
        `⏳ Cooldown de 1 minuto activo (${Math.ceil(
          restanteMs / 1000
        )}s) para evitar múltiples avisos seguidos en ${cita.id}.`
      );
      return;
    }
    setEnviandoCorreoId(cita.id);
    const durHumana = formatearDuracionHumana(nuevaDuracionMin);
    const horaFinEst = calcularHoraFinEstimada(cita.hora, nuevaDuracionMin);
    try {
      const citasFecha = await consultarCitasFechaNube(cita.fecha);
      const ahora = Date.now();
      const otras = citasFecha.filter(
        (c) => c.id !== cita.id && esCitaOcupandoCupo(c, ahora)
      );
      const choqueMed = otras.find(
        (c) =>
          c.medicoId === cita.medicoId &&
          hayCruceHorario(cita.hora, nuevaDuracionMin, c.hora, c.duracionMin)
      );
      if (choqueMed) {
        mostrarToast(
          'error',
          `⚠️ Un bloque de ${durHumana} se cruza con ${choqueMed.id} (${choqueMed.hora}) de ${cita.medicoNombre}. Reprograma antes o ajusta las horas.`
        );
        return;
      }
      const choquePac = otras.find(
        (c) =>
          c.pacienteCedula === cita.pacienteCedula &&
          hayCruceHorario(cita.hora, nuevaDuracionMin, c.hora, c.duracionMin)
      );
      if (choquePac) {
        mostrarToast(
          'error',
          `⚠️ El paciente tiene otra cita (${choquePac.id} · ${choquePac.hora}) que se cruza con ${durHumana}.`
        );
        return;
      }

      const costoModificado =
        esProc && nuevoValorBaseProc != null && nuevoValorBaseProc > 0;
      const valorCopagoFinal = costoModificado
        ? calcularLiquidacionDesdeValorBase(
            cita.pacienteClasificacion,
            nuevoValorBaseProc!,
            tarifas,
            'procedimiento',
            cita.especialidad,
            tarifasParticulares
          )
        : cita.valorCopago;
      const valorBaseFinal = costoModificado
        ? nuevoValorBaseProc!
        : cita.valorBaseProcedimiento;
      const costoPendienteFinal = costoModificado ? false : cita.costoPendiente;
      const huboCambioCosto =
        costoModificado &&
        (Boolean(cita.costoPendiente) ||
          cita.valorCopago !== valorCopagoFinal ||
          cita.valorBaseProcedimiento !== valorBaseFinal);

      const notaFinal =
        obs?.trim() ||
        (huboCambioCosto
          ? `Duración (${durHumana}) y costo liquidado ($${valorCopagoFinal.toLocaleString(
              'es-CO'
            )} COP) asignados por Autorizaciones N2/N3.`
          : `Duración clínica asignada por Adm/Autorizaciones: ${durHumana} (${cita.hora}${
              horaFinEst ? ` → ${horaFinEst}` : ''
            }).`);
      const citaActualizada: CitaMedica = {
        ...cita,
        duracionMin: nuevaDuracionMin,
        valorCopago: valorCopagoFinal,
        valorBaseProcedimiento: valorBaseFinal,
        costoPendiente: costoPendienteFinal,
        observacionAdmin: notaFinal,
      };
      setCitas((p) =>
        p.map((c) => (c.id === cita.id ? citaActualizada : c))
      );
      await sbCitaConFallback(
        `citas?id=eq.${encodeURIComponent(cita.id)}`,
        'PATCH',
        {
          duracion_min: nuevaDuracionMin,
          valor_copago: valorCopagoFinal,
          ...(valorBaseFinal !== undefined
            ? { valor_base_procedimiento: valorBaseFinal }
            : {}),
          ...(costoPendienteFinal !== undefined
            ? { costo_pendiente: costoPendienteFinal }
            : {}),
          observacion_admin: notaFinal,
          updated_at: new Date().toISOString(),
        },
        ['valor_base_procedimiento', 'costo_pendiente']
      );

      const resMail = huboCambioCosto
        ? await enviarFacturaPorCorreo(
            citaActualizada,
            'FE-PROC',
            valorCopagoFinal === 0
              ? 'LIQUIDADO EXENTO ($0 COP)'
              : 'PENDIENTE RECAUDO EN CAJA (COSTO ASIGNADO N2/N3)'
          )
        : await notificarCitaPorCorreo(
            citaActualizada,
            `Duración Asignada (${durHumana}) · ${cita.id} - IPS Salud Viva`,
            `⏱️ Duración Confirmada: ${durHumana}`,
            `El área administrativa revisó tu orden médica y asignó una duración confirmada de ${durHumana} (${nuevaDuracionMin} minutos) para tu ${
              cita.procedimientoNombre || cita.especialidadNombre
            }${
              horaFinEst ? ` (horario estimado: ${cita.hora} a ${horaFinEst})` : ''
            }. Preséntate 15 minutos antes (${calcularHoraLlegadaRecomendada(
              cita.hora
            )}) en ${obtenerConsultorioPorMedico(cita.medicoId)}.${
              obs?.trim() ? ` Observación: ${obs.trim()}` : ''
            }`
          );

      if (resMail.ok) {
        await registrarEnvioCorreoExitoso(
          cita.id,
          huboCambioCosto
            ? `Costo y duración asignados ($${valorCopagoFinal.toLocaleString(
                'es-CO'
              )})`
            : `Duración asignada (${durHumana})`,
          true
        );
      }
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        huboCambioCosto
          ? 'Duración y Costo Asignados + Correo'
          : 'Duración Asignada + Correo',
        `Cita ${cita.id} · ${durHumana} (${nuevaDuracionMin} min)${
          huboCambioCosto
            ? ` · Base $${valorBaseFinal?.toLocaleString(
                'es-CO'
              )} / Copago $${valorCopagoFinal.toLocaleString('es-CO')}`
            : ''
        }${obs?.trim() ? ` · ${obs.trim()}` : ''}`
      );
      mostrarToast(
        resMail.ok ? 'ok' : 'info',
        resMail.ok
          ? huboCambioCosto
            ? `✓ Duración (${durHumana}) y costo ($${valorCopagoFinal.toLocaleString(
                'es-CO'
              )} COP) asignados y enviados al correo del paciente.`
            : `✓ Duración de ${durHumana} guardada y enviada al correo del paciente.`
          : `Guardado en la nube, correo pendiente: ${resMail.error}`
      );
    } finally {
      setEnviandoCorreoId(null);
    }
  };

  const actualizarEstadoDocumentos = async (
    cita: CitaMedica,
    nuevoEstado: 'Aprobados' | 'Observados',
    obs?: string,
    duracionAsignadaMin?: number,
    documentoRequerido?: DocumentoSolicitadoTipo
  ) => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 2) return;
    if (
      cita.estadoCita === 'Atendida' ||
      cita.estadoCita === 'Cancelada' ||
      cita.estadoCita === 'No asistió'
    ) {
      mostrarToast(
        'info',
        `La cita ${cita.id} ya está "${cita.estadoCita}" y no requiere revisión ni envío de correo.`
      );
      return;
    }
    const restanteMs = obtenerCooldownCorreoRestanteMs(cita);
    if (restanteMs > 0) {
      mostrarToast(
        'info',
        `⏳ Cooldown de 1 minuto activo (${Math.ceil(
          restanteMs / 1000
        )}s) para evitar múltiples avisos seguidos en ${cita.id}.`
      );
      return;
    }
    setEnviandoCorreoId(cita.id);
    try {
      const durFinal =
        duracionAsignadaMin && duracionAsignadaMin >= 15
          ? duracionAsignadaMin
          : cita.duracionMin;
      if (nuevoEstado === 'Aprobados' && durFinal !== cita.duracionMin) {
        const citasFecha = await consultarCitasFechaNube(cita.fecha);
        const ahora = Date.now();
        const choqueMed = citasFecha.find(
          (c) =>
            c.id !== cita.id &&
            esCitaOcupandoCupo(c, ahora) &&
            c.medicoId === cita.medicoId &&
            hayCruceHorario(cita.hora, durFinal, c.hora, c.duracionMin)
        );
        if (choqueMed) {
          mostrarToast(
            'error',
            `⚠️ Un bloque de ${formatearDuracionHumana(
              durFinal
            )} se cruza con ${choqueMed.id} (${
              choqueMed.hora
            }). Ajusta la duración o reprograma primero.`
          );
          return;
        }
      }
      const docReq: DocumentoSolicitadoTipo = documentoRequerido || 'ambos';
      const etiquetaDocReq =
        docReq === 'orden'
          ? 'Orden Médica'
          : docReq === 'autorizacion'
          ? 'Autorización EPS'
          : 'Orden Médica y Autorización EPS (Ambas)';
      const textoObsLimpio =
        nuevoEstado === 'Observados'
          ? obs?.trim() ||
            (docReq === 'orden'
              ? 'Para continuar con tu cita necesitamos que subas una foto clara y legible de tu Orden Médica en la sección Mis Citas.'
              : docReq === 'autorizacion'
              ? 'Para continuar con tu cita necesitamos que subas una foto clara y legible de tu Autorización EPS en la sección Mis Citas.'
              : 'Documentos faltantes o no legibles. Por favor sube o vuelve a enviar tu Orden Médica y Autorización EPS desde Mis Citas.')
          : obs?.trim() || undefined;
      const motivoFinal =
        nuevoEstado === 'Observados' && textoObsLimpio
          ? construirObservacionSolicitudDoc(docReq, textoObsLimpio)
          : textoObsLimpio;
      const citaAct: CitaMedica = {
        ...cita,
        duracionMin: nuevoEstado === 'Aprobados' ? durFinal : cita.duracionMin,
        estadoDocumentos: nuevoEstado,
        observacionAdmin: motivoFinal,
      };
      setCitas((p) => p.map((c) => (c.id === cita.id ? citaAct : c)));
      await sb(`citas?id=eq.${encodeURIComponent(cita.id)}`, 'PATCH', {
        duracion_min: citaAct.duracionMin,
        estado_documentos: nuevoEstado,
        observacion_admin: motivoFinal || null,
        updated_at: new Date().toISOString(),
      });
      const resMail = await notificarCitaPorCorreo(
        citaAct,
        nuevoEstado === 'Aprobados'
          ? `Documentos Aprobados (${formatearDuracionHumana(
              citaAct.duracionMin
            )}) · ${cita.id} - IPS Salud Viva`
          : `📄 Solicitud de ${etiquetaDocReq} · ${cita.id} - IPS Salud Viva`,
        nuevoEstado === 'Aprobados'
          ? '✅ Documentos y Cita Aprobados'
          : `📄 Se requiere tu ${etiquetaDocReq}`,
        nuevoEstado === 'Aprobados'
          ? `Tus documentos fueron APROBADOS con duración confirmada de ${formatearDuracionHumana(
              citaAct.duracionMin
            )} (${cita.hora} → ${calcularHoraFinEstimada(
              cita.hora,
              citaAct.duracionMin
            )}). Recuerda llegar 15 minutos antes (${calcularHoraLlegadaRecomendada(
              cita.hora
            )}) a ${obtenerConsultorioPorMedico(cita.medicoId)}.${
              textoObsLimpio ? ` Nota: ${textoObsLimpio}` : ''
            }`
          : `El área de Autorizaciones revisó tu cita y solicita que adjuntes o reenvíes una foto clara de: ${etiquetaDocReq}. Detalle: "${textoObsLimpio}". Ingresa al portal en la pestaña "Mis Citas" para cargar el soporte solicitado.`
      );
      if (resMail.ok) {
        await registrarEnvioCorreoExitoso(
          cita.id,
          nuevoEstado === 'Aprobados'
            ? 'Docs aprobados'
            : `Solicitud: ${etiquetaDocReq}`,
          true
        );
      }
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        nuevoEstado === 'Aprobados' ? 'Docs Aprobados' : 'Solicitud Docs Correo',
        `Cita ${cita.id} · ${
          nuevoEstado === 'Aprobados'
            ? formatearDuracionHumana(citaAct.duracionMin)
            : etiquetaDocReq
        }${textoObsLimpio ? ` · ${textoObsLimpio}` : ''}`
      );
      mostrarToast(
        resMail.ok ? 'ok' : 'info',
        resMail.ok
          ? nuevoEstado === 'Aprobados'
            ? `Documentos "Aprobados" (${formatearDuracionHumana(
                citaAct.duracionMin
              )}) y notificados por correo.`
            : `Solicitud de ${etiquetaDocReq} enviada al correo del paciente.`
          : `Documentos marcados como "${nuevoEstado}" (correo pendiente: ${resMail.error}).`
      );
    } finally {
      setEnviandoCorreoId(null);
    }
  };

  const ejecutarActualizacionEstadoCitaAdmin = async (
    citaId: string,
    nuevoEstado: EstadoCitaTipo,
    metodoPago?: MetodoPagoTipo,
    obs?: string,
    reciboNumero?: string
  ) => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 2) return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    const citaObj = citas.find((c) => c.id === citaId);

    if (reciboNumero) {
      setRecibosCitas((prev) => ({ ...prev, [citaId]: reciboNumero }));
    }

    setCitas((p) =>
      p.map((c) =>
        c.id === citaId
          ? {
              ...c,
              estadoCita: nuevoEstado,
              metodoPago: metodoPago || c.metodoPago,
              reciboNumero: reciboNumero || c.reciboNumero,
              observacionAdmin: obs !== undefined ? obs : c.observacionAdmin,
            }
          : c
      )
    );
    await sbCitaConFallback(
      `citas?id=eq.${encodeURIComponent(citaId)}`,
      'PATCH',
      {
        estado_cita: nuevoEstado,
        ...(metodoPago ? { metodo_pago: metodoPago } : {}),
        ...(reciboNumero ? { recibo_numero: reciboNumero } : {}),
        ...(obs !== undefined ? { observacion_admin: obs } : {}),
        updated_at: new Date().toISOString(),
      },
      ['recibo_numero']
    );

    let msgExtra = '';
    let tipoToast: 'ok' | 'info' = 'ok';
    if (citaObj && nuevoEstado === 'Atendida') {
      const resFac = await enviarFacturaPorCorreo(
        {
          ...citaObj,
          estadoCita: 'Atendida',
          metodoPago: metodoPago || citaObj.metodoPago,
          reciboNumero: reciboNumero || citaObj.reciboNumero,
        },
        'REC-CAJA',
        'PAGADO Y ATENDIDO EN SALA',
        undefined,
        reciboNumero
      );
      if (resFac.ok) {
        msgExtra = ` Recibo ${reciboNumero || ''} enviado al correo.`;
        await registrarEnvioCorreoExitoso(citaObj.id, 'Recibo de caja', false);
      } else {
        tipoToast = 'info';
        msgExtra = ` (Recibo guardado local; correo: ${resFac.error})`;
      }
    } else if (citaObj && nuevoEstado === 'Cancelada') {
      const resCancelMail = await notificarCitaPorCorreo(
        citaObj,
        'Aviso Cancelación - IPS Salud Viva',
        '❌ Cita Médica Cancelada',
        `Tu cita médica fue cancelada desde agendas.${
          obs ? ` Motivo: ${obs}` : ''
        }`
      );
      if (resCancelMail.ok) {
        await registrarEnvioCorreoExitoso(
          citaObj.id,
          'Aviso de cancelación',
          false
        );
      }
    }

    registrarAuditoria(
      admNombre,
      admTitulo,
      `Cita ${nuevoEstado}`,
      `Cita ${citaId}${metodoPago ? ` (${metodoPago})` : ''}${
        reciboNumero ? ` · ${reciboNumero}` : ''
      }${obs ? ` · ${obs}` : ''}`
    );
    mostrarToast(
      tipoToast,
      `Cita ${citaId} actualizada a "${nuevoEstado}".${msgExtra}`
    );
  };

  const solicitarCancelarCitaAdmin = (cita: CitaMedica, obs?: string) => {
    solicitarConfirmacion({
      titulo: 'Cancelar Cita del Paciente',
      mensaje: `¿Cancelar cita ${cita.id} de ${cita.pacienteNombre} (${cita.fecha} ${cita.hora})? Se enviará aviso por correo.`,
      textoConfirmar: 'Sí, cancelar cita',
      peligroso: true,
      onConfirmar: async () => {
        await ejecutarActualizacionEstadoCitaAdmin(
          cita.id,
          'Cancelada',
          undefined,
          obs
        );
      },
    });
  };

  const abrirModalReprogramacion = (cita: CitaMedica) => {
    setCitaReprogramando(cita);
    setReproAreaServicio(
      ESPECIALIDADES.find((e) => e.id === cita.especialidad)?.areaId ||
        'general'
    );
    setReproEspecialidad(cita.especialidad);
    setReproMedicoId(cita.medicoId);
    setReproFecha(cita.fecha >= hoyIsoActual ? cita.fecha : hoyIsoActual);
    setReproHora('');
    const obsLimpia = limpiarEtiquetaApartado(cita.observacionAdmin);
    setReproMotivo(
      sesionActual?.tipo === 'paciente'
        ? ''
        : observacionTemp[cita.id] ||
            obsLimpia ||
            cita.motivoReprogramacion ||
            ''
    );
    setErrorReprogramacion('');
  };

  const confirmarReprogramacionReal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaReprogramando) return;
    const esAdminAutorizado =
      sesionActual?.tipo === 'admin' && sesionActual.admin.nivel >= 2;
    const esPacienteDueno =
      sesionActual?.tipo === 'paciente' &&
      citaReprogramando.pacienteCedula === sesionActual.paciente.cedula &&
      (citaReprogramando.estadoCita === 'Pre-admitida' ||
        citaReprogramando.estadoCita === 'Reprogramada') &&
      !esCitaVencidaSinLlegada(citaReprogramando);

    if (!esAdminAutorizado && !esPacienteDueno) return;

    const espObjetivo = esPacienteDueno
      ? citaReprogramando.especialidad
      : reproEspecialidad;

    if (!reproMedicoId || !reproFecha || !reproHora) {
      setErrorReprogramacion('Completa especialidad, médico, fecha y franja.');
      return;
    }
    const infoEsp = ESPECIALIDADES.find((x) => x.id === espObjetivo);
    let med: MedicoBase | undefined = medicosLista.find(
      (m) => m.id === reproMedicoId
    );
    if (!med && reproMedicoId.startsWith('aux_') && auxiliarTurno.activo) {
      med = {
        id: reproMedicoId,
        codigo: auxiliarTurno.codigo,
        nombre: `${auxiliarTurno.nombre} (Suplente)`,
        especialidad: espObjetivo,
        consultorio: auxiliarTurno.consultorio,
      };
    }
    if (!infoEsp || !med) {
      setErrorReprogramacion('Selección inválida.');
      return;
    }
    setEnviandoFormulario(true);
    setErrorReprogramacion('');
    try {
      const citasNube = await consultarCitasFechaNube(reproFecha);
      const otras = citasNube.filter(
        (c) =>
          c.id !== citaReprogramando.id &&
          c.estadoCita !== 'Cancelada' &&
          c.estadoCita !== 'No asistió'
      );
      const delMed = otras.filter((c) => c.medicoId === med.id);
      if (delMed.length >= topeMaximoCitas) {
        setErrorReprogramacion(
          `${med.nombre} alcanzó tope (${topeMaximoCitas}).`
        );
        return;
      }
      const duracionRepro =
        citaReprogramando.especialidad === infoEsp.id &&
        citaReprogramando.duracionMin > infoEsp.duracionMin
          ? citaReprogramando.duracionMin
          : infoEsp.duracionMin;
      if (
        delMed.some((c) =>
          hayCruceHorario(reproHora, duracionRepro, c.hora, c.duracionMin)
        )
      ) {
        setErrorReprogramacion(`Horario ${reproHora} ocupado.`);
        cargarDatosDesdeSupabase(true);
        return;
      }
      const crucePac = otras.find(
        (c) =>
          c.pacienteCedula === citaReprogramando.pacienteCedula &&
          hayCruceHorario(reproHora, duracionRepro, c.hora, c.duracionMin)
      );
      if (crucePac) {
        setErrorReprogramacion(
          `Paciente ya tiene cita (${crucePac.especialidadNombre} · ${crucePac.hora}).`
        );
        return;
      }

      const motivo =
        reproMotivo.trim() ||
        (esPacienteDueno
          ? 'Reprogramación por imprevisto del paciente'
          : citaReprogramando.especialidad !== espObjetivo
          ? `Cambio a ${infoEsp.nombre}`
          : 'Reprogramación administrativa');
      const conteo = (citaReprogramando.reprogramacionesCount || 0) + 1;
      const medPrev = citaReprogramando.medicoId;
      const fecPrev = citaReprogramando.fecha;
      const tipoCit = determinarTipoAtencionCita(
        citaReprogramando,
        tiposAtencionCitas
      );
      const mismaEspecialidad = infoEsp.id === citaReprogramando.especialidad;
      const nuevoValor = mismaEspecialidad
        ? citaReprogramando.valorCopago
        : calcularValorConsulta(
            citaReprogramando.pacienteClasificacion,
            tarifas,
            infoEsp.id,
            tarifasParticulares,
            tipoCit,
            tarifasProcedimientos
          );

      const obsPrev = citaReprogramando.observacionAdmin || '';
      const conservaTagEspecial =
        obsPrev.includes('[APARTADO:') || obsPrev.includes('[REQ_DOC:');
      const observacionFinal = esPacienteDueno
        ? conservaTagEspecial
          ? obsPrev
          : citaReprogramando.observacionAdmin
        : conservaTagEspecial
        ? obsPrev
        : motivo;

      const act: CitaMedica = {
        ...citaReprogramando,
        especialidad: infoEsp.id,
        especialidadNombre:
          tipoCit === 'procedimiento'
            ? `${infoEsp.nombre} (Procedimiento)`
            : infoEsp.nombre,
        medicoId: med.id,
        medicoNombre: med.nombre,
        medicoCodigo: med.codigo,
        fecha: reproFecha,
        hora: reproHora,
        duracionMin: duracionRepro,
        valorCopago: nuevoValor,
        estadoCita: 'Reprogramada',
        medicoAnteriorId: medPrev,
        fechaAnterior: fecPrev,
        motivoReprogramacion: motivo,
        reprogramacionesCount: conteo,
        observacionAdmin: observacionFinal,
      };
      const res = await sbCitaConFallback(
        `citas?id=eq.${encodeURIComponent(citaReprogramando.id)}`,
        'PATCH',
        {
          especialidad: act.especialidad,
          especialidad_nombre: act.especialidadNombre,
          medico_id: act.medicoId,
          medico_nombre: act.medicoNombre,
          medico_codigo: act.medicoCodigo,
          fecha: act.fecha,
          hora: act.hora,
          duracion_min: act.duracionMin,
          valor_copago: act.valorCopago,
          estado_cita: 'Reprogramada',
          medico_anterior_id: medPrev,
          fecha_anterior: fecPrev,
          motivo_reprogramacion: motivo,
          reprogramaciones_count: conteo,
          observacion_admin: observacionFinal ?? null,
          updated_at: new Date().toISOString(),
        },
        ['medico_anterior_id', 'fecha_anterior', 'motivo_reprogramacion', 'reprogramaciones_count']
      );
      if (!res.ok) {
        setErrorReprogramacion(`Error Supabase: ${await res.text()}`);
        return;
      }
      setCitas((p) =>
        ordenarCitasCronologicamente(p.map((c) => (c.id === act.id ? act : c)))
      );
      const resReproMail = await notificarCitaPorCorreo(
        act,
        'Reprogramación de Cita - IPS Salud Viva',
        '🔄 Cita Médica Reprogramada',
        `Tu cita fue reprogramada (${motivo}). Recuerda llegar 15 minutos antes (${calcularHoraLlegadaRecomendada(
          act.hora
        )}).`
      );
      if (resReproMail.ok) {
        await registrarEnvioCorreoExitoso(
          act.id,
          'Reprogramación de cita',
          true
        );
      }
      if (sesionActual.tipo === 'admin') {
        registrarAuditoria(
          sesionActual.admin.nombre,
          sesionActual.admin.titulo,
          'Reprogramación Real',
          `${act.id}: ${infoEsp.nombre} (${reproFecha} ${reproHora}).`
        );
      } else if (sesionActual.tipo === 'paciente') {
        registrarAuditoria(
          `${sesionActual.paciente.nombres} ${sesionActual.paciente.apellidos}`,
          'Paciente',
          'Reprogramación Real',
          `${act.id} reprogramada por paciente (${reproFecha} ${reproHora}).`
        );
      }
      setCitaReprogramando(null);
      mostrarToast(
        'ok',
        `Cita ${act.id} reprogramada y notificada por correo.`
      );
    } catch {
      setErrorReprogramacion('Error de conexión.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const cancelarDesdeModalReprogramacion = () => {
    if (!citaReprogramando) return;
    const citaTarget = citaReprogramando;
    const motivo = reproMotivo.trim() || 'Cancelada durante reprogramación';
    solicitarConfirmacion({
      titulo: 'Cancelar Cita desde Reprogramación',
      mensaje: `¿Cancelar definitivamente la cita ${citaTarget.id}?`,
      textoConfirmar: 'Sí, cancelar cita',
      peligroso: true,
      onConfirmar: async () => {
        await ejecutarActualizacionEstadoCitaAdmin(
          citaTarget.id,
          'Cancelada',
          undefined,
          motivo
        );
        setCitaReprogramando(null);
      },
    });
  };

  const validarCodigoQrEnAdmisiones = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = codigoQrInput.trim().toUpperCase();
    if (!raw) return;
    const cod = raw.includes('|') ? raw.split('|')[1].trim() : raw;
    const c = citas.find(
      (x) => x.id.toUpperCase() === cod || x.pacienteCedula === cod
    );
    setResultadoLectorQr(
      c
        ? {
            tipo: 'ok',
            mensaje: `Pase verificado: ${c.pacienteNombre} · ${
              c.especialidadNombre
            } (${obtenerConsultorioPorMedico(c.medicoId)})`,
            cita: c,
          }
        : { tipo: 'error', mensaje: `No se encontró cita activa con "${cod}".` }
    );
  };

  const eliminarCitaDeNube = (cita: CitaMedica) => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 2) return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    solicitarConfirmacion({
      titulo: 'Eliminar Cita Permanentemente',
      mensaje: `¿Eliminar la cita ${cita.id} (${cita.pacienteNombre}) de la nube?`,
      textoConfirmar: 'Sí, eliminar cita',
      peligroso: true,
      onConfirmar: async () => {
        setCitas((p) => p.filter((c) => c.id !== cita.id));
        await sb(`citas?id=eq.${encodeURIComponent(cita.id)}`, 'DELETE');
        registrarAuditoria(
          admNombre,
          admTitulo,
          'Eliminación Cita',
          `Eliminó ${cita.id}.`
        );
        mostrarToast('info', `Cita ${cita.id} eliminada.`);
      },
    });
  };

  const agregarNuevoMedicoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeMedicoGestion('');
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    if (!nuevoMedNombre.trim() || !nuevoMedCodigo.trim()) {
      setMensajeMedicoGestion('Ingresa nombre y código.');
      return;
    }
    const nuevo: MedicoBase = {
      id: `m-${Date.now()}`,
      codigo: nuevoMedCodigo.trim().toUpperCase(),
      nombre: nuevoMedNombre.trim(),
      especialidad: nuevoMedArea,
      consultorio: nuevoMedConsultorio.trim() || 'Cons. General',
    };
    const res = await sb('medicos', 'POST', nuevo);
    if (res.ok) {
      setMedicosLista((p) => [...p, nuevo]);
      setDescansosMedicos((d) => ({ ...d, [nuevo.id]: nuevoMedDescanso }));
      setNuevoMedNombre('');
      setNuevoMedCodigo('');
      setMensajeMedicoGestion(
        `Médico ${nuevo.nombre} guardado (Descanso: ${obtenerNombreDiaSemana(
          nuevoMedDescanso
        )}).`
      );
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        'Vinculación Médico',
        `${nuevo.nombre} (${nuevo.codigo}).`
      );
    } else {
      setMensajeMedicoGestion(`Error: ${await res.text()}`);
    }
  };

  const actualizarMedicoDesdeAdmin = async (
    medEditado: MedicoBase,
    descansoNuevo?: DiaSemanaNum
  ): Promise<{ ok: boolean; error?: string; warning?: string }> => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) {
      return { ok: false, error: 'Requiere acceso Administrativo Nivel 4.' };
    }
    const nombreLimpio = medEditado.nombre.trim();
    const codigoLimpio = medEditado.codigo.trim().toUpperCase();
    const consultorioLimpio = medEditado.consultorio.trim();
    const telefonoLimpio = (medEditado.telefono || '').trim();
    const correoLimpio = (medEditado.correo || '').trim();
    const pinLimpio = (medEditado.pin || '').trim();

    if (nombreLimpio.length < 3) {
      return { ok: false, error: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (codigoLimpio.length < 4) {
      return { ok: false, error: 'El código institucional debe tener al menos 4 caracteres.' };
    }
    const duplicado = medicosLista.find(
      (m) => m.id !== medEditado.id && m.codigo.toUpperCase() === codigoLimpio
    );
    if (duplicado) {
      return {
        ok: false,
        error: `Ya existe otro médico con el código ${codigoLimpio} (${duplicado.nombre}).`,
      };
    }
    if (consultorioLimpio.length < 2) {
      return { ok: false, error: 'Ingresa un consultorio o ubicación válida.' };
    }
    if (!ESPECIALIDADES.some((e) => e.id === medEditado.especialidad)) {
      return { ok: false, error: 'Especialidad inválida.' };
    }
    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      return { ok: false, error: 'El correo electrónico no tiene un formato válido.' };
    }
    if (pinLimpio && !/^\d{4}$/.test(pinLimpio)) {
      return {
        ok: false,
        error: 'El PIN debe tener exactamente 4 dígitos numéricos (o déjalo vacío para usar el PIN por defecto).',
      };
    }

    const medicoFinal: MedicoBase = {
      id: medEditado.id,
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      especialidad: medEditado.especialidad,
      consultorio: consultorioLimpio,
      pin: pinLimpio || undefined,
      telefono: telefonoLimpio || undefined,
      correo: correoLimpio || undefined,
    };

    setMedicosPerfilLocal((prev) => ({
      ...prev,
      [medicoFinal.id]: {
        nombre: medicoFinal.nombre,
        consultorio: medicoFinal.consultorio,
        pin: medicoFinal.pin,
        telefono: medicoFinal.telefono,
        correo: medicoFinal.correo,
      },
    }));
    setMedicosLista((prev) =>
      prev.map((m) => (m.id === medicoFinal.id ? medicoFinal : m))
    );
    if (descansoNuevo !== undefined) {
      setDescansosMedicos((prev) => ({
        ...prev,
        [medicoFinal.id]: descansoNuevo,
      }));
    }
    setCitas((prev) =>
      prev.map((c) =>
        c.medicoId === medicoFinal.id
          ? {
              ...c,
              medicoNombre: medicoFinal.nombre,
              medicoCodigo: medicoFinal.codigo,
            }
          : c
      )
    );

    const resNube = await guardarMedicoConFallback(medicoFinal.id, {
      nombre: medicoFinal.nombre,
      codigo: medicoFinal.codigo,
      especialidad: medicoFinal.especialidad,
      consultorio: medicoFinal.consultorio,
      pin: medicoFinal.pin ?? null,
      telefono: medicoFinal.telefono ?? null,
      correo: medicoFinal.correo ?? null,
    });

    registrarAuditoria(
      sesionActual.admin.nombre,
      sesionActual.admin.titulo,
      'Edición Médico (N4)',
      `${medicoFinal.nombre} (${medicoFinal.codigo}) · ${medicoFinal.consultorio}${
        medicoFinal.pin ? ' · PIN personalizado' : ' · PIN por defecto'
      }.`
    );

    if (resNube.ok && !resNube.soloBaseNube) {
      const msg = `✓ Médico ${medicoFinal.nombre} (${medicoFinal.codigo}) y PIN actualizados en la nube.`;
      setMensajeMedicoGestion(msg);
      mostrarToast('ok', msg);
      return { ok: true };
    }
    if (resNube.soloBaseNube) {
      const msg = `✓ Datos base de ${medicoFinal.nombre} guardados en Supabase (PIN/contacto guardados localmente).`;
      setMensajeMedicoGestion(msg);
      mostrarToast('info', msg);
      return { ok: true, warning: msg };
    }
    const msgLocal = `✓ Cambios de ${medicoFinal.nombre} aplicados localmente (sin respuesta de escritura en Supabase).`;
    setMensajeMedicoGestion(msgLocal);
    mostrarToast('info', msgLocal);
    return { ok: true, warning: msgLocal };
  };

  const eliminarMedicoNube = (med: MedicoBase) => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    solicitarConfirmacion({
      titulo: 'Eliminar Médico',
      mensaje: `¿Desvincular a ${med.nombre} (${med.codigo})?`,
      textoConfirmar: 'Sí, eliminar médico',
      peligroso: true,
      onConfirmar: async () => {
        setMedicosLista((p) => p.filter((m) => m.id !== med.id));
        await sb(`medicos?id=eq.${encodeURIComponent(med.id)}`, 'DELETE');
        setMensajeMedicoGestion('Médico eliminado.');
        registrarAuditoria(
          admNombre,
          admTitulo,
          'Desvinculación Médico',
          med.nombre
        );
      },
    });
  };

  const restaurarMedicosBaseNube = () => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    solicitarConfirmacion({
      titulo: `Restaurar ${MEDICOS_BASE.length} Profesionales Base`,
      mensaje: `Se restaurará el directorio institucional completo (${MEDICOS_BASE.length} especialistas en ${ESPECIALIDADES.length} especialidades) y sus descansos escalonados. ¿Continuar?`,
      textoConfirmar: 'Sí, restaurar',
      peligroso: true,
      onConfirmar: async () => {
        setSincronizandoNube(true);
        try {
          const res = await sb('medicos', 'POST', MEDICOS_BASE, true);
          if (res.ok) {
            setMedicosLista(MEDICOS_BASE);
            setDescansosMedicos(construirMapaDescansosPorDefecto(MEDICOS_BASE));
            setMensajeMedicoGestion(
              `${MEDICOS_BASE.length} profesionales restaurados.`
            );
            registrarAuditoria(
              admNombre,
              admTitulo,
              'Restauración Médicos',
              `${MEDICOS_BASE.length} especialistas base.`
            );
          }
        } finally {
          setSincronizandoNube(false);
        }
      },
    });
  };

  const agregarNuevoAdministradorNube = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeAdminGestion('');
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    const nom = nuevoAdminNombre.trim();
    const ced = nuevoAdminCedula.trim();
    const pin = nuevoAdminPin.trim();
    if (!nom || ced.length < 4 || pin.length !== 4) {
      setMensajeAdminGestion('Completa nombre, cédula (4+ díg) y PIN (4 díg).');
      return;
    }
    if (administradores.some((a) => a.cedula === ced)) {
      setMensajeAdminGestion('Ya existe esa cédula.');
      return;
    }
    const info = DESCRIPCIONES_POR_NIVEL[nuevoAdminNivel];
    const nuevo: UsuarioAdministrativo = {
      cedula: ced,
      nombre: nom,
      titulo: info.titulo,
      nivel: nuevoAdminNivel,
      pin,
      descripcion: info.descripcion,
    };
    const res = await sb('administradores', 'POST', {
      cedula: ced,
      nombre: nom,
      rol_titulo: info.titulo,
      nivel: nuevoAdminNivel,
      pin,
    });
    if (res.ok) {
      setAdministradores((p) => [...p, nuevo]);
      setNuevoAdminNombre('');
      setNuevoAdminCedula('');
      setNuevoAdminPin('');
      setMensajeAdminGestion(`Admin ${nom} guardado.`);
      registrarAuditoria(
        sesionActual.admin.nombre,
        sesionActual.admin.titulo,
        'Creación Admin',
        `${nom} (Nivel ${nuevoAdminNivel}).`
      );
    } else {
      setMensajeAdminGestion(`Error: ${await res.text()}`);
    }
  };

  const eliminarAdministradorNube = (adm: UsuarioAdministrativo) => {
    if (
      sesionActual?.tipo !== 'admin' ||
      sesionActual.admin.nivel < 4 ||
      adm.cedula === '1005005005' ||
      adm.cedula === '4004'
    )
      return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    solicitarConfirmacion({
      titulo: 'Eliminar Admin',
      mensaje: `¿Revocar acceso de ${adm.nombre} (Nivel ${adm.nivel})?`,
      textoConfirmar: 'Sí, eliminar',
      peligroso: true,
      onConfirmar: async () => {
        setAdministradores((p) => p.filter((a) => a.cedula !== adm.cedula));
        await sb(
          `administradores?cedula=eq.${encodeURIComponent(adm.cedula)}`,
          'DELETE'
        );
        setMensajeAdminGestion('Admin eliminado.');
        registrarAuditoria(
          admNombre,
          admTitulo,
          'Eliminación Admin',
          adm.nombre
        );
      },
    });
  };

  const sincronizarTarifasEspecialidadesNube = async (
    consMap: Record<string, number>,
    procMap: Record<string, number>,
    fallbackConsulta: number,
    fallbackProc?: number
  ): Promise<{ ok: boolean; error?: string }> => {
    const filas = ESPECIALIDADES.map((esp) => ({
      especialidad_id: esp.id,
      especialidad_nombre: esp.nombre,
      area_id: esp.areaId,
      tarifa_consulta: consMap[esp.id] ?? esp.tarifaParticular ?? fallbackConsulta,
      tarifa_procedimiento: obtenerValorReferencialProcedimiento(
        esp.id,
        consMap,
        fallbackConsulta,
        procMap,
        fallbackProc
      ),
      updated_at: new Date().toISOString(),
    }));
    try {
      const res = await sb('tarifas_especialidades', 'POST', filas, true);
      if (!res.ok) {
        return {
          ok: false,
          error: (await res.text().catch(() => '')) || `HTTP ${res.status}`,
        };
      }
      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Error de red',
      };
    }
  };

  const sincronizarTarifasProcedimientosNube = async (
    procCatalogoMap: Record<string, number>
  ): Promise<{ ok: boolean; error?: string }> => {
    const filas = PROCEDIMIENTOS_CATALOGO.map((proc) => ({
      procedimiento_id: proc.id,
      especialidad_id: proc.especialidadId,
      area_id: proc.areaId,
      nombre: proc.nombre,
      duracion_min: proc.duracionMin,
      tarifa_particular:
        procCatalogoMap[proc.id] ?? proc.tarifaParticular,
      es_variable: Boolean(proc.esVariable),
      activo: true,
      updated_at: new Date().toISOString(),
    }));
    try {
      const res = await sb('tarifas_procedimientos', 'POST', filas, true);
      if (!res.ok) {
        return {
          ok: false,
          error: (await res.text().catch(() => '')) || `HTTP ${res.status}`,
        };
      }
      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Error de red',
      };
    }
  };

  const guardarTarifarioProcedimientosNube = async () => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    setMensajeTarifarioProcAdmin('');
    setGuardandoTarifarioProc(true);
    try {
      const r = await sincronizarTarifasProcedimientosNube(
        tarifasCatalogoProcedimientos
      );
      if (r.ok) {
        setMensajeTarifarioProcAdmin(
          `✓ Tarifario de ${PROCEDIMIENTOS_CATALOGO.length} procedimientos guardado en Supabase.`
        );
        registrarAuditoria(
          sesionActual.admin.nombre,
          sesionActual.admin.titulo,
          'Tarifario Procedimientos',
          `Actualizado en nube (${PROCEDIMIENTOS_CATALOGO.length} procedimientos).`
        );
        mostrarToast('ok', 'Tarifario de procedimientos guardado en Supabase.');
      } else {
        setMensajeTarifarioProcAdmin(
          `No se pudo guardar en Supabase: ${r.error}`
        );
        mostrarToast('error', `Error guardando procedimientos: ${r.error}`);
      }
    } finally {
      setGuardandoTarifarioProc(false);
    }
  };

  const guardarTarifarioEspecialidadesNube = async () => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    setMensajeTarifarioAdmin('');
    setGuardandoTarifario(true);
    try {
      const r = await sincronizarTarifasEspecialidadesNube(
        tarifasParticulares,
        tarifasProcedimientos,
        tarifas.particular,
        tarifas.particularProcedimiento
      );
      if (r.ok) {
        setMensajeTarifarioAdmin(
          `✓ Tarifario de ${ESPECIALIDADES.length} especialidades (Consulta y Procedimiento) guardado en Supabase.`
        );
        registrarAuditoria(
          sesionActual.admin.nombre,
          sesionActual.admin.titulo,
          'Tarifario Especialidades',
          `Actualizado en nube (${ESPECIALIDADES.length} especialidades).`
        );
        mostrarToast('ok', 'Tarifario por especialidad guardado en Supabase.');
      } else {
        setMensajeTarifarioAdmin(`No se pudo guardar en Supabase: ${r.error}`);
        mostrarToast('error', `Error guardando tarifario: ${r.error}`);
      }
    } finally {
      setGuardandoTarifario(false);
    }
  };

  const guardarConfiguracionNube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    setMensajeConfigAdmin('');
    setEnviandoFormulario(true);
    try {
      const payloadCfg: Record<string, unknown> = {
        id: 'global',
        umbral_alerta_agendadas: umbralAlertaAgendadas,
        umbral_alerta_atendidas: umbralAlertaAtendidas,
        tope_maximo_citas: topeMaximoCitas,
        tarifa_a: tarifas.A,
        tarifa_b: tarifas.B,
        tarifa_c: tarifas.C,
        tarifa_particular: tarifas.particular,
        tarifa_particular_procedimiento: tarifas.particularProcedimiento ?? 75000,
        updated_at: new Date().toISOString(),
      };
      let res = await sb('configuracion', 'POST', payloadCfg, true);
      if (!res.ok) {
        const errTxt = await res.clone().text().catch(() => '');
        if (errTxt.includes('tarifa_particular_procedimiento')) {
          const sinNuevaCol = { ...payloadCfg };
          delete sinNuevaCol.tarifa_particular_procedimiento;
          res = await sb('configuracion', 'POST', sinNuevaCol, true);
        }
      }
      await sincronizarTarifasEspecialidadesNube(
        tarifasParticulares,
        tarifasProcedimientos,
        tarifas.particular,
        tarifas.particularProcedimiento
      );
      if (res.ok) {
        setMensajeConfigAdmin(
          '✓ Parámetros y tarifario (Consulta / Procedimiento) guardados en Supabase.'
        );
        registrarAuditoria(
          sesionActual.admin.nombre,
          sesionActual.admin.titulo,
          'Parametrización',
          `Ag:${umbralAlertaAgendadas}, At:${umbralAlertaAtendidas}, Max:${topeMaximoCitas}, Cons:$${tarifas.particular}, Proc:$${tarifas.particularProcedimiento ?? 75000}.`
        );
        mostrarToast('ok', 'Parámetros y tarifas guardados.');
      } else {
        setMensajeConfigAdmin(`Error: ${await res.text()}`);
      }
    } catch {
      setMensajeConfigAdmin('Error de red.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const vaciarBaseDatosNubeACero = () => {
    if (sesionActual?.tipo !== 'admin' || sesionActual.admin.nivel < 4) return;
    const admNombre = sesionActual.admin.nombre;
    const admTitulo = sesionActual.admin.titulo;
    solicitarConfirmacion({
      titulo: 'Vaciar Citas y Pacientes Nuevos',
      mensaje:
        'Se eliminarán TODAS las citas y pacientes nuevos en Supabase. ¿Continuar?',
      textoConfirmar: 'Sí, vaciar ahora',
      peligroso: true,
      onConfirmar: async () => {
        setSincronizandoNube(true);
        try {
          await Promise.all([
            sb('citas?id=neq.NINGUNO', 'DELETE'),
            sb('pacientes?cedula=neq.NINGUNO', 'DELETE'),
          ]);
          setCitas([]);
          setPacientes(PACIENTES_BASE_SISTEMA);
          setPacienteSeleccionadoAdmin(null);
          registrarAuditoria(
            admNombre,
            admTitulo,
            'Limpieza Nube',
            'Vació citas y pacientes nuevos.'
          );
          mostrarToast('info', 'Base operativa reiniciada.');
        } finally {
          setSincronizandoNube(false);
        }
      },
    });
  };

  const citasDelPaciente =
    sesionActual?.tipo === 'paciente'
      ? citas.filter((c) => c.pacienteCedula === sesionActual.paciente.cedula)
      : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <style>{`:root,html,body{color-scheme:light!important;background-color:#f8fafc!important;color:#0f172a!important}input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),select,textarea{background-color:#ffffff!important;color:#0f172a!important;color-scheme:light!important}code{background-color:#f1f5f9!important;color:#0f172a!important}@media print{body *{visibility:hidden}#tirilla-imprimible,#tirilla-imprimible *{visibility:visible}#tirilla-imprimible{position:fixed;left:0;top:0;width:100%;max-width:100%;box-shadow:none!important;border:none!important}.no-print{display:none!important}}`}</style>
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[70] max-w-md px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
            toast.tipo === 'ok'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.tipo === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-sky-900 text-white border-sky-700'
          }`}
        >
          <Ic
            n={toast.tipo === 'ok' ? 'check' : 'alert'}
            c="w-4 h-4 shrink-0"
          />
          <span>{toast.texto}</span>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-8">
          {!sesionActual ? (
            <>
              <a
                href="#portal-acceso"
                className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
              >
                <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center shrink-0">
                  <IconHeartPulse className="w-5 h-5" />
                </span>
                <span>IPS Salud Viva</span>
              </a>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <a
                  href="#servicios"
                  className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Servicios
                </a>
                <a
                  href="#directorio"
                  className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Directorio
                </a>
                <a
                  href="#instructivo"
                  className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Instructivo
                </a>
                <a
                  href="#canales"
                  className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Canales
                </a>
              </nav>

              <div className="flex items-center shrink-0">
                <a
                  href="#tarjeta-acceso"
                  onClick={() => {
                    setModoAccesoInicio('registrado');
                    setErrorLogin('');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  Ingresar al Portal
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center">
                  <IconHeartPulse />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-slate-900 block leading-none">
                    IPS Salud Viva
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <Ic n="clock" c="w-3.5 h-3.5" />
                    <span>Barranquilla · Jornada Continua 06:00 AM – 06:00 PM</span>
                  </span>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-1.5">
                {sesionActual.tipo === 'paciente' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setPestanaActiva('asistente')}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                        pestanaActiva === 'asistente'
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Asistente Virtual
                    </button>
                    <button
                      type="button"
                      onClick={() => setPestanaActiva('mis_citas')}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                        pestanaActiva === 'mis_citas'
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Mis Citas</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          pestanaActiva === 'mis_citas'
                            ? 'bg-white text-sky-700'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {citasDelPaciente.length}
                      </span>
                    </button>
                  </>
                ) : sesionActual.tipo === 'medico' ? (
                  <button
                    type="button"
                    onClick={() => setPestanaActiva('medico_panel')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                      pestanaActiva === 'medico_panel'
                        ? 'bg-indigo-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mi Consultorio Médico
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPestanaActiva('admin_panel')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                      pestanaActiva === 'admin_panel'
                        ? 'bg-teal-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Panel de Administración
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPestanaActiva('normativa')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                    pestanaActiva === 'normativa'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Normativa SGSSS
                </button>
                <button
                  type="button"
                  onClick={() => setPestanaActiva('contacto')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                    pestanaActiva === 'contacto'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Contacto
                </button>
              </nav>

              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      nubeConectada ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>
                    {sincronizandoNube
                      ? 'Sincronizando...'
                      : nubeConectada
                      ? `En vivo${ultimaSyncHora ? ` (${ultimaSyncHora})` : ''}`
                      : 'Reconectando'}
                  </span>
                </span>
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900">
                    {sesionActual.tipo === 'paciente'
                      ? `${sesionActual.paciente.nombres} ${sesionActual.paciente.apellidos}`
                      : sesionActual.tipo === 'medico'
                      ? sesionActual.medico.nombre
                      : sesionActual.admin.nombre}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {sesionActual.tipo === 'paciente'
                      ? `${sesionActual.paciente.eps} · CC ${sesionActual.paciente.cedula}`
                      : sesionActual.tipo === 'medico'
                      ? `${sesionActual.medico.codigo} · ${sesionActual.medico.consultorio}`
                      : sesionActual.admin.titulo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold"
                >
                  <Ic n="logout" c="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main
        className={
          !sesionActual
            ? 'w-full flex-1'
            : 'max-w-7xl w-full mx-auto px-4 py-6 flex-1'
        }
      >
        {!sesionActual ? (
          <LoginView
            modoAccesoInicio={modoAccesoInicio}
            setModoAccesoInicio={setModoAccesoInicio}
            errorLogin={errorLogin}
            setErrorLogin={setErrorLogin}
            cedulaLogin={cedulaLogin}
            setCedulaLogin={setCedulaLogin}
            pinPacienteLogin={pinPacienteLogin}
            setPinPacienteLogin={setPinPacienteLogin}
            recuperandoPin={recuperandoPin}
            handleRecuperarPinCorreo={handleRecuperarPinCorreo}
            handleLoginPacienteRegistrado={handleLoginPacienteRegistrado}
            enviandoFormulario={enviandoFormulario}
            nuevoNombres={nuevoNombres}
            setNuevoNombres={setNuevoNombres}
            nuevoApellidos={nuevoApellidos}
            setNuevoApellidos={setNuevoApellidos}
            nuevoCedula={nuevoCedula}
            setNuevoCedula={setNuevoCedula}
            nuevoPinPaciente={nuevoPinPaciente}
            setNuevoPinPaciente={setNuevoPinPaciente}
            nuevoTelefono={nuevoTelefono}
            setNuevoTelefono={setNuevoTelefono}
            nuevoCorreo={nuevoCorreo}
            setNuevoCorreo={setNuevoCorreo}
            nuevoEps={nuevoEps}
            setNuevoEps={setNuevoEps}
            nuevoRegimen={nuevoRegimen}
            setNuevoRegimen={setNuevoRegimen}
            nuevoTipoAfiliacion={nuevoTipoAfiliacion}
            setNuevoTipoAfiliacion={setNuevoTipoAfiliacion}
            nuevoRango={nuevoRango}
            setNuevoRango={setNuevoRango}
            aceptoHabeasDataNuevo={aceptoHabeasDataNuevo}
            setAceptoHabeasDataNuevo={setAceptoHabeasDataNuevo}
            handleRegistroUsuarioNuevo={handleRegistroUsuarioNuevo}
            tarifas={tarifas}
            segundosBloqueoAdmin={segundosBloqueoAdmin}
            cedulaAdminLogin={cedulaAdminLogin}
            setCedulaAdminLogin={setCedulaAdminLogin}
            pinAdmin={pinAdmin}
            setPinAdmin={setPinAdmin}
            handleLoginAdmin={handleLoginAdmin}
            codigoMedicoLogin={codigoMedicoLogin}
            setCodigoMedicoLogin={setCodigoMedicoLogin}
            pinMedicoLogin={pinMedicoLogin}
            setPinMedicoLogin={setPinMedicoLogin}
            handleLoginMedico={handleLoginMedico}
            medicosLista={medicosLista}
            tarifasParticulares={tarifasParticulares}
          />
        ) : (
          <>
            {pestanaActiva === 'asistente' &&
              sesionActual.tipo === 'paciente' && (
                <AsistenteVirtualView
                  paciente={sesionActual.paciente}
                  citasCount={citasDelPaciente.length}
                  tarifas={tarifas}
                  tarifasParticulares={tarifasParticulares}
                  tarifasProcedimientos={tarifasProcedimientos}
                  tarifasCatalogoProcedimientos={tarifasCatalogoProcedimientos}
                  editandoPerfilPaciente={editandoPerfilPaciente}
                  setEditandoPerfilPaciente={setEditandoPerfilPaciente}
                  abrirEdicionPerfilPaciente={abrirEdicionPerfilPaciente}
                  guardarEdicionPerfilPaciente={guardarEdicionPerfilPaciente}
                  mensajePerfilPaciente={mensajePerfilPaciente}
                  editPacCedula={editPacCedula}
                  setEditPacCedula={setEditPacCedula}
                  editPacPin={editPacPin}
                  setEditPacPin={setEditPacPin}
                  editPacNombres={editPacNombres}
                  setEditPacNombres={setEditPacNombres}
                  editPacApellidos={editPacApellidos}
                  setEditPacApellidos={setEditPacApellidos}
                  editPacTelefono={editPacTelefono}
                  setEditPacTelefono={setEditPacTelefono}
                  editPacCorreo={editPacCorreo}
                  setEditPacCorreo={setEditPacCorreo}
                  editPacEps={editPacEps}
                  setEditPacEps={setEditPacEps}
                  editPacRegimen={editPacRegimen}
                  setEditPacRegimen={setEditPacRegimen}
                  editPacTipoAfiliacion={editPacTipoAfiliacion}
                  setEditPacTipoAfiliacion={setEditPacTipoAfiliacion}
                  editPacRango={editPacRango}
                  setEditPacRango={setEditPacRango}
                  enviandoFormulario={enviandoFormulario}
                  iniciarAsistenteParaPaciente={iniciarAsistenteParaPaciente}
                  irAMisCitas={() => setPestanaActiva('mis_citas')}
                  mensajes={mensajes}
                  pasoChat={pasoChat}
                  manejarSeleccionOpcionChat={manejarSeleccionOpcionChat}
                  chatEndRef={chatEndRef}
                  chatAreaServicio={chatAreaServicio}
                  setChatAreaServicio={setChatAreaServicio}
                  chatEspId={chatEspId}
                  setChatEspId={setChatEspId}
                  chatTipoAtencion={chatTipoAtencion}
                  setChatTipoAtencion={setChatTipoAtencion}
                  chatProcId={chatProcId}
                  setChatProcId={setChatProcId}
                  chatProcPersonalizadoNombre={chatProcPersonalizadoNombre}
                  setChatProcPersonalizadoNombre={
                    setChatProcPersonalizadoNombre
                  }
                  chatProcPersonalizadoDetalle={chatProcPersonalizadoDetalle}
                  setChatProcPersonalizadoDetalle={
                    setChatProcPersonalizadoDetalle
                  }
                  confirmarEspecialidadChat={confirmarEspecialidadChat}
                  fechaInputTemp={fechaInputTemp}
                  setFechaInputTemp={setFechaInputTemp}
                  hoyIsoActual={hoyIsoActual}
                  maxFechaMesIso={maxFechaMesIso}
                  confirmarFechaCalendarioPaciente={
                    confirmarFechaCalendarioPaciente
                  }
                  alertaDescansoChat={alertaDescansoChat}
                  seleccionarSuplentePorDescanso={seleccionarSuplentePorDescanso}
                  fotoOrdenData={fotoOrdenData}
                  fotoAutorizacionData={fotoAutorizacionData}
                  cargandoImagen={cargandoImagen}
                  manejarArchivoFoto={manejarArchivoFoto}
                  motivoConsultaTemp={motivoConsultaTemp}
                  setMotivoConsultaTemp={setMotivoConsultaTemp}
                  confirmarEnvioFotosYAgendar={confirmarEnvioFotosYAgendar}
                  ultimaCitaAgendada={ultimaCitaAgendada}
                  tiposAtencionCitas={tiposAtencionCitas}
                  obtenerConsultorioPorMedico={obtenerConsultorioPorMedico}
                  onVerQr={(cita) => setModalTirillaCita(cita)}
                  onVerFactura={(cita) => setModalFacturaCita(cita)}
                />
              )}

            {pestanaActiva === 'medico_panel' &&
              sesionActual.tipo === 'medico' && (
                <MedicoPanelView
                  medicoActual={sesionActual.medico}
                  citasDelMedico={citas.filter(
                    (c) => c.medicoId === sesionActual.medico.id
                  )}
                  hoyIsoActual={hoyIsoActual}
                  tiposAtencionCitas={tiposAtencionCitas}
                  obtenerConsultorioPorMedico={obtenerConsultorioPorMedico}
                  onVerImagen={(titulo, url) =>
                    setModalImagenUrl({ titulo, url })
                  }
                  notaClinicaTemp={notaClinicaTemp}
                  setNotaClinicaTemp={setNotaClinicaTemp}
                  guardandoCitaMedicoId={guardandoCitaMedicoId}
                  guardarNotaClinicaMedico={guardarNotaClinicaMedico}
                  finalizarConsultaMedico={finalizarConsultaMedico}
                  editandoPerfilMedico={editandoPerfilMedico}
                  setEditandoPerfilMedico={setEditandoPerfilMedico}
                  guardandoPerfilMedico={guardandoPerfilMedico}
                  guardarPerfilMedico={guardarPerfilMedico}
                  descansoSemanalNombre={
                    descansosMedicos[sesionActual.medico.id] !== undefined &&
                    descansosMedicos[sesionActual.medico.id] >= 0
                      ? obtenerNombreDiaSemana(
                          descansosMedicos[sesionActual.medico.id]
                        )
                      : undefined
                  }
                />
              )}

            {pestanaActiva === 'mis_citas' &&
              sesionActual.tipo === 'paciente' && (
                <MisCitasView
                  citasDelPaciente={citasDelPaciente}
                  recibosCitas={recibosCitas}
                  tiposAtencionCitas={tiposAtencionCitas}
                  apartadosDocs={apartadosDocs}
                  ahoraMs={ahoraMs}
                  soportesPendientesTemp={soportesPendientesTemp}
                  manejarArchivoApartado={manejarArchivoApartado}
                  confirmarSubidaApartado={confirmarSubidaApartado}
                  subiendoApartadoId={subiendoApartadoId}
                  obtenerConsultorioPorMedico={obtenerConsultorioPorMedico}
                  califEsperaTemp={califEsperaTemp}
                  setCalifEsperaTemp={setCalifEsperaTemp}
                  califTratoTemp={califTratoTemp}
                  setCalifTratoTemp={setCalifTratoTemp}
                  califClaridadTemp={califClaridadTemp}
                  setCalifClaridadTemp={setCalifClaridadTemp}
                  comentarioSatTemp={comentarioSatTemp}
                  setComentarioSatTemp={setComentarioSatTemp}
                  guardarEncuestaSatisfaccionPaciente={
                    guardarEncuestaSatisfaccionPaciente
                  }
                  cancelarCitaPaciente={cancelarCitaPaciente}
                  onReprogramarCita={abrirModalReprogramacion}
                  onIrAsistente={() => setPestanaActiva('asistente')}
                  onVerQr={(cita) => setModalTirillaCita(cita)}
                  onVerFactura={(cita) => setModalFacturaCita(cita)}
                  onVerImagen={(titulo, url) =>
                    setModalImagenUrl({ titulo, url })
                  }
                />
              )}

            {pestanaActiva === 'admin_panel' &&
              sesionActual.tipo === 'admin' && (
                <AdminPanelView
                  adminActual={sesionActual.admin}
                  subTabAdmin={subTabAdmin}
                  setSubTabAdmin={setSubTabAdmin}
                  citas={citas}
                  medicos={medicos}
                  medicosLista={medicosLista}
                  administradores={administradores}
                  pacientes={pacientes}
                  auditoria={auditoria}
                  topeMaximoCitas={topeMaximoCitas}
                  setTopeMaximoCitas={setTopeMaximoCitas}
                  umbralAlertaAgendadas={umbralAlertaAgendadas}
                  setUmbralAlertaAgendadas={setUmbralAlertaAgendadas}
                  umbralAlertaAtendidas={umbralAlertaAtendidas}
                  setUmbralAlertaAtendidas={setUmbralAlertaAtendidas}
                  tarifas={tarifas}
                  setTarifas={setTarifas}
                  tarifasParticulares={tarifasParticulares}
                  tarifasProcedimientos={tarifasProcedimientos}
                  tarifasCatalogoProcedimientos={tarifasCatalogoProcedimientos}
                  onCambiarTarifaParticularEsp={(espId, val) => {
                    const nextCons = { ...tarifasParticulares, [espId]: val };
                    setTarifasParticulares(nextCons);
                    const espObj = ESPECIALIDADES.find((x) => x.id === espId);
                    if (espObj) {
                      sb(
                        'tarifas_especialidades',
                        'POST',
                        {
                          especialidad_id: espObj.id,
                          especialidad_nombre: espObj.nombre,
                          area_id: espObj.areaId,
                          tarifa_consulta: val,
                          tarifa_procedimiento:
                            obtenerValorReferencialProcedimiento(
                              espObj.id,
                              nextCons,
                              tarifas.particular,
                              tarifasProcedimientos,
                              tarifas.particularProcedimiento
                            ),
                          updated_at: new Date().toISOString(),
                        },
                        true
                      ).catch(() => {});
                    }
                  }}
                  onCambiarTarifaProcedimientoEsp={(espId, val) => {
                    const nextProc = { ...tarifasProcedimientos, [espId]: val };
                    setTarifasProcedimientos(nextProc);
                    const espObj = ESPECIALIDADES.find((x) => x.id === espId);
                    if (espObj) {
                      sb(
                        'tarifas_especialidades',
                        'POST',
                        {
                          especialidad_id: espObj.id,
                          especialidad_nombre: espObj.nombre,
                          area_id: espObj.areaId,
                          tarifa_consulta:
                            tarifasParticulares[espObj.id] ??
                            espObj.tarifaParticular,
                          tarifa_procedimiento: val,
                          updated_at: new Date().toISOString(),
                        },
                        true
                      ).catch(() => {});
                    }
                  }}
                  onCambiarTarifaCatalogoProc={(procId, val) => {
                    setTarifasCatalogoProcedimientos((prev) => ({
                      ...prev,
                      [procId]: val,
                    }));
                    const procObj = obtenerProcedimientoPorId(procId);
                    if (procObj) {
                      sb(
                        'tarifas_procedimientos',
                        'POST',
                        {
                          procedimiento_id: procObj.id,
                          especialidad_id: procObj.especialidadId,
                          area_id: procObj.areaId,
                          nombre: procObj.nombre,
                          duracion_min: procObj.duracionMin,
                          tarifa_particular: val,
                          es_variable: Boolean(procObj.esVariable),
                          activo: true,
                          updated_at: new Date().toISOString(),
                        },
                        true
                      ).catch(() => {});
                    }
                  }}
                  onRestaurarTarifasParticulares={() => {
                    setTarifasParticulares({});
                    setTarifasProcedimientos({});
                    sincronizarTarifasEspecialidadesNube(
                      {},
                      {},
                      tarifas.particular,
                      tarifas.particularProcedimiento
                    );
                    setMensajeTarifarioAdmin(
                      '✓ Valores restaurados a tarifas base y sincronizados.'
                    );
                    mostrarToast(
                      'info',
                      'Tarifario Consulta y Procedimiento restaurado a valores base.'
                    );
                  }}
                  onRestaurarTarifasCatalogoProc={() => {
                    setTarifasCatalogoProcedimientos({});
                    sincronizarTarifasProcedimientosNube({});
                    setMensajeTarifarioProcAdmin(
                      '✓ Precios del catálogo de procedimientos restaurados a sus valores base.'
                    );
                    mostrarToast(
                      'info',
                      'Catálogo de procedimientos restaurado a valores base.'
                    );
                  }}
                  onGuardarTarifarioEspecialidadesNube={
                    guardarTarifarioEspecialidadesNube
                  }
                  onGuardarTarifarioProcedimientosNube={
                    guardarTarifarioProcedimientosNube
                  }
                  mensajeTarifarioAdmin={mensajeTarifarioAdmin}
                  mensajeTarifarioProcAdmin={mensajeTarifarioProcAdmin}
                  guardandoTarifario={guardandoTarifario}
                  guardandoTarifarioProc={guardandoTarifarioProc}
                  correosMetaCitas={correosMetaCitas}
                  cooldownCorreoMs={COOLDOWN_CORREO_ADMIN_MS}
                  descansosMedicos={descansosMedicos}
                  onCambiarDescansoMedico={(medicoId, dia) => {
                    setDescansosMedicos((prev) => ({
                      ...prev,
                      [medicoId]: dia,
                    }));
                    mostrarToast(
                      'ok',
                      `Descanso semanal actualizado (${obtenerNombreDiaSemana(
                        dia
                      )}).`
                    );
                  }}
                  auxiliarTurno={auxiliarTurno}
                  onActualizarAuxiliarTurno={setAuxiliarTurno}
                  hoyIsoActual={hoyIsoActual}
                  sincronizandoNube={sincronizandoNube}
                  enviandoFormulario={enviandoFormulario}
                  descargarReporteExcel={descargarReporteExcel}
                  obtenerConsultorioPorMedico={obtenerConsultorioPorMedico}
                  busquedaAgendaAdmin={busquedaAgendaAdmin}
                  setBusquedaAgendaAdmin={setBusquedaAgendaAdmin}
                  filtroAreaAdmin={filtroAreaAdmin}
                  setFiltroAreaAdmin={setFiltroAreaAdmin}
                  filtroEstadoCitaAdmin={filtroEstadoCitaAdmin}
                  setFiltroEstadoCitaAdmin={setFiltroEstadoCitaAdmin}
                  filtroEstadoDocAdmin={filtroEstadoDocAdmin}
                  setFiltroEstadoDocAdmin={setFiltroEstadoDocAdmin}
                  observacionTemp={observacionTemp}
                  setObservacionTemp={setObservacionTemp}
                  enviandoCorreoId={enviandoCorreoId}
                  actualizarEstadoDocumentos={actualizarEstadoDocumentos}
                  asignarDuracionCitaAdmin={asignarDuracionCitaAdmin}
                  handleEnviarRecordatorioCorreo={
                    handleEnviarRecordatorioCorreo
                  }
                  abrirModalReprogramacion={abrirModalReprogramacion}
                  ejecutarActualizacionEstadoCitaAdmin={
                    ejecutarActualizacionEstadoCitaAdmin
                  }
                  solicitarCancelarCitaAdmin={solicitarCancelarCitaAdmin}
                  eliminarCitaDeNube={eliminarCitaDeNube}
                  codigoQrInput={codigoQrInput}
                  setCodigoQrInput={setCodigoQrInput}
                  validarCodigoQrEnAdmisiones={validarCodigoQrEnAdmisiones}
                  resultadoLectorQr={resultadoLectorQr}
                  setResultadoLectorQr={setResultadoLectorQr}
                  metodoPagoTemp={metodoPagoTemp}
                  setMetodoPagoTemp={setMetodoPagoTemp}
                  reciboInputTemp={reciboInputTemp}
                  setReciboInputTemp={setReciboInputTemp}
                  recibosCitas={recibosCitas}
                  tiposAtencionCitas={tiposAtencionCitas}
                  apartadosDocs={apartadosDocs}
                  ahoraMs={ahoraMs}
                  onVerFactura={(cita) => setModalFacturaCita(cita)}
                  onVerImagen={(titulo, url) =>
                    setModalImagenUrl({ titulo, url })
                  }
                  nuevoMedNombre={nuevoMedNombre}
                  setNuevoMedNombre={setNuevoMedNombre}
                  nuevoMedCodigo={nuevoMedCodigo}
                  setNuevoMedCodigo={setNuevoMedCodigo}
                  nuevoMedAreaServ={nuevoMedAreaServ}
                  setNuevoMedAreaServ={setNuevoMedAreaServ}
                  nuevoMedArea={nuevoMedArea}
                  setNuevoMedArea={setNuevoMedArea}
                  nuevoMedConsultorio={nuevoMedConsultorio}
                  setNuevoMedConsultorio={setNuevoMedConsultorio}
                  nuevoMedDescanso={nuevoMedDescanso}
                  setNuevoMedDescanso={setNuevoMedDescanso}
                  filtroMedGestion={filtroMedGestion}
                  setFiltroMedGestion={setFiltroMedGestion}
                  mensajeMedicoGestion={mensajeMedicoGestion}
                  agregarNuevoMedicoAdmin={agregarNuevoMedicoAdmin}
                  actualizarMedicoDesdeAdmin={actualizarMedicoDesdeAdmin}
                  eliminarMedicoNube={eliminarMedicoNube}
                  restaurarMedicosBaseNube={restaurarMedicosBaseNube}
                  nuevoAdminNombre={nuevoAdminNombre}
                  setNuevoAdminNombre={setNuevoAdminNombre}
                  nuevoAdminCedula={nuevoAdminCedula}
                  setNuevoAdminCedula={setNuevoAdminCedula}
                  nuevoAdminNivel={nuevoAdminNivel}
                  setNuevoAdminNivel={setNuevoAdminNivel}
                  nuevoAdminPin={nuevoAdminPin}
                  setNuevoAdminPin={setNuevoAdminPin}
                  mensajeAdminGestion={mensajeAdminGestion}
                  agregarNuevoAdministradorNube={agregarNuevoAdministradorNube}
                  eliminarAdministradorNube={eliminarAdministradorNube}
                  busquedaPacienteAdmin={busquedaPacienteAdmin}
                  setBusquedaPacienteAdmin={setBusquedaPacienteAdmin}
                  pacienteOriginalCedulaAdmin={pacienteOriginalCedulaAdmin}
                  pacienteSeleccionadoAdmin={pacienteSeleccionadoAdmin}
                  setPacienteSeleccionadoAdmin={setPacienteSeleccionadoAdmin}
                  seleccionarPacienteEnAdmin={seleccionarPacienteEnAdmin}
                  adminPacRegimen={adminPacRegimen}
                  setAdminPacRegimen={setAdminPacRegimen}
                  adminPacTipoAfiliacion={adminPacTipoAfiliacion}
                  setAdminPacTipoAfiliacion={setAdminPacTipoAfiliacion}
                  adminPacRango={adminPacRango}
                  setAdminPacRango={setAdminPacRango}
                  mensajePacienteAdmin={mensajePacienteAdmin}
                  guardarEdicionPacienteDesdeAdmin={
                    guardarEdicionPacienteDesdeAdmin
                  }
                  mensajeConfigAdmin={mensajeConfigAdmin}
                  guardarConfiguracionNube={guardarConfiguracionNube}
                  vaciarBaseDatosNubeACero={vaciarBaseDatosNubeACero}
                  autoRecordatorios24hActivo={autoRecordatorios24hActivo}
                  onToggleAutoRecordatorios24h={setAutoRecordatorios24hActivo}
                  onEjecutarAutoRecordatorios24h={() =>
                    ejecutarAutoRecordatorios24h(true)
                  }
                  citasMananaCount={citasParaManana.length}
                  enviados24hCount={enviados24hMananaCount}
                  ejecutandoRecordatorios24h={ejecutandoRecordatorios24h}
                />
              )}

            {pestanaActiva === 'normativa' && (
              <NormativaSgsssView
                tarifas={tarifas}
                tarifasParticulares={tarifasParticulares}
                tarifasProcedimientos={tarifasProcedimientos}
              />
            )}

            {pestanaActiva === 'contacto' && <ContactoView />}
          </>
        )}
      </main>

      {modalConfirmacion && (
        <ModalConfirmacion
          modal={modalConfirmacion}
          ejecutando={ejecutandoConfirmacion}
          onCerrar={() => setModalConfirmacion(null)}
          onConfirmar={ejecutarConfirmacion}
        />
      )}

      {citaReprogramando && (
        <ModalReprogramacion
          citaReprogramando={citaReprogramando}
          reproAreaServicio={reproAreaServicio}
          setReproAreaServicio={setReproAreaServicio}
          reproEspecialidad={reproEspecialidad}
          setReproEspecialidad={setReproEspecialidad}
          reproMedicoId={reproMedicoId}
          setReproMedicoId={setReproMedicoId}
          reproFecha={reproFecha}
          setReproFecha={setReproFecha}
          reproHora={reproHora}
          setReproHora={setReproHora}
          reproMotivo={reproMotivo}
          setReproMotivo={setReproMotivo}
          errorReprogramacion={errorReprogramacion}
          setErrorReprogramacion={setErrorReprogramacion}
          medicos={medicos}
          medicosLista={medicosLista}
          citas={citas}
          descansosMedicos={descansosMedicos}
          auxiliarTurno={auxiliarTurno}
          topeMaximoCitas={topeMaximoCitas}
          hoyIsoActual={hoyIsoActual}
          maxFechaMesIso={maxFechaMesIso}
          enviandoFormulario={enviandoFormulario}
          onCerrar={() => setCitaReprogramando(null)}
          onConfirmar={confirmarReprogramacionReal}
          onCancelarCita={cancelarDesdeModalReprogramacion}
          modoPaciente={sesionActual?.tipo === 'paciente'}
        />
      )}

      {modalImagenUrl && (
        <ModalImagenSoporte
          imagen={modalImagenUrl}
          onCerrar={() => setModalImagenUrl(null)}
        />
      )}

      {modalTirillaCita && (
        <ModalTirillaQr
          cita={modalTirillaCita}
          consultorio={obtenerConsultorioPorMedico(modalTirillaCita.medicoId)}
          reciboNumero={
            recibosCitas[modalTirillaCita.id] || modalTirillaCita.reciboNumero
          }
          onCerrar={() => setModalTirillaCita(null)}
        />
      )}

      {modalFacturaCita && (
        <ModalFacturaRecibo
          cita={modalFacturaCita}
          consultorio={obtenerConsultorioPorMedico(modalFacturaCita.medicoId)}
          reciboNumero={
            recibosCitas[modalFacturaCita.id] || modalFacturaCita.reciboNumero
          }
          tipoAtencion={determinarTipoAtencionCita(
            modalFacturaCita,
            tiposAtencionCitas
          )}
          onCerrar={() => setModalFacturaCita(null)}
        />
      )}

      <footer className="bg-white border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-500">
        IPS Salud Viva · Barranquilla, Colombia · Carrera 51B # 82 - 140 · Comunicaciones:{' '}
        <strong className="text-slate-700">{CORREO_INSTITUCIONAL}</strong>
      </footer>
    </div>
  );
}
