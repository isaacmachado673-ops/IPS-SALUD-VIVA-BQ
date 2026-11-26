import React, { useState } from 'react';
import {
  AREAS_SERVICIO,
  AUXILIAR_TURNO_DEFAULT,
  DIAS_SEMANA_OPCIONES,
  ESPECIALIDADES,
  PROCEDIMIENTOS_CATALOGO,
  calcularHoraFinEstimada,
  calcularLiquidacionDesdeValorBase,
  compararCitasMasNuevasPrimero,
  determinarTipoAtencionCita,
  enmascararTextoSensible,
  esCitaVencidaSinLlegada,
  esDuracionProcedimientoPorDefinir,
  esEstadoCitaCerrado,
  formatearDuracionHumana,
  generarNumeroRecibo,
  inferirTipoEnvioCorreoDesdeAuditoria,
  limpiarEtiquetaApartado,
  obtenerEtiquetaConceptoPago,
  obtenerPinDefaultMedico,
  obtenerTarifaParticularEspecialidad,
  obtenerTarifaProcedimientoCatalogo,
  obtenerValorReferencialProcedimiento,
  ordenarCitasCronologicamente,
  ordenarCitasNuevasArribaYCerradasAbajo,
  type AreaServicioId,
  type AuxiliarTurnoConfig,
  type CitaMedica,
  type CorreosMetaCita,
  type DiaSemanaNum,
  type DocumentoSolicitadoTipo,
  type EspecialidadId,
  type EstadoCitaTipo,
  type MedicoBase,
  type MedicoConOcupacion,
  type MetodoPagoTipo,
  type NivelAdmin,
  type Paciente,
  type RangoAfiliacionTipo,
  type RegimenTipo,
  type RegistroAuditoria,
  type TarifasConfig,
  type TipoAfiliacionTipo,
  type TipoAtencionTipo,
  type UsuarioAdministrativo,
} from '../data/saludVivaData';
import { CARD, CamposAfiliacion, INP, Ic, IconCamera } from './uiShared';

export function AdminPanelView({
  adminActual,
  subTabAdmin,
  setSubTabAdmin,
  citas,
  medicos,
  medicosLista,
  administradores,
  pacientes,
  auditoria,
  topeMaximoCitas,
  setTopeMaximoCitas,
  umbralAlertaAgendadas,
  setUmbralAlertaAgendadas,
  umbralAlertaAtendidas,
  setUmbralAlertaAtendidas,
  tarifas,
  setTarifas,
  tarifasParticulares,
  tarifasProcedimientos,
  tarifasCatalogoProcedimientos,
  onCambiarTarifaParticularEsp,
  onCambiarTarifaProcedimientoEsp,
  onCambiarTarifaCatalogoProc,
  onRestaurarTarifasParticulares,
  onRestaurarTarifasCatalogoProc,
  onGuardarTarifarioEspecialidadesNube,
  onGuardarTarifarioProcedimientosNube,
  mensajeTarifarioAdmin,
  mensajeTarifarioProcAdmin,
  guardandoTarifario,
  guardandoTarifarioProc,
  correosMetaCitas,
  cooldownCorreoMs,
  descansosMedicos,
  onCambiarDescansoMedico,
  auxiliarTurno,
  onActualizarAuxiliarTurno,
  hoyIsoActual,
  sincronizandoNube,
  enviandoFormulario,
  descargarReporteExcel,
  obtenerConsultorioPorMedico,
  busquedaAgendaAdmin,
  setBusquedaAgendaAdmin,
  filtroAreaAdmin,
  setFiltroAreaAdmin,
  filtroEstadoCitaAdmin,
  setFiltroEstadoCitaAdmin,
  filtroEstadoDocAdmin,
  setFiltroEstadoDocAdmin,
  observacionTemp,
  setObservacionTemp,
  enviandoCorreoId,
  actualizarEstadoDocumentos,
  asignarDuracionCitaAdmin,
  handleEnviarRecordatorioCorreo,
  abrirModalReprogramacion,
  ejecutarActualizacionEstadoCitaAdmin,
  solicitarCancelarCitaAdmin,
  eliminarCitaDeNube,
  codigoQrInput,
  setCodigoQrInput,
  validarCodigoQrEnAdmisiones,
  resultadoLectorQr,
  setResultadoLectorQr,
  metodoPagoTemp,
  setMetodoPagoTemp,
  reciboInputTemp,
  setReciboInputTemp,
  recibosCitas,
  tiposAtencionCitas,
  apartadosDocs,
  ahoraMs,
  onVerFactura,
  onVerImagen,
  nuevoMedNombre,
  setNuevoMedNombre,
  nuevoMedCodigo,
  setNuevoMedCodigo,
  nuevoMedAreaServ,
  setNuevoMedAreaServ,
  nuevoMedArea,
  setNuevoMedArea,
  nuevoMedConsultorio,
  setNuevoMedConsultorio,
  nuevoMedDescanso,
  setNuevoMedDescanso,
  filtroMedGestion,
  setFiltroMedGestion,
  mensajeMedicoGestion,
  agregarNuevoMedicoAdmin,
  actualizarMedicoDesdeAdmin,
  eliminarMedicoNube,
  restaurarMedicosBaseNube,
  nuevoAdminNombre,
  setNuevoAdminNombre,
  nuevoAdminCedula,
  setNuevoAdminCedula,
  nuevoAdminNivel,
  setNuevoAdminNivel,
  nuevoAdminPin,
  setNuevoAdminPin,
  mensajeAdminGestion,
  agregarNuevoAdministradorNube,
  eliminarAdministradorNube,
  busquedaPacienteAdmin,
  setBusquedaPacienteAdmin,
  pacienteOriginalCedulaAdmin,
  pacienteSeleccionadoAdmin,
  setPacienteSeleccionadoAdmin,
  seleccionarPacienteEnAdmin,
  adminPacRegimen,
  setAdminPacRegimen,
  adminPacTipoAfiliacion,
  setAdminPacTipoAfiliacion,
  adminPacRango,
  setAdminPacRango,
  mensajePacienteAdmin,
  guardarEdicionPacienteDesdeAdmin,
  mensajeConfigAdmin,
  guardarConfiguracionNube,
  vaciarBaseDatosNubeACero,
  autoRecordatorios24hActivo,
  onToggleAutoRecordatorios24h,
  onEjecutarAutoRecordatorios24h,
  citasMananaCount,
  enviados24hCount,
  ejecutandoRecordatorios24h,
}: {
  adminActual: UsuarioAdministrativo;
  subTabAdmin:
    | 'kpi_alertas'
    | 'agendas_autorizaciones'
    | 'duracion_procedimientos'
    | 'admisiones'
    | 'parametrizacion';
  setSubTabAdmin: (
    t:
      | 'kpi_alertas'
      | 'agendas_autorizaciones'
      | 'duracion_procedimientos'
      | 'admisiones'
      | 'parametrizacion'
  ) => void;
  citas: CitaMedica[];
  medicos: MedicoConOcupacion[];
  medicosLista: MedicoBase[];
  administradores: UsuarioAdministrativo[];
  pacientes: Paciente[];
  auditoria: RegistroAuditoria[];
  topeMaximoCitas: number;
  setTopeMaximoCitas: (v: number) => void;
  umbralAlertaAgendadas: number;
  setUmbralAlertaAgendadas: (v: number) => void;
  umbralAlertaAtendidas: number;
  setUmbralAlertaAtendidas: (v: number) => void;
  tarifas: TarifasConfig;
  setTarifas: (t: TarifasConfig) => void;
  tarifasParticulares: Record<string, number>;
  tarifasProcedimientos: Record<string, number>;
  tarifasCatalogoProcedimientos: Record<string, number>;
  onCambiarTarifaParticularEsp: (espId: EspecialidadId, valor: number) => void;
  onCambiarTarifaProcedimientoEsp: (
    espId: EspecialidadId,
    valor: number
  ) => void;
  onCambiarTarifaCatalogoProc: (procId: string, valor: number) => void;
  onRestaurarTarifasParticulares: () => void;
  onRestaurarTarifasCatalogoProc: () => void;
  onGuardarTarifarioEspecialidadesNube: () => void;
  onGuardarTarifarioProcedimientosNube: () => void;
  mensajeTarifarioAdmin: string;
  mensajeTarifarioProcAdmin: string;
  guardandoTarifario: boolean;
  guardandoTarifarioProc: boolean;
  correosMetaCitas: Record<string, CorreosMetaCita>;
  cooldownCorreoMs: number;
  descansosMedicos: Record<string, DiaSemanaNum>;
  onCambiarDescansoMedico: (medicoId: string, dia: DiaSemanaNum) => void;
  auxiliarTurno: AuxiliarTurnoConfig;
  onActualizarAuxiliarTurno: (cfg: AuxiliarTurnoConfig) => void;
  hoyIsoActual: string;
  sincronizandoNube: boolean;
  enviandoFormulario: boolean;
  descargarReporteExcel: () => void;
  obtenerConsultorioPorMedico: (id: string) => string;
  busquedaAgendaAdmin: string;
  setBusquedaAgendaAdmin: (v: string) => void;
  filtroAreaAdmin: string;
  setFiltroAreaAdmin: (v: string) => void;
  filtroEstadoCitaAdmin: string;
  setFiltroEstadoCitaAdmin: (v: string) => void;
  filtroEstadoDocAdmin: string;
  setFiltroEstadoDocAdmin: (v: string) => void;
  observacionTemp: Record<string, string>;
  setObservacionTemp: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  enviandoCorreoId: string | null;
  actualizarEstadoDocumentos: (
    cita: CitaMedica,
    nuevoEstado: 'Aprobados' | 'Observados',
    obs?: string,
    duracionAsignadaMin?: number,
    documentoRequerido?: DocumentoSolicitadoTipo
  ) => void;
  asignarDuracionCitaAdmin: (
    cita: CitaMedica,
    duracionMin: number,
    obs?: string,
    valorBaseProc?: number
  ) => Promise<void>;
  handleEnviarRecordatorioCorreo: (cita: CitaMedica) => void;
  abrirModalReprogramacion: (cita: CitaMedica) => void;
  ejecutarActualizacionEstadoCitaAdmin: (
    citaId: string,
    nuevoEstado: EstadoCitaTipo,
    metodoPago?: MetodoPagoTipo,
    obs?: string,
    reciboNumero?: string
  ) => void;
  solicitarCancelarCitaAdmin: (cita: CitaMedica, obs?: string) => void;
  eliminarCitaDeNube: (cita: CitaMedica) => void;
  codigoQrInput: string;
  setCodigoQrInput: (v: string) => void;
  validarCodigoQrEnAdmisiones: (e: React.FormEvent) => void;
  resultadoLectorQr: {
    tipo: 'ok' | 'error';
    mensaje: string;
    cita?: CitaMedica;
  } | null;
  setResultadoLectorQr: (
    v: { tipo: 'ok' | 'error'; mensaje: string; cita?: CitaMedica } | null
  ) => void;
  metodoPagoTemp: Record<string, MetodoPagoTipo>;
  setMetodoPagoTemp: React.Dispatch<
    React.SetStateAction<Record<string, MetodoPagoTipo>>
  >;
  reciboInputTemp: Record<string, string>;
  setReciboInputTemp: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  recibosCitas: Record<string, string>;
  tiposAtencionCitas: Record<string, TipoAtencionTipo>;
  apartadosDocs: Record<string, number>;
  ahoraMs: number;
  onVerFactura: (cita: CitaMedica) => void;
  onVerImagen: (titulo: string, url: string) => void;
  nuevoMedNombre: string;
  setNuevoMedNombre: (v: string) => void;
  nuevoMedCodigo: string;
  setNuevoMedCodigo: (v: string) => void;
  nuevoMedAreaServ: AreaServicioId;
  setNuevoMedAreaServ: (v: AreaServicioId) => void;
  nuevoMedArea: EspecialidadId;
  setNuevoMedArea: (v: EspecialidadId) => void;
  nuevoMedConsultorio: string;
  setNuevoMedConsultorio: (v: string) => void;
  nuevoMedDescanso: DiaSemanaNum;
  setNuevoMedDescanso: (v: DiaSemanaNum) => void;
  filtroMedGestion: string;
  setFiltroMedGestion: (v: string) => void;
  mensajeMedicoGestion: string;
  agregarNuevoMedicoAdmin: (e: React.FormEvent) => void;
  actualizarMedicoDesdeAdmin: (
    medEditado: MedicoBase,
    descansoNuevo?: DiaSemanaNum
  ) => Promise<{ ok: boolean; error?: string; warning?: string }>;
  eliminarMedicoNube: (m: MedicoBase) => void;
  restaurarMedicosBaseNube: () => void;
  nuevoAdminNombre: string;
  setNuevoAdminNombre: (v: string) => void;
  nuevoAdminCedula: string;
  setNuevoAdminCedula: (v: string) => void;
  nuevoAdminNivel: NivelAdmin;
  setNuevoAdminNivel: (v: NivelAdmin) => void;
  nuevoAdminPin: string;
  setNuevoAdminPin: (v: string) => void;
  mensajeAdminGestion: string;
  agregarNuevoAdministradorNube: (e: React.FormEvent) => void;
  eliminarAdministradorNube: (a: UsuarioAdministrativo) => void;
  busquedaPacienteAdmin: string;
  setBusquedaPacienteAdmin: (v: string) => void;
  pacienteOriginalCedulaAdmin: string;
  pacienteSeleccionadoAdmin: Paciente | null;
  setPacienteSeleccionadoAdmin: (p: Paciente | null) => void;
  seleccionarPacienteEnAdmin: (p: Paciente) => void;
  adminPacRegimen: RegimenTipo;
  setAdminPacRegimen: (r: RegimenTipo) => void;
  adminPacTipoAfiliacion: TipoAfiliacionTipo;
  setAdminPacTipoAfiliacion: (t: TipoAfiliacionTipo) => void;
  adminPacRango: RangoAfiliacionTipo;
  setAdminPacRango: (r: RangoAfiliacionTipo) => void;
  mensajePacienteAdmin: string;
  guardarEdicionPacienteDesdeAdmin: (e: React.FormEvent) => void;
  mensajeConfigAdmin: string;
  guardarConfiguracionNube: (e: React.FormEvent) => void;
  vaciarBaseDatosNubeACero: () => void;
  autoRecordatorios24hActivo: boolean;
  onToggleAutoRecordatorios24h: (v: boolean) => void;
  onEjecutarAutoRecordatorios24h: () => void;
  citasMananaCount: number;
  enviados24hCount: number;
  ejecutandoRecordatorios24h: boolean;
}) {
  const [busquedaTarifaPart, setBusquedaTarifaPart] = useState('');
  const [filtroAreaTarifaProc, setFiltroAreaTarifaProc] = useState('todas');
  const [busquedaTarifaProc, setBusquedaTarifaProc] = useState('');
  const [duracionTemp, setDuracionTemp] = useState<Record<string, number>>({});
  const [valorBaseTemp, setValorBaseTemp] = useState<Record<string, number>>({});
  const [soloPendientesProc, setSoloPendientesProc] = useState(false);
  const [ordenDuracionAdmin, setOrdenDuracionAdmin] = useState<
    'recientes' | 'fecha'
  >('recientes');
  const [busquedaDuracionAdmin, setBusquedaDuracionAdmin] = useState('');
  const [busquedaMedGestion, setBusquedaMedGestion] = useState('');
  const [medicoEditandoAdmin, setMedicoEditandoAdmin] = useState<{
    id: string;
    codigo: string;
    nombre: string;
    areaId: AreaServicioId;
    especialidad: EspecialidadId;
    consultorio: string;
    pin: string;
    telefono: string;
    correo: string;
    descanso: DiaSemanaNum;
  } | null>(null);
  const [errorEdicionMedicoAdmin, setErrorEdicionMedicoAdmin] = useState('');
  const [guardandoMedicoAdmin, setGuardandoMedicoAdmin] = useState(false);

  const seleccionarMedicoEdicionAdmin = (m: MedicoBase) => {
    const areaId =
      ESPECIALIDADES.find((e) => e.id === m.especialidad)?.areaId || 'general';
    setErrorEdicionMedicoAdmin('');
    setMedicoEditandoAdmin({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      areaId,
      especialidad: m.especialidad,
      consultorio: m.consultorio,
      pin: m.pin || '',
      telefono: m.telefono || '',
      correo: m.correo || '',
      descanso: descansosMedicos[m.id] ?? -1,
    });
  };

  const manejarGuardarMedicoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoEditandoAdmin) return;
    setGuardandoMedicoAdmin(true);
    setErrorEdicionMedicoAdmin('');
    try {
      const res = await actualizarMedicoDesdeAdmin(
        {
          id: medicoEditandoAdmin.id,
          codigo: medicoEditandoAdmin.codigo,
          nombre: medicoEditandoAdmin.nombre,
          especialidad: medicoEditandoAdmin.especialidad,
          consultorio: medicoEditandoAdmin.consultorio,
          pin: medicoEditandoAdmin.pin || undefined,
          telefono: medicoEditandoAdmin.telefono || undefined,
          correo: medicoEditandoAdmin.correo || undefined,
        },
        medicoEditandoAdmin.descanso
      );
      if (res.ok) {
        setMedicoEditandoAdmin(null);
      } else {
        setErrorEdicionMedicoAdmin(
          res.error || 'No se pudo actualizar el médico.'
        );
      }
    } finally {
      setGuardandoMedicoAdmin(false);
    }
  };

  const obtenerValorBaseInicialCita = (c: CitaMedica): number => {
    if (valorBaseTemp[c.id] !== undefined) return valorBaseTemp[c.id];
    if (c.valorBaseProcedimiento != null && c.valorBaseProcedimiento > 0) {
      return c.valorBaseProcedimiento;
    }
    if (c.procedimientoId) {
      return obtenerTarifaProcedimientoCatalogo(
        c.procedimientoId,
        tarifasCatalogoProcedimientos,
        tarifasParticulares,
        tarifas.particular,
        tarifasProcedimientos,
        tarifas.particularProcedimiento
      );
    }
    return obtenerValorReferencialProcedimiento(
      c.especialidad,
      tarifasParticulares,
      tarifas.particular,
      tarifasProcedimientos,
      tarifas.particularProcedimiento
    );
  };

  const obtenerInfoCorreoCita = (c: CitaMedica) => {
    const meta = correosMetaCitas[c.id];
    const count = Math.max(c.correosEnviadosCount ?? 0, meta?.count ?? 0);
    const lastMs = Math.max(c.ultimoCorreoEnviadoMs ?? 0, meta?.lastMs ?? 0);
    const cooldownBaseMs = Math.max(
      c.ultimoCorreoEnviadoMs ?? 0,
      meta?.cooldownStartMs !== undefined
        ? meta.cooldownStartMs
        : meta?.lastMs ?? 0
    );
    const diffMs =
      cooldownBaseMs > 0
        ? Math.max(0, cooldownCorreoMs - (ahoraMs - cooldownBaseMs))
        : 0;
    const segsRestantes = diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
    const lastTipo =
      meta?.lastTipo || inferirTipoEnvioCorreoDesdeAuditoria(c.id, auditoria);
    const horaTexto =
      lastMs > 0
        ? new Date(lastMs).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '';
    return { count, lastMs, segsRestantes, horaTexto, lastTipo };
  };

  const medicosEnAlertaAgendadas = medicos.filter(
    (m) => m.citasHoy >= umbralAlertaAgendadas
  );
  const medicosEnAlertaAtendidas = medicos.filter(
    (m) => m.atendidasHoy >= umbralAlertaAtendidas
  );
  const medicosConMovimientoHoy = medicos.filter(
    (m) =>
      m.citasHoy > 0 ||
      m.atendidasHoy > 0 ||
      m.noAsistioHoy > 0 ||
      m.reprogramadasHoy > 0 ||
      m.canceladasHoy > 0
  );
  const citasVencidasSinLlegada = citas
    .filter((c) => esCitaVencidaSinLlegada(c))
    .sort(compararCitasMasNuevasPrimero);
  const totalInasistencias = citas.filter(
    (c) => c.estadoCita === 'No asistió'
  ).length;
  const totalReprogramadasSistema = citas.filter(
    (c) => c.estadoCita === 'Reprogramada' || (c.reprogramacionesCount || 0) > 0
  ).length;
  const citasAtendidas = citas.filter((c) => c.estadoCita === 'Atendida');
  const recaudoTotalConfirmado = citasAtendidas.reduce(
    (acc, c) => acc + (Number(c.valorCopago) || 0),
    0
  );
  const citasCalificadas = citas.filter(
    (c) => typeof c.calificacionSatisfaccion === 'number'
  );
  const promedioSatisfaccion =
    citasCalificadas.length > 0
      ? (
          citasCalificadas.reduce(
            (acc, c) => acc + (c.calificacionSatisfaccion || 0),
            0
          ) / citasCalificadas.length
        ).toFixed(1)
      : 'Sin calificar';
  const calcularPromedioDimension = (
    campo: 'calificacionEspera' | 'calificacionTrato' | 'calificacionClaridad'
  ) => {
    const conDato = citas.filter((c) => typeof c[campo] === 'number');
    return conDato.length
      ? (
          conDato.reduce((acc, c) => acc + (c[campo] || 0), 0) / conDato.length
        ).toFixed(1)
      : 'N/A';
  };

  const citasFiltradasUnificado = ordenarCitasNuevasArribaYCerradasAbajo(
    citas.filter((c) => {
      if (determinarTipoAtencionCita(c, tiposAtencionCitas) !== 'consulta')
        return false;
      if (filtroAreaAdmin !== 'todas' && c.especialidad !== filtroAreaAdmin)
        return false;
      if (
        filtroEstadoDocAdmin !== 'todas' &&
        c.estadoDocumentos !== filtroEstadoDocAdmin
      )
        return false;
      if (filtroEstadoCitaAdmin === 'vencidas') {
        if (!esCitaVencidaSinLlegada(c)) return false;
      } else if (
        filtroEstadoCitaAdmin !== 'todas' &&
        c.estadoCita !== filtroEstadoCitaAdmin
      )
        return false;
      const q = busquedaAgendaAdmin.trim().toLowerCase();
      if (
        q &&
        !c.id.toLowerCase().includes(q) &&
        !c.pacienteCedula.toLowerCase().includes(q) &&
        !c.pacienteNombre.toLowerCase().includes(q) &&
        !c.medicoNombre.toLowerCase().includes(q) &&
        !(c.procedimientoNombre || '').toLowerCase().includes(q)
      )
        return false;
      return true;
    })
  );

  const medicosFiltradosGestion = medicosLista.filter((m) => {
    if (filtroMedGestion !== 'todas' && m.especialidad !== filtroMedGestion)
      return false;
    const q = busquedaMedGestion.trim().toLowerCase();
    if (
      q &&
      !m.nombre.toLowerCase().includes(q) &&
      !m.codigo.toLowerCase().includes(q) &&
      !m.consultorio.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
  const pacientesOrdenadosAdmin = [
    ...pacientes.filter((p) => p.esNuevo).reverse(),
    ...pacientes.filter((p) => !p.esNuevo),
  ];
  const pacientesFiltradosAdmin = pacientesOrdenadosAdmin.filter((p) => {
    const q = busquedaPacienteAdmin.trim().toLowerCase();
    return (
      !q ||
      p.cedula.includes(q) ||
      p.nombres.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q)
    );
  });
  const puedeVerDatosCompletos = adminActual.nivel >= 3;
  const espsMedNuevoArea = ESPECIALIDADES.filter(
    (e) => e.areaId === nuevoMedAreaServ
  );
  const citaQr = resultadoLectorQr?.cita;
  const espsTarifarioFiltradas = ESPECIALIDADES.filter((e) => {
    const q = busquedaTarifaPart.trim().toLowerCase();
    return !q || e.nombre.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div
        className={`${CARD} border-teal-200 flex flex-wrap items-center justify-between gap-4`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-xs font-bold">
              Nivel {adminActual.nivel}
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {adminActual.nombre}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {adminActual.descripcion}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={descargarReporteExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Ic n="download" c="w-4 h-4" />
            <span>Descargar Excel (.XLS)</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-900 font-bold border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{medicosLista.length} especialistas</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSubTabAdmin('kpi_alertas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
            subTabAdmin === 'kpi_alertas'
              ? 'bg-sky-600 text-white'
              : 'bg-white border border-slate-200'
          }`}
        >
          1. KPI, Alertas y Auditoría (N1+)
        </button>
        {adminActual.nivel >= 2 && (
          <button
            type="button"
            onClick={() => setSubTabAdmin('agendas_autorizaciones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              subTabAdmin === 'agendas_autorizaciones'
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            <span>2. Consultas y Agendas (N2+)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                subTabAdmin === 'agendas_autorizaciones'
                  ? 'bg-white/20 text-white'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {
                citas.filter(
                  (c) =>
                    c.estadoCita !== 'Atendida' &&
                    c.estadoCita !== 'Cancelada' &&
                    c.estadoCita !== 'No asistió' &&
                    determinarTipoAtencionCita(c, tiposAtencionCitas) ===
                      'consulta'
                ).length
              }
            </span>
          </button>
        )}
        {adminActual.nivel >= 2 && (
          <button
            type="button"
            onClick={() => setSubTabAdmin('duracion_procedimientos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              subTabAdmin === 'duracion_procedimientos'
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-teal-200 text-teal-900'
            }`}
          >
            <span>⏱️ Duración / Costo Proc. (N2+)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                subTabAdmin === 'duracion_procedimientos'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {
                citas.filter(
                  (c) =>
                    c.estadoCita !== 'Atendida' &&
                    c.estadoCita !== 'Cancelada' &&
                    c.estadoCita !== 'No asistió' &&
                    determinarTipoAtencionCita(c, tiposAtencionCitas) ===
                      'procedimiento'
                ).length
              }
            </span>
          </button>
        )}
        {adminActual.nivel >= 3 && (
          <button
            type="button"
            onClick={() => setSubTabAdmin('admisiones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
              subTabAdmin === 'admisiones'
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            4. Admisiones, Lector QR y Caja (N3+)
          </button>
        )}
        {adminActual.nivel >= 4 && (
          <button
            type="button"
            onClick={() => setSubTabAdmin('parametrizacion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
              subTabAdmin === 'parametrizacion'
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-teal-200 text-teal-800'
            }`}
          >
            5. Médicos, Pacientes y Nube (N4)
          </button>
        )}
      </div>

      {subTabAdmin === 'kpi_alertas' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={CARD}>
              <p className="text-xs text-slate-500 font-semibold">
                Total Citas / Activas
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {citas.length}{' '}
                <span className="text-xs font-semibold text-sky-700">
                  (
                  {
                    citas.filter(
                      (c) =>
                        c.estadoCita === 'Pre-admitida' ||
                        c.estadoCita === 'Reprogramada'
                    ).length
                  }{' '}
                  pend.)
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Reprog: {totalReprogramadasSistema} · No asistió:{' '}
                {totalInasistencias}
              </p>
            </div>
            <div className={`${CARD} border-emerald-200`}>
              <p className="text-xs text-emerald-700 font-semibold">
                En Sala / Atendidas
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {citas.filter((c) => c.estadoCita === 'Admitida en Sala').length}{' '}
                / {citasAtendidas.length}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">
                Tope diario: {topeMaximoCitas}/médico
              </p>
            </div>
            <div className={`${CARD} border-teal-200`}>
              <p className="text-xs text-teal-800 font-semibold">
                Recaudo Confirmado
              </p>
              <p className="text-2xl font-extrabold text-teal-800 mt-1">
                ${recaudoTotalConfirmado.toLocaleString('es-CO')}
              </p>
              <p className="text-[11px] text-teal-700 mt-1">
                {citasAtendidas.length} consulta(s)
              </p>
            </div>
            <div className={`${CARD} border-amber-200`}>
              <p className="text-xs text-amber-800 font-semibold">
                Satisfacción PQRSD ({citasCalificadas.length})
              </p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                {promedioSatisfaccion === 'Sin calificar'
                  ? 'N/A'
                  : `★ ${promedioSatisfaccion}/5`}
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                Esp:{' '}
                <strong>{calcularPromedioDimension('calificacionEspera')}</strong>{' '}
                · Trato:{' '}
                <strong>{calcularPromedioDimension('calificacionTrato')}</strong>{' '}
                · Clar:{' '}
                <strong>
                  {calcularPromedioDimension('calificacionClaridad')}
                </strong>
              </p>
            </div>
          </div>

          {citasVencidasSinLlegada.length > 0 && (
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-2.5">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <Ic n="clock" c="w-4 h-4 text-rose-600" />
                <span>
                  Citas Vencidas sin Llegada ({citasVencidasSinLlegada.length})
                </span>
              </h3>
              <div className="grid md:grid-cols-2 gap-2.5">
                {citasVencidasSinLlegada.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-3 rounded-xl border border-rose-200 text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {c.pacienteNombre} ({c.id})
                      </p>
                      <p className="text-slate-600">
                        {c.especialidadNombre} · {c.fecha}{' '}
                        <strong>{c.hora}</strong>
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                      Sin llegada
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            <div className={`${CARD} border-amber-200 space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Ic n="alert" c="w-4 h-4 text-amber-600" />
                  <span>
                    Alerta 1 · Agendadas (≥ {umbralAlertaAgendadas}/día)
                  </span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  Máx: {topeMaximoCitas}
                </span>
              </div>
              {medicosEnAlertaAgendadas.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Sin alertas de agendamiento hoy.
                </p>
              ) : (
                <div className="space-y-2">
                  {medicosEnAlertaAgendadas.map((m) => (
                    <div
                      key={`ag-${m.id}`}
                      className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-amber-950">
                          {m.nombre} ({m.codigo})
                        </p>
                        <p className="text-amber-800">
                          {m.consultorio} · Sala/Esp: {m.enEsperaOSalaHoy} ·
                          Atend: {m.atendidasHoy}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-white font-bold ${
                          m.citasHoy >= m.capacidadMaxima
                            ? 'bg-rose-600'
                            : 'bg-amber-600'
                        }`}
                      >
                        {m.citasHoy}/{m.capacidadMaxima}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${CARD} border-teal-200 space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <Ic n="steth" c="w-4 h-4 text-teal-700" />
                  <span>
                    Alerta 2 · Atendidas (≥ {umbralAlertaAtendidas}/día)
                  </span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                  Máx: {topeMaximoCitas}
                </span>
              </div>
              {medicosEnAlertaAtendidas.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Sin alertas de carga de atendidas hoy.
                </p>
              ) : (
                <div className="space-y-2">
                  {medicosEnAlertaAtendidas.map((m) => (
                    <div
                      key={`at-${m.id}`}
                      className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-teal-950">
                          {m.nombre} ({m.codigo})
                        </p>
                        <p className="text-teal-800">
                          {m.consultorio} · No asistió: {m.noAsistioHoy} ·
                          Reprog: {m.reprogramadasHoy}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white font-bold">
                        {m.atendidasHoy} atend.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`${CARD} space-y-3`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">
                Balance Diario por Profesional (Hoy)
              </h3>
              <span className="text-[11px] text-slate-500">
                {medicosConMovimientoHoy.length} con actividad
              </span>
            </div>
            {medicosConMovimientoHoy.length === 0 ? (
              <p className="text-xs text-slate-500">
                Sin movimiento hoy ({hoyIsoActual}).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-2.5">Médico</th>
                      <th className="p-2.5 text-center">Agendadas</th>
                      <th className="p-2.5 text-center">Atendidas</th>
                      <th className="p-2.5 text-center">Espera/Sala</th>
                      <th className="p-2.5 text-center">No asistió</th>
                      <th className="p-2.5 text-center">Reprog.</th>
                      <th className="p-2.5 text-center">Aprov.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicosConMovimientoHoy.map((m) => {
                      const base =
                        m.atendidasHoy + m.noAsistioHoy + m.reprogramadasHoy;
                      return (
                        <tr key={`t-${m.id}`} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className="font-bold block">{m.nombre}</span>
                            <span className="text-[10px] text-slate-500">
                              {m.codigo} · {m.consultorio}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold">
                            {m.citasHoy}/{m.capacidadMaxima}
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">
                            {m.atendidasHoy}
                          </td>
                          <td className="p-2.5 text-center">
                            {m.enEsperaOSalaHoy}
                          </td>
                          <td className="p-2.5 text-center font-bold text-rose-700">
                            {m.noAsistioHoy}
                          </td>
                          <td className="p-2.5 text-center font-bold text-amber-700">
                            {m.reprogramadasHoy}
                          </td>
                          <td className="p-2.5 text-center font-bold">
                            {base > 0
                              ? Math.round((m.atendidasHoy / base) * 100)
                              : 100}
                            %
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={`${CARD} space-y-3`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Bitácora de Auditoría (Nube)</h3>
              <span className="text-[11px] text-slate-400">
                {auditoria.length} eventos
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {auditoria.map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-wrap justify-between gap-2"
                >
                  <div>
                    <span className="font-bold">{a.accion}</span> ·{' '}
                    <span className="text-sky-700 font-semibold">
                      {a.usuario}
                    </span>{' '}
                    ({a.rol})
                    <p className="text-slate-600 mt-0.5">{a.detalle}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {a.fechaHora}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTabAdmin === 'agendas_autorizaciones' && adminActual.nivel >= 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border space-y-3">
            <div>
              <h3 className="text-sm font-bold">
                Consultas Médicas · Agendas, Soportes y Correos (
                {citasFiltradasUnificado.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Gestiona únicamente <strong>consultas médicas</strong>: revisa fotos de Orden/Autorización, aprueba u observa con notificación automática, reprograma, envía recordatorios o cancela. (Los procedimientos y terapias se gestionan en la pestaña{' '}
                <strong>⏱️ Duración / Costo Proc.</strong>).
                {!puedeVerDatosCompletos &&
                  ' (Cédulas enmascaradas para Nivel 2).'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Buscar ID, cédula, paciente o médico..."
                value={busquedaAgendaAdmin}
                onChange={(e) => setBusquedaAgendaAdmin(e.target.value)}
                className={INP}
              />
              <select
                value={filtroEstadoCitaAdmin}
                onChange={(e) => setFiltroEstadoCitaAdmin(e.target.value)}
                className={`${INP} font-semibold`}
              >
                <option value="todas">Estado Cita: Todos</option>
                <option value="vencidas">Hora vencida sin llegada</option>
                <option value="Pre-admitida">Pre-admitida</option>
                <option value="Admitida en Sala">Admitida en Sala</option>
                <option value="Atendida">Atendida</option>
                <option value="No asistió">No asistió</option>
                <option value="Reprogramada">Reprogramada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
              <select
                value={filtroEstadoDocAdmin}
                onChange={(e) => setFiltroEstadoDocAdmin(e.target.value)}
                className={`${INP} font-semibold`}
              >
                <option value="todas">Docs: Todos</option>
                <option value="Pendiente Revisión">Pendiente Revisión</option>
                <option value="Aprobados">Aprobados</option>
                <option value="Observados">Observados</option>
              </select>
              <select
                value={filtroAreaAdmin}
                onChange={(e) => setFiltroAreaAdmin(e.target.value)}
                className={`${INP} font-semibold`}
              >
                <option value="todas">Todas las especialidades</option>
                {ESPECIALIDADES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-sky-950 flex items-center gap-1.5">
                <Ic n="mail" c="w-4 h-4 text-sky-700" />
                <span>Recordatorios Automáticos 24h Antes</span>
              </p>
              <p className="text-[11px] text-sky-900">
                Citas activas para mañana: <strong>{citasMananaCount}</strong> ·
                Enviados hoy: <strong>{enviados24hCount}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 font-bold text-sky-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRecordatorios24hActivo}
                  onChange={(e) =>
                    onToggleAutoRecordatorios24h(e.target.checked)
                  }
                  className="accent-sky-600"
                />
                <span>
                  Auto-envío {autoRecordatorios24hActivo ? 'Activo' : 'Pausado'}
                </span>
              </label>
              <button
                type="button"
                disabled={ejecutandoRecordatorios24h}
                onClick={onEjecutarAutoRecordatorios24h}
                className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold"
              >
                {ejecutandoRecordatorios24h
                  ? 'Enviando...'
                  : 'Ejecutar Recordatorios 24h Ahora'}
              </button>
            </div>
          </div>

          {citasFiltradasUnificado.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              Sin citas para este filtro.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {citasFiltradasUnificado.map((c) => {
                const vencida = esCitaVencidaSinLlegada(c);
                const ced = puedeVerDatosCompletos
                  ? c.pacienteCedula
                  : enmascararTextoSensible(c.pacienteCedula, 'cedula');
                const tipoAt = determinarTipoAtencionCita(c, tiposAtencionCitas);
                const infoMail = obtenerInfoCorreoCita(c);
                const enCooldownCorreo = infoMail.segsRestantes > 0;
                return (
                  <div
                    key={c.id}
                    className={`${CARD} space-y-3 text-xs ${
                      vencida ? 'border-rose-300 bg-rose-50/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="font-bold text-slate-900">
                            {c.pacienteNombre}
                          </span>
                          <span className="text-slate-500">(CC {ced})</span>
                          {(c.reprogramacionesCount || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Reprog {c.reprogramacionesCount}x
                            </span>
                          )}
                          {c.procedimientoPersonalizado && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                              Personalizado
                            </span>
                          )}
                          {c.costoPendiente && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Costo por definir N2/N3
                            </span>
                          )}
                          {vencida && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Vencida
                            </span>
                          )}
                        </div>
                        <p>
                          <strong>
                            {c.especialidadNombre} (
                            {formatearDuracionHumana(c.duracionMin)})
                          </strong>{' '}
                          · {c.medicoNombre} ({c.medicoCodigo})
                        </p>
                        {c.procedimientoNombre && (
                          <p className="font-bold text-teal-800">
                            Procedimiento: {c.procedimientoNombre}
                            {c.procedimientoDetalle ? ` · ${c.procedimientoDetalle}` : ''}
                          </p>
                        )}
                        <p className="text-slate-500">
                          {c.pacienteEps} · {c.fecha} <strong>{c.hora}</strong>
                          {c.motivoReprogramacion
                            ? ` · ${c.motivoReprogramacion}`
                            : ''}
                        </p>
                        {c.motivoConsulta && (
                          <p className="text-[11px] text-indigo-950 bg-indigo-50/70 border border-indigo-200 rounded-lg px-2 py-1 mt-1">
                            <strong>Síntomas / Motivo:</strong>{' '}
                            {c.motivoConsulta}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <span
                          className={`block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            c.estadoCita === 'Atendida'
                              ? 'bg-teal-100 text-teal-900'
                              : c.estadoCita === 'Admitida en Sala'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.estadoCita === 'Cancelada' ||
                                c.estadoCita === 'No asistió'
                              ? 'bg-rose-100 text-rose-800'
                              : c.estadoCita === 'Reprogramada'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {c.estadoCita}
                        </span>
                        <span
                          className={`block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            c.estadoDocumentos === 'Aprobados'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.estadoDocumentos === 'Observados'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Docs: {c.estadoDocumentos}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {c.fotoOrdenUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            onVerImagen(
                              `Orden · ${c.pacienteNombre}`,
                              c.fotoOrdenUrl || ''
                            )
                          }
                          className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold flex items-center justify-center gap-1.5"
                        >
                          <IconCamera className="w-4 h-4" />
                          <span>Ver Orden Médica</span>
                        </button>
                      ) : (
                        <span className="p-2 rounded-xl bg-slate-50 border text-slate-400 text-center">
                          Sin Orden
                        </span>
                      )}
                      {c.fotoAutorizacionUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            onVerImagen(
                              `Autorización · ${c.pacienteNombre}`,
                              c.fotoAutorizacionUrl || ''
                            )
                          }
                          className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center gap-1.5"
                        >
                          <IconCamera className="w-4 h-4" />
                          <span>Ver Autorización</span>
                        </button>
                      ) : (
                        <span className="p-2 rounded-xl bg-slate-50 border text-slate-400 text-center">
                          Sin Autorización
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-sky-50/70 border border-sky-200 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sky-950">
                          ✉️ Correos enviados:{' '}
                          <span className="px-1.5 py-0.5 rounded bg-white border border-sky-200 text-sky-800">
                            {infoMail.count}
                          </span>
                        </span>
                        {infoMail.lastTipo && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-900 font-bold">
                            Último tipo: {infoMail.lastTipo}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-600">
                        {enCooldownCorreo ? (
                          <strong className="text-amber-700">
                            ⏳ Cooldown activo: {infoMail.segsRestantes}s
                          </strong>
                        ) : infoMail.horaTexto ? (
                          `Despachado: ${infoMail.horaTexto} (sin confirmación de lectura)`
                        ) : (
                          'Sin envíos registrados aún'
                        )}
                      </span>
                    </div>

                    {c.estadoCita !== 'Atendida' &&
                    c.estadoCita !== 'Cancelada' &&
                    c.estadoCita !== 'No asistió' ? (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {(() => {
                          const totalSel = Math.max(
                            15,
                            duracionTemp[c.id] ?? c.duracionMin
                          );
                          const hSel = Math.floor(totalSel / 60);
                          const mSel = totalSel % 60;
                          const finEst = calcularHoraFinEstimada(
                            c.hora,
                            totalSel
                          );
                          const valorBaseVal =
                            tipoAt === 'procedimiento'
                              ? obtenerValorBaseInicialCita(c)
                              : 0;
                          const copagoPreview =
                            tipoAt === 'procedimiento' && valorBaseVal > 0
                              ? calcularLiquidacionDesdeValorBase(
                                  c.pacienteClasificacion,
                                  valorBaseVal,
                                  tarifas,
                                  'procedimiento',
                                  c.especialidad,
                                  tarifasParticulares
                                )
                              : 0;
                          return (
                            <div
                              className={`p-2.5 rounded-lg border space-y-2 ${
                                tipoAt === 'procedimiento'
                                  ? 'bg-teal-50/70 border-teal-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-slate-800">
                                  ⏱️ Duración clínica{' '}
                                  {tipoAt === 'procedimiento'
                                    ? 'y Costo (N2/N3)'
                                    : '(Ajustar horas/min)'}
                                </span>
                                <span className="text-[10px] font-bold text-teal-800">
                                  {formatearDuracionHumana(totalSel)} (
                                  {c.hora}
                                  {finEst ? ` → ${finEst}` : ''})
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <select
                                  aria-label={`Horas para ${c.id}`}
                                  value={hSel}
                                  onChange={(e) => {
                                    const nh = Number(e.target.value);
                                    const nuevoTotal =
                                      nh === 0 && mSel === 0
                                        ? 30
                                        : nh * 60 + mSel;
                                    setDuracionTemp((p) => ({
                                      ...p,
                                      [c.id]: Math.min(1440, nuevoTotal),
                                    }));
                                  }}
                                  className={`${INP} font-bold bg-white`}
                                >
                                  {Array.from({ length: 25 }, (_, h) => (
                                    <option key={h} value={h}>
                                      {h} h ({h === 1 ? '1 hora' : `${h} horas`})
                                    </option>
                                  ))}
                                </select>
                                <select
                                  aria-label={`Minutos para ${c.id}`}
                                  value={mSel}
                                  onChange={(e) => {
                                    const nm = Number(e.target.value);
                                    const nuevoTotal =
                                      hSel === 0 && nm === 0
                                        ? 20
                                        : hSel * 60 + nm;
                                    setDuracionTemp((p) => ({
                                      ...p,
                                      [c.id]: Math.min(1440, nuevoTotal),
                                    }));
                                  }}
                                  className={`${INP} font-bold bg-white`}
                                >
                                  {[0, 15, 20, 30, 45].map((mm) => (
                                    <option key={mm} value={mm}>
                                      {mm} min
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {tipoAt === 'procedimiento' && (
                                <div className="p-2 rounded-lg bg-white border border-teal-200 space-y-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="text-[11px] font-bold text-teal-950">
                                      Valor base procedimiento (COP)
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      step={1000}
                                      value={valorBaseVal}
                                      onChange={(e) =>
                                        setValorBaseTemp((p) => ({
                                          ...p,
                                          [c.id]: Math.max(
                                            0,
                                            Number(e.target.value) || 0
                                          ),
                                        }))
                                      }
                                      className="w-36 px-2.5 py-1 rounded-lg border border-teal-300 text-right font-bold bg-white"
                                    />
                                  </div>
                                  <p className="text-[10px] font-semibold text-slate-600">
                                    {valorBaseVal > 0 ? (
                                      <>
                                        Liquidación al paciente:{' '}
                                        <strong className="text-emerald-700">
                                          {copagoPreview === 0
                                            ? '$0 COP (Exento)'
                                            : `$${copagoPreview.toLocaleString(
                                                'es-CO'
                                              )} COP`}
                                        </strong>
                                      </>
                                    ) : (
                                      <span className="text-amber-700 font-bold">
                                        {c.costoPendiente
                                          ? 'Asigna un valor base > $0 para liquidar y enviar costo al correo.'
                                          : `Valor actual guardado: $${c.valorCopago.toLocaleString(
                                              'es-CO'
                                            )} COP`}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}
                              <button
                                type="button"
                                disabled={
                                  enviandoCorreoId === c.id || enCooldownCorreo
                                }
                                onClick={() =>
                                  asignarDuracionCitaAdmin(
                                    c,
                                    totalSel,
                                    observacionTemp[c.id],
                                    tipoAt === 'procedimiento'
                                      ? valorBaseVal
                                      : undefined
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] disabled:opacity-50"
                              >
                                {enviandoCorreoId === c.id
                                  ? 'Enviando...'
                                  : enCooldownCorreo
                                  ? `⏳ Espera ${infoMail.segsRestantes}s para enviar otro correo`
                                  : tipoAt === 'procedimiento'
                                  ? 'Guardar Duración / Costo y Notificar Correo'
                                  : 'Guardar Duración y Notificar Correo'}
                              </button>
                            </div>
                          );
                        })()}
                        <input
                          type="text"
                          placeholder="Observación de autorización o motivo de devolución/cambio..."
                          value={observacionTemp[c.id] || ''}
                          onChange={(e) =>
                            setObservacionTemp((p) => ({
                              ...p,
                              [c.id]: e.target.value,
                            }))
                          }
                          className={INP}
                        />
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            disabled={
                              enviandoCorreoId === c.id || enCooldownCorreo
                            }
                            onClick={() =>
                              actualizarEstadoDocumentos(
                                c,
                                'Aprobados',
                                observacionTemp[c.id],
                                duracionTemp[c.id] ?? c.duracionMin
                              )
                            }
                            className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                          >
                            {enCooldownCorreo
                              ? `⏳ Espera ${infoMail.segsRestantes}s`
                              : '✓ Aprobar Docs y Avisar'}
                          </button>
                          <div className="p-2 rounded-lg bg-amber-50/90 border border-amber-200 space-y-1">
                            <span className="block text-[10px] font-bold text-amber-950">
                              Si falta un documento o está ilegible, solicitar por correo:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                disabled={
                                  enviandoCorreoId === c.id || enCooldownCorreo
                                }
                                onClick={() =>
                                  actualizarEstadoDocumentos(
                                    c,
                                    'Observados',
                                    observacionTemp[c.id],
                                    duracionTemp[c.id] ?? c.duracionMin,
                                    'orden'
                                  )
                                }
                                className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] disabled:opacity-50"
                              >
                                {enCooldownCorreo
                                  ? `⏳ ${infoMail.segsRestantes}s`
                                  : '📄 Pedir Orden'}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  enviandoCorreoId === c.id || enCooldownCorreo
                                }
                                onClick={() =>
                                  actualizarEstadoDocumentos(
                                    c,
                                    'Observados',
                                    observacionTemp[c.id],
                                    duracionTemp[c.id] ?? c.duracionMin,
                                    'autorizacion'
                                  )
                                }
                                className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] disabled:opacity-50"
                              >
                                {enCooldownCorreo
                                  ? `⏳ ${infoMail.segsRestantes}s`
                                  : '📄 Pedir Autoriz.'}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  enviandoCorreoId === c.id || enCooldownCorreo
                                }
                                onClick={() =>
                                  actualizarEstadoDocumentos(
                                    c,
                                    'Observados',
                                    observacionTemp[c.id],
                                    duracionTemp[c.id] ?? c.duracionMin,
                                    'ambos'
                                  )
                                }
                                className="py-1.5 px-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] disabled:opacity-50"
                              >
                                {enCooldownCorreo
                                  ? `⏳ ${infoMail.segsRestantes}s`
                                  : '⚠️ Pedir Ambas'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Cita <strong>{c.estadoCita}</strong> · Gestión de correos y soportes cerrada.
                        </span>
                        {c.observacionAdmin && (
                          <span
                            className="text-slate-500 truncate max-w-[260px]"
                            title={limpiarEtiquetaApartado(c.observacionAdmin)}
                          >
                            {limpiarEtiquetaApartado(c.observacionAdmin)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      {(c.estadoCita === 'Pre-admitida' ||
                        c.estadoCita === 'Reprogramada') && (
                        <button
                          type="button"
                          onClick={() => handleEnviarRecordatorioCorreo(c)}
                          disabled={
                            enviandoCorreoId === c.id || enCooldownCorreo
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-teal-700 text-white font-bold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Ic n="mail" c="w-3.5 h-3.5" />
                          <span>
                            {enviandoCorreoId === c.id
                              ? 'Enviando...'
                              : enCooldownCorreo
                              ? `Espera ${infoMail.segsRestantes}s`
                              : `Recordar Correo (${infoMail.count})`}
                          </span>
                        </button>
                      )}
                      {c.estadoCita !== 'Atendida' &&
                        c.estadoCita !== 'Cancelada' && (
                          <button
                            type="button"
                            onClick={() => abrirModalReprogramacion(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-bold flex items-center gap-1"
                          >
                            <Ic n="calendar" c="w-3.5 h-3.5" />
                            <span>Reprogramar / Área</span>
                          </button>
                        )}
                      {c.estadoCita !== 'No asistió' &&
                        c.estadoCita !== 'Admitida en Sala' &&
                        c.estadoCita !== 'Atendida' &&
                        c.estadoCita !== 'Cancelada' && (
                          <button
                            type="button"
                            onClick={() =>
                              ejecutarActualizacionEstadoCitaAdmin(
                                c.id,
                                'No asistió'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold"
                          >
                            No Asistió
                          </button>
                        )}
                      {c.estadoCita !== 'Atendida' &&
                        c.estadoCita !== 'Cancelada' && (
                          <button
                            type="button"
                            onClick={() =>
                              solicitarCancelarCitaAdmin(
                                c,
                                observacionTemp[c.id]
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 font-bold"
                          >
                            Cancelar
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => eliminarCitaDeNube(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold flex items-center gap-1 ml-auto"
                      >
                        <Ic n="trash" c="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTabAdmin === 'duracion_procedimientos' && adminActual.nivel >= 2 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-5 rounded-2xl border border-teal-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-teal-950">
                  ⏱️ Asignación de Duración y Costo (Cirugías, Procedimientos y Terapias · N2/N3)
                </h3>
                <p className="text-[11px] text-teal-900 mt-0.5">
                  Revisa la Orden Médica, asigna la duración exacta y el valor base para procedimientos variables o personalizados, liquida automáticamente y envía el correo con el costo actualizado al paciente.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSoloPendientesProc(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold border ${
                    !soloPendientesProc
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Todos los Procedimientos Activos
                </button>
                <button
                  type="button"
                  onClick={() => setSoloPendientesProc(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold border ${
                    soloPendientesProc
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Pendientes por Definir Costo / Duración
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOrdenDuracionAdmin((prev) =>
                      prev === 'recientes' ? 'fecha' : 'recientes'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg font-bold border bg-white text-sky-900 border-sky-200"
                >
                  {ordenDuracionAdmin === 'recientes'
                    ? 'Orden: Más nuevas arriba'
                    : 'Orden: Próximas por fecha'}
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Buscar procedimiento, cita, cédula, paciente o médico..."
              value={busquedaDuracionAdmin}
              onChange={(e) => setBusquedaDuracionAdmin(e.target.value)}
              className={`${INP} bg-white`}
            />
          </div>

          {(() => {
            const qDur = busquedaDuracionAdmin.trim().toLowerCase();
            const filtradasDur = citas.filter((c) => {
              if (
                c.estadoCita === 'Atendida' ||
                c.estadoCita === 'Cancelada' ||
                c.estadoCita === 'No asistió'
              ) {
                return false;
              }
              const esProc =
                determinarTipoAtencionCita(c, tiposAtencionCitas) ===
                'procedimiento';
              if (!esProc) return false;
              if (
                soloPendientesProc &&
                !c.costoPendiente &&
                !esDuracionProcedimientoPorDefinir(c, tiposAtencionCitas)
              ) {
                return false;
              }
              if (
                qDur &&
                !c.id.toLowerCase().includes(qDur) &&
                !c.pacienteCedula.toLowerCase().includes(qDur) &&
                !c.pacienteNombre.toLowerCase().includes(qDur) &&
                !c.especialidadNombre.toLowerCase().includes(qDur) &&
                !(c.procedimientoNombre || '').toLowerCase().includes(qDur) &&
                !c.medicoNombre.toLowerCase().includes(qDur)
              ) {
                return false;
              }
              return true;
            });
            const listaDur =
              ordenDuracionAdmin === 'recientes'
                ? [...filtradasDur].sort(compararCitasMasNuevasPrimero)
                : ordenarCitasCronologicamente(filtradasDur);

            if (listaDur.length === 0) {
              return (
                <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
                  {soloPendientesProc
                    ? 'No hay procedimientos pendientes por definir duración o costo.'
                    : 'No hay procedimientos, cirugías o terapias activas que coincidan con este filtro.'}
                </div>
              );
            }

            const PRESETS_RAPIDOS: { label: string; min: number }[] = [
              { label: '30 min', min: 30 },
              { label: '1 h', min: 60 },
              { label: '2 h', min: 120 },
              { label: '4 h', min: 240 },
              { label: '6 h', min: 360 },
              { label: '8 h', min: 480 },
              { label: '12 h', min: 720 },
            ];

            return (
              <div className="grid lg:grid-cols-2 gap-4">
                {listaDur.map((c) => {
                  const totalSel = Math.max(
                    15,
                    duracionTemp[c.id] ?? c.duracionMin
                  );
                  const hSel = Math.floor(totalSel / 60);
                  const mSel = totalSel % 60;
                  const finEst = calcularHoraFinEstimada(c.hora, totalSel);
                  const esProc =
                    determinarTipoAtencionCita(c, tiposAtencionCitas) ===
                    'procedimiento';
                  const ced = puedeVerDatosCompletos
                    ? c.pacienteCedula
                    : enmascararTextoSensible(c.pacienteCedula, 'cedula');
                  const infoMail = obtenerInfoCorreoCita(c);
                  const enCooldownCorreo = infoMail.segsRestantes > 0;
                  const valorBaseVal = esProc ? obtenerValorBaseInicialCita(c) : 0;
                  const copagoPreview =
                    esProc && valorBaseVal > 0
                      ? calcularLiquidacionDesdeValorBase(
                          c.pacienteClasificacion,
                          valorBaseVal,
                          tarifas,
                          'procedimiento',
                          c.especialidad,
                          tarifasParticulares
                        )
                      : 0;

                  return (
                    <div
                      key={c.id}
                      className={`${CARD} space-y-3 text-xs border-teal-200`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                              {c.id}
                            </span>
                            <span className="font-bold text-slate-900">
                              {c.pacienteNombre}
                            </span>
                            <span className="text-slate-500">(CC {ced})</span>
                            {esProc && (
                              <span className="px-2 py-0.5 rounded-full bg-teal-700 text-white font-bold text-[10px]">
                                Procedimiento / Cirugía
                              </span>
                            )}
                            {c.procedimientoPersonalizado && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                                Personalizado
                              </span>
                            )}
                            {c.costoPendiente && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                Costo por definir N2/N3
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 mt-1">
                            {c.especialidadNombre} · Actual:{' '}
                            <span className="text-teal-700">
                              {formatearDuracionHumana(c.duracionMin)}
                            </span>
                          </p>
                          {c.procedimientoNombre && (
                            <p className="font-bold text-teal-800">
                              Procedimiento: {c.procedimientoNombre}
                              {c.procedimientoDetalle
                                ? ` · ${c.procedimientoDetalle}`
                                : ''}
                            </p>
                          )}
                          <p className="text-slate-500">
                            {c.medicoNombre} · {c.fecha}{' '}
                            <strong>{c.hora}</strong>
                          </p>
                          {c.motivoConsulta && (
                            <p className="text-[11px] text-indigo-950 bg-indigo-50/70 border border-indigo-200 rounded-lg px-2 py-1 mt-1">
                              <strong>Síntomas / Motivo:</strong>{' '}
                              {c.motivoConsulta}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-1 shrink-0">
                          <span className="block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[11px]">
                            {c.estadoCita}
                          </span>
                          <span
                            className={`block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              c.estadoDocumentos === 'Aprobados'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.estadoDocumentos === 'Observados'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Docs: {c.estadoDocumentos}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {c.fotoOrdenUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              onVerImagen(
                                `Orden · ${c.pacienteNombre}`,
                                c.fotoOrdenUrl || ''
                              )
                            }
                            className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold flex items-center justify-center gap-1.5"
                          >
                            <IconCamera className="w-4 h-4" />
                            <span>Ver Orden Médica</span>
                          </button>
                        ) : (
                          <span className="p-2 rounded-xl bg-slate-50 border text-slate-400 text-center">
                            Sin Orden Médica
                          </span>
                        )}
                        {c.fotoAutorizacionUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              onVerImagen(
                                `Autorización · ${c.pacienteNombre}`,
                                c.fotoAutorizacionUrl || ''
                              )
                            }
                            className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center gap-1.5"
                          >
                            <IconCamera className="w-4 h-4" />
                            <span>Ver Autorización EPS</span>
                          </button>
                        ) : (
                          <span className="p-2 rounded-xl bg-slate-50 border text-slate-400 text-center">
                            Sin Autorización
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-teal-950">
                            Asignar tiempo por horas y minutos:
                          </span>
                          <span className="font-extrabold text-teal-800">
                            {formatearDuracionHumana(totalSel)} ({totalSel} min)
                            {finEst ? ` · ${c.hora} → ${finEst}` : ''}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {PRESETS_RAPIDOS.map((pr) => (
                            <button
                              key={pr.min}
                              type="button"
                              onClick={() =>
                                setDuracionTemp((p) => ({
                                  ...p,
                                  [c.id]: pr.min,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                totalSel === pr.min
                                  ? 'bg-teal-700 text-white border-teal-800'
                                  : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-100'
                              }`}
                            >
                              {pr.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-teal-900 mb-0.5">
                              Horas (0 – 24 h)
                            </label>
                            <select
                              value={hSel}
                              onChange={(e) => {
                                const nh = Number(e.target.value);
                                const nuevo =
                                  nh === 0 && mSel === 0 ? 30 : nh * 60 + mSel;
                                setDuracionTemp((p) => ({
                                  ...p,
                                  [c.id]: Math.min(1440, nuevo),
                                }));
                              }}
                              className={`${INP} font-bold bg-white`}
                            >
                              {Array.from({ length: 25 }, (_, h) => (
                                <option key={h} value={h}>
                                  {h} {h === 1 ? 'hora' : 'horas'}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-teal-900 mb-0.5">
                              Minutos adicionales
                            </label>
                            <select
                              value={mSel}
                              onChange={(e) => {
                                const nm = Number(e.target.value);
                                const nuevo =
                                  hSel === 0 && nm === 0 ? 20 : hSel * 60 + nm;
                                setDuracionTemp((p) => ({
                                  ...p,
                                  [c.id]: Math.min(1440, nuevo),
                                }));
                              }}
                              className={`${INP} font-bold bg-white`}
                            >
                              {[0, 15, 20, 30, 45].map((mm) => (
                                <option key={mm} value={mm}>
                                  {mm} min
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {esProc && (
                          <div className="p-2.5 rounded-xl bg-white border border-teal-200 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-[11px] font-bold text-teal-950">
                                Valor base procedimiento (COP)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={valorBaseVal}
                                onChange={(e) =>
                                  setValorBaseTemp((p) => ({
                                    ...p,
                                    [c.id]: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  }))
                                }
                                className="w-40 px-2.5 py-1 rounded-lg border border-teal-300 text-right font-bold bg-white"
                              />
                            </div>
                            <p className="text-[10px] font-semibold text-slate-600">
                              {valorBaseVal > 0 ? (
                                <>
                                  {obtenerEtiquetaConceptoPago(
                                    c.pacienteClasificacion,
                                    'procedimiento'
                                  )}
                                  :{' '}
                                  <strong className="text-emerald-700">
                                    {copagoPreview === 0
                                      ? '$0 COP (Exento)'
                                      : `$${copagoPreview.toLocaleString(
                                          'es-CO'
                                        )} COP`}
                                  </strong>
                                </>
                              ) : (
                                <span className="text-amber-700 font-bold">
                                  {c.costoPendiente
                                    ? 'Asigna un valor base > $0 para liquidar y enviar el costo al correo del paciente.'
                                    : `Valor liquidado actual: $${c.valorCopago.toLocaleString(
                                        'es-CO'
                                      )} COP`}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        <input
                          type="text"
                          placeholder="Indicaciones o nota para el correo del paciente (ej: Cirugía ambulatoria · ayuno 8h)..."
                          value={observacionTemp[c.id] || ''}
                          onChange={(e) =>
                            setObservacionTemp((p) => ({
                              ...p,
                              [c.id]: e.target.value,
                            }))
                          }
                          className={`${INP} bg-white`}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-teal-950">
                              ✉️ Correos enviados: {infoMail.count}
                            </span>
                            {infoMail.lastTipo && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-900 font-bold">
                                Último tipo: {infoMail.lastTipo}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-600">
                            {enCooldownCorreo ? (
                              <strong className="text-amber-700">
                                ⏳ Cooldown: {infoMail.segsRestantes}s
                              </strong>
                            ) : infoMail.horaTexto ? (
                              `Despachado: ${infoMail.horaTexto} (sin confirmación de lectura)`
                            ) : (
                              'Sin envíos registrados aún'
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={enviandoCorreoId === c.id || enCooldownCorreo}
                          onClick={() =>
                            asignarDuracionCitaAdmin(
                              c,
                              totalSel,
                              observacionTemp[c.id],
                              esProc ? valorBaseVal : undefined
                            )
                          }
                          className="w-full py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold disabled:opacity-50"
                        >
                          {enviandoCorreoId === c.id
                            ? 'Guardando y enviando correo...'
                            : enCooldownCorreo
                            ? `⏳ Espera ${infoMail.segsRestantes}s para enviar otro correo`
                            : esProc
                            ? `✓ Asignar ${formatearDuracionHumana(
                                totalSel
                              )} / Costo y Enviar Correo`
                            : `✓ Asignar ${formatearDuracionHumana(
                                totalSel
                              )} y Enviar Correo al Paciente`}
                        </button>

                        <div className="grid sm:grid-cols-2 gap-2 pt-1 border-t border-teal-200/80">
                          <button
                            type="button"
                            disabled={
                              enviandoCorreoId === c.id || enCooldownCorreo
                            }
                            onClick={() =>
                              actualizarEstadoDocumentos(
                                c,
                                'Aprobados',
                                observacionTemp[c.id],
                                totalSel
                              )
                            }
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] disabled:opacity-50"
                          >
                            {enCooldownCorreo
                              ? `⏳ Espera ${infoMail.segsRestantes}s`
                              : '✓ Aprobar Docs y Avisar'}
                          </button>
                          <button
                            type="button"
                            disabled={
                              enviandoCorreoId === c.id || enCooldownCorreo
                            }
                            onClick={() =>
                              actualizarEstadoDocumentos(
                                c,
                                'Observados',
                                observacionTemp[c.id]?.trim() ||
                                  'Documentos no legibles o erróneos. Por favor vuelve a subir la Orden Médica y/o Autorización EPS desde Mis Citas.'
                              )
                            }
                            className="py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] disabled:opacity-50"
                          >
                            {enCooldownCorreo
                              ? `⏳ Espera ${infoMail.segsRestantes}s`
                              : '⚠️ Docs no legibles / erróneos · Volver a enviar'}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-teal-200/80">
                          {(c.estadoCita === 'Pre-admitida' ||
                            c.estadoCita === 'Reprogramada') && (
                            <button
                              type="button"
                              onClick={() => handleEnviarRecordatorioCorreo(c)}
                              disabled={
                                enviandoCorreoId === c.id || enCooldownCorreo
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-teal-700 text-white font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                              <Ic n="mail" c="w-3.5 h-3.5" />
                              <span>
                                {enviandoCorreoId === c.id
                                  ? 'Enviando...'
                                  : enCooldownCorreo
                                  ? `Espera ${infoMail.segsRestantes}s`
                                  : `Recordar Correo (${infoMail.count})`}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => abrirModalReprogramacion(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-bold flex items-center gap-1"
                          >
                            <Ic n="calendar" c="w-3.5 h-3.5" />
                            <span>Reprogramar / Área</span>
                          </button>
                          {c.estadoCita !== 'No asistió' &&
                            c.estadoCita !== 'Admitida en Sala' && (
                              <button
                                type="button"
                                onClick={() =>
                                  ejecutarActualizacionEstadoCitaAdmin(
                                    c.id,
                                    'No asistió'
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold"
                              >
                                No Asistió
                              </button>
                            )}
                          <button
                            type="button"
                            onClick={() =>
                              solicitarCancelarCitaAdmin(
                                c,
                                observacionTemp[c.id]
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 font-bold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarCitaDeNube(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold flex items-center gap-1 ml-auto"
                          >
                            <Ic n="trash" c="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {subTabAdmin === 'admisiones' && adminActual.nivel >= 3 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-5 rounded-2xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Ic n="qr" c="w-4 h-4 text-teal-700" />
                <span>Validador Rápido QR / Código en Ventanilla</span>
              </h3>
              <span className="text-[11px] text-teal-800 font-medium">
                CIT-XXXXX o cédula
              </span>
            </div>
            <form
              onSubmit={validarCodigoQrEnAdmisiones}
              className="flex flex-wrap gap-2"
            >
              <input
                type="text"
                placeholder="Ej: CIT-12345 o cédula..."
                value={codigoQrInput}
                onChange={(e) => setCodigoQrInput(e.target.value)}
                className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border border-teal-300 text-xs font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold"
              >
                Verificar Pase
              </button>
            </form>
            {resultadoLectorQr && (
              <div
                className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                  resultadoLectorQr.tipo === 'ok'
                    ? 'bg-white border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <p className="font-bold">{resultadoLectorQr.mensaje}</p>
                  {citaQr && (
                    <p className="text-slate-600 mt-0.5">
                      Estado: <strong>{citaQr.estadoCita}</strong> · Docs:{' '}
                      <strong>{citaQr.estadoDocumentos}</strong> · Valor:{' '}
                      <strong>
                        ${citaQr.valorCopago.toLocaleString('es-CO')}
                      </strong>
                    </p>
                  )}
                </div>
                {citaQr &&
                  (citaQr.estadoCita === 'Pre-admitida' ||
                    citaQr.estadoCita === 'Reprogramada') && (
                    <button
                      type="button"
                      onClick={() => {
                        ejecutarActualizacionEstadoCitaAdmin(
                          citaQr.id,
                          'Admitida en Sala'
                        );
                        setResultadoLectorQr(null);
                        setCodigoQrInput('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                    >
                      Admitir a Sala
                    </button>
                  )}
              </div>
            )}
          </div>

          {(() => {
            const citasAdmisiones = citas.filter(
              (c) => c.estadoCita !== 'Cancelada'
            );
            const citasAdmActivas = citasAdmisiones
              .filter((c) => !esEstadoCitaCerrado(c.estadoCita))
              .sort(compararCitasMasNuevasPrimero);
            const citasAdmCerradas = citasAdmisiones
              .filter((c) => esEstadoCitaCerrado(c.estadoCita))
              .sort(compararCitasMasNuevasPrimero);
            const citasAdmOrdenadas = [
              ...citasAdmActivas,
              ...citasAdmCerradas,
            ];

            if (citasAdmOrdenadas.length === 0) {
              return (
                <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
                  Sin pacientes en agenda.
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600">
                  <span>
                    <strong>Pendientes / En Sala ({citasAdmActivas.length})</strong>{' '}
                    arriba (más nuevas primero) ·{' '}
                    <strong>Atendidas / Cerradas ({citasAdmCerradas.length})</strong>{' '}
                    al final.
                  </span>
                </div>
                {citasAdmOrdenadas.map((c, idx) => {
                  const esPrimeraCerrada =
                    idx === citasAdmActivas.length && citasAdmCerradas.length > 0;
                  const vencida = esCitaVencidaSinLlegada(c);
                  const met: MetodoPagoTipo =
                    metodoPagoTemp[c.id] ||
                    (c.valorCopago === 0 ? 'Exento ($0)' : 'Efectivo');
                  const reciboActual =
                    reciboInputTemp[c.id] ??
                    recibosCitas[c.id] ??
                    c.reciboNumero ??
                    '';
                  const mostrarInputRecibo =
                    met === 'Datáfono' ||
                    met === 'Transferencia' ||
                    met === 'Efectivo';
                  const infoMailAdm = obtenerInfoCorreoCita(c);

                  return (
                    <React.Fragment key={c.id}>
                      {esPrimeraCerrada && (
                        <div className="pt-2 pb-1 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          <span className="h-px flex-1 bg-slate-200" />
                          <span>
                            Historial ya Atendido / Cerrado ({citasAdmCerradas.length})
                          </span>
                          <span className="h-px flex-1 bg-slate-200" />
                        </div>
                      )}
                      <div
                        className={`${CARD} p-4 flex flex-wrap items-center justify-between gap-4 text-xs ${
                          vencida
                            ? 'border-rose-300 bg-rose-50/20'
                            : esEstadoCitaCerrado(c.estadoCita)
                            ? 'opacity-85 bg-slate-50/70'
                            : ''
                        }`}
                      >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm">
                            {c.pacienteNombre} ·{' '}
                            <span className="text-sky-700">{c.id}</span>
                          </p>
                          <span className="text-slate-500">
                            (CC {c.pacienteCedula})
                          </span>
                          {c.estadoCita === 'Reprogramada' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Reprogramada
                            </span>
                          )}
                          {c.costoPendiente && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Costo por definir N2/N3
                            </span>
                          )}
                          {vencida && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Vencida
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">
                          {c.pacienteEps} ({c.pacienteClasificacion}) · Docs:{' '}
                          <strong>{c.estadoDocumentos}</strong>
                        </p>
                        {c.procedimientoNombre && (
                          <p className="font-bold text-teal-800">
                            Procedimiento: {c.procedimientoNombre}
                          </p>
                        )}
                        <p className="text-slate-600">
                          <strong>{c.especialidadNombre}</strong> ·{' '}
                          {c.medicoNombre} (
                          {obtenerConsultorioPorMedico(c.medicoId)}) · {c.fecha}{' '}
                          <strong>{c.hora}</strong>
                        </p>
                        {(infoMailAdm.count > 0 || infoMailAdm.lastTipo) && (
                          <p className="text-[11px] text-sky-900 font-semibold">
                            ✉️ Correos: {infoMailAdm.count}
                            {infoMailAdm.lastTipo
                              ? ` · Último tipo: ${infoMailAdm.lastTipo}`
                              : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-500">
                            {obtenerEtiquetaConceptoPago(
                              c.pacienteClasificacion,
                              determinarTipoAtencionCita(c, tiposAtencionCitas)
                            )}
                          </span>
                          <span
                            className={`text-base font-extrabold ${
                              c.costoPendiente
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {c.costoPendiente
                              ? 'Por definir (N2/N3)'
                              : `$${c.valorCopago.toLocaleString('es-CO')}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onVerFactura(c)}
                          className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1"
                        >
                          <Ic n="receipt" c="w-3.5 h-3.5" />
                          <span>Ver Factura</span>
                        </button>
                        {c.estadoCita === 'Atendida' ? (
                          <span className="px-3.5 py-2 rounded-xl bg-teal-100 text-teal-900 font-bold">
                            ✓ Atendida · {c.metodoPago || 'OK'}
                            {recibosCitas[c.id]
                              ? ` · ${recibosCitas[c.id]}`
                              : ''}
                          </span>
                        ) : c.estadoCita === 'Admitida en Sala' ? (
                          c.costoPendiente ? (
                            <div className="flex flex-col items-end gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-300 text-[11px] max-w-xs">
                              <span className="font-bold text-amber-950">
                                ⚠️ Costo de procedimiento pendiente. Asígnalo primero en Agendas o Duración/Costo Proc. (N2+).
                              </span>
                              <button
                                type="button"
                                disabled
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold opacity-50 cursor-not-allowed"
                              >
                                Finalizar y Enviar Recibo
                              </button>
                            </div>
                          ) : (
                          <div className="flex flex-wrap items-center gap-2 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <select
                              value={met}
                              onChange={(e) => {
                                const nuevoMet = e.target
                                  .value as MetodoPagoTipo;
                                setMetodoPagoTemp((p) => ({
                                  ...p,
                                  [c.id]: nuevoMet,
                                }));
                                const actual = reciboInputTemp[c.id];
                                const esAutoOVacio =
                                  !actual ||
                                  /^REC-(EFE|DAT|TRF|EXE)-\d+$/.test(
                                    actual.trim()
                                  );
                                if (esAutoOVacio) {
                                  setReciboInputTemp((r) => ({
                                    ...r,
                                    [c.id]: generarNumeroRecibo(nuevoMet),
                                  }));
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                            >
                              {c.valorCopago === 0 ? (
                                <option value="Exento ($0)">Exento ($0)</option>
                              ) : (
                                <>
                                  <option value="Efectivo">Efectivo</option>
                                  <option value="Datáfono">Datáfono</option>
                                  <option value="Transferencia">
                                    Transferencia
                                  </option>
                                </>
                              )}
                            </select>
                            {c.valorCopago > 0 && mostrarInputRecibo && (
                              <input
                                type="text"
                                placeholder="N.° Recibo / Voucher"
                                value={reciboActual}
                                onChange={(e) =>
                                  setReciboInputTemp((r) => ({
                                    ...r,
                                    [c.id]: e.target.value,
                                  }))
                                }
                                className="w-36 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs font-bold"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const recFinal =
                                  c.valorCopago === 0
                                    ? reciboActual ||
                                      generarNumeroRecibo('Exento ($0)')
                                    : reciboActual.trim() ||
                                      generarNumeroRecibo(met);
                                ejecutarActualizacionEstadoCitaAdmin(
                                  c.id,
                                  'Atendida',
                                  met,
                                  undefined,
                                  recFinal
                                );
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Finalizar y Enviar Recibo
                            </button>
                          </div>
                          )
                        ) : c.estadoCita === 'No asistió' ? (
                          <span className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold">
                            No asistió
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                ejecutarActualizacionEstadoCitaAdmin(
                                  c.id,
                                  'Admitida en Sala'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-teal-700 text-white font-bold"
                            >
                              Confirmar Llegada
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                ejecutarActualizacionEstadoCitaAdmin(
                                  c.id,
                                  'No asistió'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                            >
                              No Asistió
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {subTabAdmin === 'parametrizacion' && adminActual.nivel >= 4 && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className={`${CARD} space-y-3`}>
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold">
                  Directorio Médico y Descanso Semanal
                </h3>
                <button
                  type="button"
                  onClick={restaurarMedicosBaseNube}
                  disabled={sincronizandoNube}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold"
                >
                  Restaurar 155 base
                </button>
              </div>
              {mensajeMedicoGestion && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-900">
                  {mensajeMedicoGestion}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-teal-950 block">
                      🩺 Médico Auxiliar / Suplente de Turno
                    </span>
                    <p className="text-[11px] text-teal-900/80 mt-0.5">
                      Se ofrece al paciente como reemplazo automático cuando un
                      especialista titular está en su día de descanso o alcanzó
                      su tope diario.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 font-bold text-teal-900 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                      <input
                        type="checkbox"
                        checked={auxiliarTurno.activo}
                        onChange={(e) =>
                          onActualizarAuxiliarTurno({
                            ...auxiliarTurno,
                            activo: e.target.checked,
                          })
                        }
                        className="accent-teal-700"
                      />
                      <span>
                        {auxiliarTurno.activo ? 'Habilitado' : 'Desactivado'}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onActualizarAuxiliarTurno(AUXILIAR_TURNO_DEFAULT)
                      }
                      className="px-2 py-1 rounded-lg bg-white border border-teal-200 text-[11px] font-bold text-teal-900 hover:bg-teal-100"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-teal-950 mb-1">
                      Nombre del profesional suplente
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Dr(a). Auxiliar Médico de Turno"
                      value={auxiliarTurno.nombre}
                      onChange={(e) =>
                        onActualizarAuxiliarTurno({
                          ...auxiliarTurno,
                          nombre: e.target.value,
                        })
                      }
                      className={`${INP} bg-white`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1">
                      Código interno del auxiliar
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: MED-AUX-00"
                      value={auxiliarTurno.codigo}
                      onChange={(e) =>
                        onActualizarAuxiliarTurno({
                          ...auxiliarTurno,
                          codigo: e.target.value,
                        })
                      }
                      className={`${INP} bg-white`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1">
                      Consultorio asignado
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Cons. Auxiliar 01"
                      value={auxiliarTurno.consultorio}
                      onChange={(e) =>
                        onActualizarAuxiliarTurno({
                          ...auxiliarTurno,
                          consultorio: e.target.value,
                        })
                      }
                      className={`${INP} bg-white`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-teal-800 font-semibold">
                  ✓ Los cambios del médico auxiliar se guardan automáticamente en
                  este equipo al editar.
                </p>
              </div>

              <form
                onSubmit={agregarNuevoMedicoAdmin}
                className="space-y-2.5 text-xs"
              >
                <input
                  type="text"
                  placeholder="Nombre completo del especialista"
                  value={nuevoMedNombre}
                  onChange={(e) => setNuevoMedNombre(e.target.value)}
                  className={INP}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Código (MED-DE-603)"
                    value={nuevoMedCodigo}
                    onChange={(e) => setNuevoMedCodigo(e.target.value)}
                    className={INP}
                  />
                  <input
                    type="text"
                    placeholder="Consultorio"
                    value={nuevoMedConsultorio}
                    onChange={(e) => setNuevoMedConsultorio(e.target.value)}
                    className={INP}
                  />
                  <select
                    value={nuevoMedAreaServ}
                    onChange={(e) => {
                      const a = e.target.value as AreaServicioId;
                      setNuevoMedAreaServ(a);
                      const p = ESPECIALIDADES.find((x) => x.areaId === a);
                      if (p) setNuevoMedArea(p.id);
                    }}
                    className={`${INP} font-semibold`}
                  >
                    {AREAS_SERVICIO.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  <select
                    value={nuevoMedArea}
                    onChange={(e) => setNuevoMedArea(e.target.value)}
                    className={`${INP} font-semibold`}
                  >
                    {espsMedNuevoArea.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} ({e.duracionMin}m)
                      </option>
                    ))}
                  </select>
                  <select
                    value={nuevoMedDescanso}
                    onChange={(e) =>
                      setNuevoMedDescanso(Number(e.target.value) as DiaSemanaNum)
                    }
                    className={`${INP} col-span-2 font-semibold`}
                  >
                    {DIAS_SEMANA_OPCIONES.map((d) => (
                      <option key={d.valor} value={d.valor}>
                        Descanso semanal: {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold"
                >
                  + Guardar Especialista
                </button>
              </form>

              <div className="pt-2 border-t space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px]">
                  <span className="font-bold text-slate-600">
                    Especialistas ({medicosFiltradosGestion.length})
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Buscar nombre, código o cons..."
                      value={busquedaMedGestion}
                      onChange={(e) => setBusquedaMedGestion(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border text-[11px] w-44"
                    />
                    <select
                      value={filtroMedGestion}
                      onChange={(e) => setFiltroMedGestion(e.target.value)}
                      className="px-2 py-1 rounded-lg border"
                    >
                      <option value="todas">Todas</option>
                      {ESPECIALIDADES.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {medicoEditandoAdmin && (
                  <form
                    onSubmit={manejarGuardarMedicoAdmin}
                    className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-indigo-950">
                        Editando Médico · {medicoEditandoAdmin.codigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMedicoEditandoAdmin(null);
                          setErrorEdicionMedicoAdmin('');
                        }}
                        className="text-slate-600 font-bold hover:underline"
                      >
                        Cerrar
                      </button>
                    </div>
                    {errorEdicionMedicoAdmin && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                        {errorEdicionMedicoAdmin}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          required
                          value={medicoEditandoAdmin.nombre}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              nombre: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Código institucional
                        </label>
                        <input
                          type="text"
                          required
                          value={medicoEditandoAdmin.codigo}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              codigo: e.target.value.toUpperCase(),
                            })
                          }
                          className={`${INP} font-bold uppercase`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Área / Servicio
                        </label>
                        <select
                          value={medicoEditandoAdmin.areaId}
                          onChange={(e) => {
                            const areaId = e.target.value as AreaServicioId;
                            const primera = ESPECIALIDADES.find(
                              (x) => x.areaId === areaId
                            );
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              areaId,
                              especialidad:
                                primera?.id || medicoEditandoAdmin.especialidad,
                            });
                          }}
                          className={`${INP} font-semibold`}
                        >
                          {AREAS_SERVICIO.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Especialidad
                        </label>
                        <select
                          value={medicoEditandoAdmin.especialidad}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              especialidad: e.target.value,
                            })
                          }
                          className={`${INP} font-semibold`}
                        >
                          {ESPECIALIDADES.filter(
                            (e) => e.areaId === medicoEditandoAdmin.areaId
                          ).map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Consultorio / Ubicación
                        </label>
                        <input
                          type="text"
                          required
                          value={medicoEditandoAdmin.consultorio}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              consultorio: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Descanso semanal
                        </label>
                        <select
                          value={medicoEditandoAdmin.descanso}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              descanso: Number(e.target.value) as DiaSemanaNum,
                            })
                          }
                          className={`${INP} font-semibold`}
                        >
                          {DIAS_SEMANA_OPCIONES.map((d) => (
                            <option key={d.valor} value={d.valor}>
                              {d.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Teléfono (opcional)
                        </label>
                        <input
                          type="tel"
                          value={medicoEditandoAdmin.telefono}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              telefono: e.target.value,
                            })
                          }
                          placeholder="Ej: 3001234567"
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Correo profesional (opcional)
                        </label>
                        <input
                          type="email"
                          value={medicoEditandoAdmin.correo}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              correo: e.target.value,
                            })
                          }
                          placeholder="medico@saludviva.co"
                          className={INP}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="font-semibold">
                            PIN personalizado (4 dígitos · vacío = usa{' '}
                            <strong>
                              {obtenerPinDefaultMedico(
                                medicoEditandoAdmin.codigo
                              )}
                            </strong>{' '}
                            / 2026)
                          </label>
                          {medicoEditandoAdmin.pin && (
                            <button
                              type="button"
                              onClick={() =>
                                setMedicoEditandoAdmin({
                                  ...medicoEditandoAdmin,
                                  pin: '',
                                })
                              }
                              className="text-[11px] font-bold text-indigo-700 hover:underline"
                            >
                              Restaurar PIN por defecto
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={4}
                          inputMode="numeric"
                          placeholder={`Ej: ${obtenerPinDefaultMedico(
                            medicoEditandoAdmin.codigo
                          )} (o dejar vacío para PIN por defecto)`}
                          value={medicoEditandoAdmin.pin}
                          onChange={(e) =>
                            setMedicoEditandoAdmin({
                              ...medicoEditandoAdmin,
                              pin: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          className={`${INP} font-bold tracking-widest`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMedicoEditandoAdmin(null);
                          setErrorEdicionMedicoAdmin('');
                        }}
                        className="px-3 py-1.5 rounded-xl border bg-white text-slate-700 font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardandoMedicoAdmin}
                        className="px-4 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold"
                      >
                        {guardandoMedicoAdmin
                          ? 'Guardando...'
                          : 'Guardar Cambios del Médico'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {medicosFiltradosGestion.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border flex flex-wrap justify-between items-center gap-2 text-xs ${
                        medicoEditandoAdmin?.id === m.id
                          ? 'bg-indigo-50 border-indigo-400'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{m.nombre}</p>
                        <p className="text-[11px] text-slate-500">
                          {m.codigo} (
                          {m.pin ? (
                            <>
                              PIN: <strong>{m.pin}</strong>
                            </>
                          ) : (
                            <>
                              PIN:{' '}
                              <strong>{obtenerPinDefaultMedico(m.codigo)}</strong>{' '}
                              / <strong>2026</strong>
                            </>
                          )}
                          ) ·{' '}
                          {ESPECIALIDADES.find((e) => e.id === m.especialidad)
                            ?.nombre || m.especialidad}{' '}
                          · {m.consultorio}
                          {m.telefono ? ` · Tel: ${m.telefono}` : ''}
                          {m.correo ? ` · ${m.correo}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => seleccionarMedicoEdicionAdmin(m)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold"
                        >
                          Editar
                        </button>
                        <select
                          aria-label={`Descanso ${m.nombre}`}
                          value={descansosMedicos[m.id] ?? -1}
                          onChange={(e) =>
                            onCambiarDescansoMedico(
                              m.id,
                              Number(e.target.value) as DiaSemanaNum
                            )
                          }
                          className="px-2 py-1 rounded-lg border text-[11px] font-semibold"
                        >
                          {DIAS_SEMANA_OPCIONES.map((d) => (
                            <option key={d.valor} value={d.valor}>
                              Desc: {d.nombre}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => eliminarMedicoNube(m)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${CARD} space-y-3`}>
              <h3 className="text-base font-bold">
                Administradores (Niveles 1 a 4)
              </h3>
              {mensajeAdminGestion && (
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900">
                  {mensajeAdminGestion}
                </div>
              )}
              <form
                onSubmit={agregarNuevoAdministradorNube}
                className="space-y-2.5 text-xs"
              >
                <input
                  type="text"
                  placeholder="Nombre del funcionario"
                  value={nuevoAdminNombre}
                  onChange={(e) => setNuevoAdminNombre(e.target.value)}
                  className={INP}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Cédula"
                    value={nuevoAdminCedula}
                    onChange={(e) =>
                      setNuevoAdminCedula(e.target.value.replace(/\D/g, ''))
                    }
                    className={INP}
                  />
                  <select
                    value={nuevoAdminNivel}
                    onChange={(e) =>
                      setNuevoAdminNivel(Number(e.target.value) as NivelAdmin)
                    }
                    className={`${INP} font-semibold`}
                  >
                    <option value={1}>N1 · Auditoría/KPI</option>
                    <option value={2}>N2 · Agendas/Autoriz.</option>
                    <option value={3}>N3 · Admisiones/Caja</option>
                    <option value={4}>N4 · Admin General</option>
                  </select>
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="PIN (4 díg)"
                    value={nuevoAdminPin}
                    onChange={(e) =>
                      setNuevoAdminPin(e.target.value.replace(/\D/g, ''))
                    }
                    className={INP}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-700 text-white font-bold"
                >
                  + Guardar Administrador
                </button>
              </form>
              <div className="pt-2 border-t space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <p className="text-[11px] font-bold text-slate-600">
                  Usuarios ({administradores.length})
                </p>
                {administradores.map((a) => (
                  <div
                    key={a.cedula}
                    className="p-2.5 rounded-xl bg-slate-50 border flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold">
                        {a.nombre} ·{' '}
                        <span className="text-teal-700">Nivel {a.nivel}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        CC: {a.cedula} · PIN: {a.pin}
                      </p>
                    </div>
                    {a.protegido ? (
                      <span className="text-[10px] font-bold text-slate-400">
                        Protegido
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => eliminarAdministradorNube(a)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${CARD} space-y-4`}>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-base font-bold">
                  Edición de Pacientes ({pacientes.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Corrige cédula, PIN, contacto, EPS, régimen, tipo y rango en
                  Supabase.
                </p>
              </div>
              <input
                type="text"
                placeholder="Buscar cédula o nombre..."
                value={busquedaPacienteAdmin}
                onChange={(e) => setBusquedaPacienteAdmin(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs w-64"
              />
            </div>
            {mensajePacienteAdmin && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  mensajePacienteAdmin.startsWith('✓')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mensajePacienteAdmin}
              </div>
            )}
            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {pacientesFiltradosAdmin.map((p) => (
                  <button
                    key={p.cedula}
                    type="button"
                    onClick={() => seleccionarPacienteEnAdmin(p)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs ${
                      pacienteOriginalCedulaAdmin === p.cedula &&
                      pacienteSeleccionadoAdmin
                        ? 'bg-sky-50 border-sky-400'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-bold">
                      {p.nombres} {p.apellidos}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      CC: {p.cedula} · PIN: {p.pin} · {p.eps}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {p.clasificacion}
                    </p>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-7">
                {pacienteSeleccionadoAdmin ? (
                  <form
                    onSubmit={guardarEdicionPacienteDesdeAdmin}
                    className="p-4 rounded-2xl bg-slate-50 border space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-800">
                        Editando (CC original: {pacienteOriginalCedulaAdmin})
                      </span>
                      <button
                        type="button"
                        onClick={() => setPacienteSeleccionadoAdmin(null)}
                        className="text-slate-500 font-bold"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Cédula
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pacienteSeleccionadoAdmin.cedula}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              cedula: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          className={`${INP} font-bold`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          PIN (4 díg)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          inputMode="numeric"
                          value={pacienteSeleccionadoAdmin.pin}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              pin: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          className={`${INP} font-bold tracking-widest`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Nombres
                        </label>
                        <input
                          type="text"
                          value={pacienteSeleccionadoAdmin.nombres}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              nombres: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          value={pacienteSeleccionadoAdmin.apellidos}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              apellidos: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={pacienteSeleccionadoAdmin.telefono}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              telefono: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-0.5">
                          Correo
                        </label>
                        <input
                          type="email"
                          value={pacienteSeleccionadoAdmin.correo}
                          onChange={(e) =>
                            setPacienteSeleccionadoAdmin({
                              ...pacienteSeleccionadoAdmin,
                              correo: e.target.value,
                            })
                          }
                          className={INP}
                        />
                      </div>
                    </div>
                    <CamposAfiliacion
                      eps={pacienteSeleccionadoAdmin.eps}
                      regimen={adminPacRegimen}
                      tipoAfiliacion={adminPacTipoAfiliacion}
                      rango={adminPacRango}
                      onChange={(v) => {
                        setPacienteSeleccionadoAdmin({
                          ...pacienteSeleccionadoAdmin,
                          eps: v.eps,
                        });
                        setAdminPacRegimen(v.regimen);
                        setAdminPacTipoAfiliacion(v.tipoAfiliacion);
                        setAdminPacRango(v.rango);
                      }}
                    />
                    <button
                      type="submit"
                      disabled={enviandoFormulario}
                      className="w-full py-2 rounded-xl bg-sky-600 text-white font-bold"
                    >
                      {enviandoFormulario
                        ? 'Guardando...'
                        : 'Actualizar Paciente y Citas'}
                    </button>
                  </form>
                ) : (
                  <div className="h-full min-h-[150px] rounded-2xl border border-dashed flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                    Selecciona un paciente para editar sus datos, PIN o cédula.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`${CARD} space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold">
                  Tarifario por Especialidad: Consulta vs Procedimiento ({ESPECIALIDADES.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Edita por separado <strong>Consulta Particular</strong> y{' '}
                  <strong>Procedimiento / Cirugía</strong>. Se sincroniza con Supabase al editar y también al guardar abajo o usando el botón{' '}
                  <strong>Guardar Tarifario</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filtrar especialidad..."
                  value={busquedaTarifaPart}
                  onChange={(e) => setBusquedaTarifaPart(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={onRestaurarTarifasParticulares}
                  disabled={guardandoTarifario}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold disabled:opacity-50"
                >
                  Restaurar base
                </button>
                <button
                  type="button"
                  onClick={onGuardarTarifarioEspecialidadesNube}
                  disabled={guardandoTarifario}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold disabled:opacity-50"
                >
                  {guardandoTarifario
                    ? 'Guardando...'
                    : 'Guardar Tarifario en Supabase'}
                </button>
              </div>
            </div>
            {mensajeTarifarioAdmin && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  mensajeTarifarioAdmin.startsWith('✓')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mensajeTarifarioAdmin}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {espsTarifarioFiltradas.map((esp) => {
                const valConsulta = obtenerTarifaParticularEspecialidad(
                  esp.id,
                  tarifasParticulares,
                  tarifas.particular
                );
                const valProcedimiento = obtenerValorReferencialProcedimiento(
                  esp.id,
                  tarifasParticulares,
                  tarifas.particular,
                  tarifasProcedimientos,
                  tarifas.particularProcedimiento
                );
                return (
                  <div
                    key={esp.id}
                    className="p-2.5 rounded-xl bg-slate-50 border space-y-2"
                  >
                    <span className="font-bold text-slate-900 block truncate">
                      {esp.nombre}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-sky-800 mb-0.5">
                          Consulta ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={valConsulta}
                          onChange={(e) =>
                            onCambiarTarifaParticularEsp(
                              esp.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 rounded-lg border text-right font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">
                          Procedimiento ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={valProcedimiento}
                          onChange={(e) =>
                            onCambiarTarifaProcedimientoEsp(
                              esp.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 rounded-lg border border-teal-200 text-right font-bold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${CARD} space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold">
                  Tarifario Detallado por Procedimiento ({PROCEDIMIENTOS_CATALOGO.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ajusta el valor base particular de cada procedimiento del catálogo (los procedimientos marcados como <strong>Variable N2/N3</strong> en $0 quedan pendientes hasta asignación en N2/N3).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filtroAreaTarifaProc}
                  onChange={(e) => setFiltroAreaTarifaProc(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="todas">Todas las áreas</option>
                  {AREAS_SERVICIO.filter((a) => a.id !== 'general').map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Buscar procedimiento..."
                  value={busquedaTarifaProc}
                  onChange={(e) => setBusquedaTarifaProc(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={onRestaurarTarifasCatalogoProc}
                  disabled={guardandoTarifarioProc}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold disabled:opacity-50"
                >
                  Restaurar base
                </button>
                <button
                  type="button"
                  onClick={onGuardarTarifarioProcedimientosNube}
                  disabled={guardandoTarifarioProc}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold disabled:opacity-50"
                >
                  {guardandoTarifarioProc
                    ? 'Guardando...'
                    : 'Guardar Procedimientos en Supabase'}
                </button>
              </div>
            </div>
            {mensajeTarifarioProcAdmin && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  mensajeTarifarioProcAdmin.startsWith('✓')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mensajeTarifarioProcAdmin}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {PROCEDIMIENTOS_CATALOGO.filter((proc) => {
                if (
                  filtroAreaTarifaProc !== 'todas' &&
                  proc.areaId !== filtroAreaTarifaProc
                ) {
                  return false;
                }
                const q = busquedaTarifaProc.trim().toLowerCase();
                if (!q) return true;
                const espNom =
                  ESPECIALIDADES.find((e) => e.id === proc.especialidadId)
                    ?.nombre || '';
                return (
                  proc.nombre.toLowerCase().includes(q) ||
                  espNom.toLowerCase().includes(q)
                );
              }).map((proc) => {
                const valProc =
                  tarifasCatalogoProcedimientos[proc.id] ?? proc.tarifaParticular;
                const espNom =
                  ESPECIALIDADES.find((e) => e.id === proc.especialidadId)
                    ?.nombre || proc.especialidadId;
                return (
                  <div
                    key={proc.id}
                    className="p-2.5 rounded-xl bg-slate-50 border flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block truncate">
                        {proc.nombre}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {espNom} · {proc.duracionMin} min
                        {proc.esVariable ? ' · Variable (N2/N3 si $0)' : ''}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={valProc}
                      onChange={(e) =>
                        onCambiarTarifaCatalogoProc(
                          proc.id,
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-28 px-2 py-1 rounded-lg border border-teal-200 text-right font-bold bg-white shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <form
              onSubmit={guardarConfiguracionNube}
              className={`${CARD} space-y-3`}
            >
              <h3 className="text-sm font-bold">Tarifas SGSSS y Umbrales</h3>
              {mensajeConfigAdmin && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
                  {mensajeConfigAdmin}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {(['A', 'B', 'C', 'particular'] as const).map((k) => (
                  <div key={k}>
                    <label className="block font-semibold mb-1">
                      {k === 'particular'
                        ? 'Particular Base Consulta (COP)'
                        : `Cuota Moderadora Rango ${k}`}
                    </label>
                    <input
                      type="number"
                      value={tarifas[k]}
                      onChange={(e) =>
                        setTarifas({
                          ...tarifas,
                          [k]: Number(e.target.value),
                        })
                      }
                      className={INP}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block font-semibold text-teal-900 mb-1">
                    Particular Base Procedimiento (COP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={tarifas.particularProcedimiento ?? 75000}
                    onChange={(e) =>
                      setTarifas({
                        ...tarifas,
                        particularProcedimiento: Number(e.target.value),
                      })
                    }
                    className={`${INP} border-teal-200`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-800 mb-1">
                    Alerta Agendadas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={topeMaximoCitas}
                    value={umbralAlertaAgendadas}
                    onChange={(e) =>
                      setUmbralAlertaAgendadas(Number(e.target.value))
                    }
                    className={`${INP} border-amber-300`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-teal-800 mb-1">
                    Alerta Atendidas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={topeMaximoCitas}
                    value={umbralAlertaAtendidas}
                    onChange={(e) =>
                      setUmbralAlertaAtendidas(Number(e.target.value))
                    }
                    className={`${INP} border-teal-300`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">
                    Tope Máximo Diario
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={topeMaximoCitas}
                    onChange={(e) =>
                      setTopeMaximoCitas(Number(e.target.value))
                    }
                    className={`${INP} font-bold`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={enviandoFormulario}
                className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold"
              >
                {enviandoFormulario
                  ? 'Guardando...'
                  : 'Guardar Parámetros en Supabase'}
              </button>
            </form>

            <div
              className={`${CARD} border-rose-200 flex flex-col justify-between space-y-3`}
            >
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  Mantenimiento Cloud
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Reinicia citas y pacientes nuevos en Supabase (conserva los 3
                  base, médicos, admins, configuración y auditoría).
                </p>
              </div>
              <button
                type="button"
                onClick={vaciarBaseDatosNubeACero}
                disabled={sincronizandoNube}
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Vaciar Citas y Pacientes Nuevos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
