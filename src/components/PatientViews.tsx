import React from 'react';
import {
  PROCEDIMIENTO_PERSONALIZADO_ID,
  calcularHoraLlegadaRecomendada,
  calcularValorConsulta,
  determinarTipoAtencionCita,
  esCitaVencidaSinLlegada,
  extraerDocumentoSolicitado,
  formatearDuracionVisibleCita,
  formatearFechaLegible,
  horaActualFormateada,
  limpiarEtiquetaApartado,
  obtenerAreasParaTipoAtencion,
  obtenerEspecialidadesParaAreaYTipo,
  obtenerEtiquetaConceptoPago,
  obtenerProcedimientoPorId,
  obtenerProcedimientosPorArea,
  obtenerRequisitosDocumentos,
  obtenerTarifaParticularEspecialidad,
  obtenerTarifaProcedimientoCatalogo,
  obtenerValorReferencialProcedimiento,
  ordenarCitasNuevasArribaYCerradasAbajo,
  parsearClasificacion,
  type AreaServicioId,
  type ArchivoFotoTemp,
  type CitaMedica,
  type EspecialidadId,
  type MedicoBase,
  type MedicoConOcupacion,
  type MensajeChat,
  type Paciente,
  type PasoChat,
  type RangoAfiliacionTipo,
  type RegimenTipo,
  type TarifasConfig,
  type TipoAfiliacionTipo,
  type TipoAtencionTipo,
} from '../data/saludVivaData';
import { CARD, CamposAfiliacion, INP, Ic, IconCamera } from './uiShared';

export interface AlertaDescansoChat {
  medicoDescansando: MedicoBase;
  fechaIso: string;
  diaNombre: string;
  colegasDisponibles: (MedicoBase & { citasEseDia: number })[];
  auxiliarDisponible: (MedicoBase & { citasEseDia: number }) | null;
}

export function AsistenteVirtualView({
  paciente,
  citasCount,
  tarifas,
  tarifasParticulares,
  tarifasProcedimientos,
  tarifasCatalogoProcedimientos,
  editandoPerfilPaciente,
  setEditandoPerfilPaciente,
  abrirEdicionPerfilPaciente,
  guardarEdicionPerfilPaciente,
  mensajePerfilPaciente,
  editPacCedula,
  setEditPacCedula,
  editPacPin,
  setEditPacPin,
  editPacNombres,
  setEditPacNombres,
  editPacApellidos,
  setEditPacApellidos,
  editPacTelefono,
  setEditPacTelefono,
  editPacCorreo,
  setEditPacCorreo,
  editPacEps,
  setEditPacEps,
  editPacRegimen,
  setEditPacRegimen,
  editPacTipoAfiliacion,
  setEditPacTipoAfiliacion,
  editPacRango,
  setEditPacRango,
  enviandoFormulario,
  iniciarAsistenteParaPaciente,
  irAMisCitas,
  mensajes,
  pasoChat,
  manejarSeleccionOpcionChat,
  chatEndRef,
  chatAreaServicio,
  setChatAreaServicio,
  chatEspId,
  setChatEspId,
  chatTipoAtencion,
  setChatTipoAtencion,
  chatProcId,
  setChatProcId,
  chatProcPersonalizadoNombre,
  setChatProcPersonalizadoNombre,
  chatProcPersonalizadoDetalle,
  setChatProcPersonalizadoDetalle,
  confirmarEspecialidadChat,
  fechaInputTemp,
  setFechaInputTemp,
  hoyIsoActual,
  maxFechaMesIso,
  confirmarFechaCalendarioPaciente,
  alertaDescansoChat,
  seleccionarSuplentePorDescanso,
  fotoOrdenData,
  fotoAutorizacionData,
  cargandoImagen,
  manejarArchivoFoto,
  motivoConsultaTemp,
  setMotivoConsultaTemp,
  confirmarEnvioFotosYAgendar,
  ultimaCitaAgendada,
  tiposAtencionCitas,
  obtenerConsultorioPorMedico,
  onVerQr,
  onVerFactura,
}: {
  paciente: Paciente;
  citasCount: number;
  tarifas: TarifasConfig;
  tarifasParticulares: Record<string, number>;
  tarifasProcedimientos: Record<string, number>;
  tarifasCatalogoProcedimientos: Record<string, number>;
  editandoPerfilPaciente: boolean;
  setEditandoPerfilPaciente: (v: boolean) => void;
  abrirEdicionPerfilPaciente: () => void;
  guardarEdicionPerfilPaciente: (e: React.FormEvent) => void;
  mensajePerfilPaciente: string;
  editPacCedula: string;
  setEditPacCedula: (v: string) => void;
  editPacPin: string;
  setEditPacPin: (v: string) => void;
  editPacNombres: string;
  setEditPacNombres: (v: string) => void;
  editPacApellidos: string;
  setEditPacApellidos: (v: string) => void;
  editPacTelefono: string;
  setEditPacTelefono: (v: string) => void;
  editPacCorreo: string;
  setEditPacCorreo: (v: string) => void;
  editPacEps: string;
  setEditPacEps: (v: string) => void;
  editPacRegimen: RegimenTipo;
  setEditPacRegimen: (v: RegimenTipo) => void;
  editPacTipoAfiliacion: TipoAfiliacionTipo;
  setEditPacTipoAfiliacion: (v: TipoAfiliacionTipo) => void;
  editPacRango: RangoAfiliacionTipo;
  setEditPacRango: (v: RangoAfiliacionTipo) => void;
  enviandoFormulario: boolean;
  iniciarAsistenteParaPaciente: (p: Paciente) => void;
  irAMisCitas: () => void;
  mensajes: MensajeChat[];
  pasoChat: PasoChat;
  manejarSeleccionOpcionChat: (valor: string, etiqueta: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  chatAreaServicio: AreaServicioId;
  setChatAreaServicio: (v: AreaServicioId) => void;
  chatEspId: EspecialidadId;
  setChatEspId: (v: EspecialidadId) => void;
  chatTipoAtencion: TipoAtencionTipo;
  setChatTipoAtencion: (v: TipoAtencionTipo) => void;
  chatProcId: string;
  setChatProcId: (v: string) => void;
  chatProcPersonalizadoNombre: string;
  setChatProcPersonalizadoNombre: (v: string) => void;
  chatProcPersonalizadoDetalle: string;
  setChatProcPersonalizadoDetalle: (v: string) => void;
  confirmarEspecialidadChat: () => void;
  fechaInputTemp: string;
  setFechaInputTemp: (v: string) => void;
  hoyIsoActual: string;
  maxFechaMesIso: string;
  confirmarFechaCalendarioPaciente: () => void;
  alertaDescansoChat: AlertaDescansoChat | null;
  seleccionarSuplentePorDescanso: (med: MedicoBase) => void;
  fotoOrdenData: ArchivoFotoTemp | null;
  fotoAutorizacionData: ArchivoFotoTemp | null;
  cargandoImagen: boolean;
  manejarArchivoFoto: (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'orden' | 'autorizacion'
  ) => void;
  motivoConsultaTemp: string;
  setMotivoConsultaTemp: (v: string) => void;
  confirmarEnvioFotosYAgendar: () => void;
  ultimaCitaAgendada: CitaMedica | null;
  tiposAtencionCitas: Record<string, TipoAtencionTipo>;
  obtenerConsultorioPorMedico: (id: string) => string;
  onVerQr: (cita: CitaMedica) => void;
  onVerFactura: (cita: CitaMedica) => void;
}) {
  const areasFiltradas = obtenerAreasParaTipoAtencion(chatTipoAtencion);
  const areaEfectiva = areasFiltradas.some((a) => a.id === chatAreaServicio)
    ? chatAreaServicio
    : areasFiltradas[0]?.id ?? chatAreaServicio;
  const espsChatArea = obtenerEspecialidadesParaAreaYTipo(
    areaEfectiva,
    chatTipoAtencion
  );
  const procsArea =
    chatTipoAtencion === 'procedimiento'
      ? obtenerProcedimientosPorArea(areaEfectiva)
      : [];
  const procIdEfectivo =
    chatTipoAtencion === 'procedimiento'
      ? chatProcId === PROCEDIMIENTO_PERSONALIZADO_ID ||
        procsArea.some((p) => p.id === chatProcId)
        ? chatProcId
        : procsArea[0]?.id ?? PROCEDIMIENTO_PERSONALIZADO_ID
      : '';

  const cambiarTipoAtencion = (nuevoTipo: TipoAtencionTipo) => {
    setChatTipoAtencion(nuevoTipo);
    const areasValidas = obtenerAreasParaTipoAtencion(nuevoTipo);
    const nuevaArea = areasValidas.some((a) => a.id === chatAreaServicio)
      ? chatAreaServicio
      : areasValidas[0]?.id ?? chatAreaServicio;
    if (nuevaArea !== chatAreaServicio) {
      setChatAreaServicio(nuevaArea);
    }
    const espsValidas = obtenerEspecialidadesParaAreaYTipo(
      nuevaArea,
      nuevoTipo
    );
    if (nuevoTipo === 'procedimiento') {
      const procsNuevaArea = obtenerProcedimientosPorArea(nuevaArea);
      const procSiguiente =
        chatProcId === PROCEDIMIENTO_PERSONALIZADO_ID
          ? PROCEDIMIENTO_PERSONALIZADO_ID
          : procsNuevaArea.find((p) => p.id === chatProcId)?.id ??
            procsNuevaArea[0]?.id ??
            PROCEDIMIENTO_PERSONALIZADO_ID;
      setChatProcId(procSiguiente);
      const procObj =
        procSiguiente !== PROCEDIMIENTO_PERSONALIZADO_ID
          ? obtenerProcedimientoPorId(procSiguiente)
          : undefined;
      const espProc = procObj
        ? procObj.especialidadId
        : espsValidas.some((e) => e.id === chatEspId)
        ? chatEspId
        : espsValidas[0]?.id;
      if (espProc && espProc !== chatEspId) {
        setChatEspId(espProc);
      }
      return;
    }
    const espFinal = espsValidas.some((e) => e.id === chatEspId)
      ? chatEspId
      : espsValidas[0]?.id;
    if (espFinal && espFinal !== chatEspId) {
      setChatEspId(espFinal);
    }
  };

  const { regimen } = parsearClasificacion(paciente.clasificacion);
  const esParticular = regimen === 'Particular';
  const valorProcReferencial =
    chatTipoAtencion === 'procedimiento'
      ? obtenerTarifaProcedimientoCatalogo(
          procIdEfectivo,
          tarifasCatalogoProcedimientos,
          tarifasParticulares,
          tarifas.particular,
          tarifasProcedimientos,
          tarifas.particularProcedimiento
        )
      : obtenerValorReferencialProcedimiento(
          chatEspId,
          tarifasParticulares,
          tarifas.particular,
          tarifasProcedimientos,
          tarifas.particularProcedimiento
        );
  const esProcPrecioPorDefinir =
    chatTipoAtencion === 'procedimiento' &&
    (procIdEfectivo === PROCEDIMIENTO_PERSONALIZADO_ID ||
      valorProcReferencial <= 0);
  const valorEstimadoEsp = esProcPrecioPorDefinir
    ? 0
    : calcularValorConsulta(
        paciente.clasificacion,
        tarifas,
        chatEspId,
        tarifasParticulares,
        chatTipoAtencion,
        tarifasProcedimientos,
        chatTipoAtencion === 'procedimiento' ? procIdEfectivo : undefined,
        tarifasCatalogoProcedimientos
      );
  const etiquetaConcepto = obtenerEtiquetaConceptoPago(
    paciente.clasificacion,
    chatTipoAtencion
  );
  const reqDocsActual = obtenerRequisitosDocumentos(
    chatEspId,
    paciente.clasificacion,
    chatTipoAtencion
  );

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4">
        <div className={`${CARD} border-sky-100 space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
              Ficha del Paciente
            </span>
            <button
              type="button"
              onClick={abrirEdicionPerfilPaciente}
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg"
            >
              <Ic n="edit" c="w-3.5 h-3.5" />
              <span>Editar mis datos</span>
            </button>
          </div>
          {mensajePerfilPaciente && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold ${
                mensajePerfilPaciente.startsWith('✓')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {mensajePerfilPaciente}
            </div>
          )}

          {editandoPerfilPaciente ? (
            <form
              onSubmit={guardarEdicionPerfilPaciente}
              className="space-y-2.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-0.5">Cédula</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editPacCedula}
                    onChange={(e) =>
                      setEditPacCedula(e.target.value.replace(/\D/g, ''))
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
                    value={editPacPin}
                    onChange={(e) =>
                      setEditPacPin(e.target.value.replace(/\D/g, ''))
                    }
                    className={`${INP} font-bold tracking-widest`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Nombres</label>
                  <input
                    type="text"
                    value={editPacNombres}
                    onChange={(e) => setEditPacNombres(e.target.value)}
                    className={INP}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={editPacApellidos}
                    onChange={(e) => setEditPacApellidos(e.target.value)}
                    className={INP}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Teléfono</label>
                  <input
                    type="tel"
                    value={editPacTelefono}
                    onChange={(e) => setEditPacTelefono(e.target.value)}
                    className={INP}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Correo</label>
                  <input
                    type="email"
                    value={editPacCorreo}
                    onChange={(e) => setEditPacCorreo(e.target.value)}
                    className={INP}
                  />
                </div>
              </div>
              <CamposAfiliacion
                eps={editPacEps}
                regimen={editPacRegimen}
                tipoAfiliacion={editPacTipoAfiliacion}
                rango={editPacRango}
                onChange={(v) => {
                  setEditPacEps(v.eps);
                  setEditPacRegimen(v.regimen);
                  setEditPacTipoAfiliacion(v.tipoAfiliacion);
                  setEditPacRango(v.rango);
                }}
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={enviandoFormulario}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  {enviandoFormulario ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoPerfilPaciente(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {paciente.nombres} {paciente.apellidos}
                </h2>
                <p className="text-xs text-slate-500">
                  CC: {paciente.cedula} · Tel: {paciente.telefono}
                </p>
                <p className="text-[11px] text-slate-400">{paciente.correo}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Aseguradora:</span>
                  <span className="font-bold">{paciente.eps}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Afiliación:</span>
                  <span className="font-semibold text-right">
                    {paciente.clasificacion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ley 1581:</span>
                  <span className="font-semibold text-emerald-700">
                    ✓ Aceptado
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500">{etiquetaConcepto}:</span>
                  <span
                    className={`font-extrabold ${
                      esProcPrecioPorDefinir
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {esProcPrecioPorDefinir
                      ? 'Por definir (N2/N3)'
                      : valorEstimadoEsp === 0
                      ? '$0 COP (Exento)'
                      : `$${valorEstimadoEsp.toLocaleString('es-CO')} COP`}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => iniciarAsistenteParaPaciente(paciente)}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold"
                >
                  Reiniciar conversación
                </button>
                <button
                  type="button"
                  onClick={irAMisCitas}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold"
                >
                  Ver mis citas y pases QR ({citasCount})
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-sky-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ic n="steth" c="w-5 h-5" />
            <h3 className="text-sm font-bold">
              Asistente Virtual IPS Salud Viva
            </h3>
          </div>
          <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
            En línea · {horaActualFormateada()}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60">
          {mensajes.map((msg, idx) => {
            const esUlt = msg.emisor === 'bot' && idx === mensajes.length - 1;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.emisor === 'usuario' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                    msg.emisor === 'usuario'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.texto}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.emisor === 'usuario'
                        ? 'text-sky-100 text-right'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.hora}
                  </span>
                </div>
                {esUlt && msg.opciones && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 w-full max-h-64 overflow-y-auto pr-1">
                    {msg.opciones.map((op) => (
                      <button
                        key={op.valor}
                        type="button"
                        disabled={op.deshabilitado}
                        onClick={() =>
                          manejarSeleccionOpcionChat(op.valor, op.etiqueta)
                        }
                        className={`text-left p-3 rounded-xl border shadow-xs transition ${
                          op.deshabilitado
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white hover:bg-sky-50 border-sky-200'
                        }`}
                      >
                        <span
                          className={`block text-xs font-bold ${
                            op.deshabilitado
                              ? 'text-slate-500 line-through'
                              : 'text-sky-900'
                          }`}
                        >
                          {op.etiqueta}
                        </span>
                        {op.subtexto && (
                          <span
                            className={`block text-[11px] mt-0.5 ${
                              op.deshabilitado
                                ? 'text-rose-700 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            {op.subtexto}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {pasoChat === 'seleccion_area' ? (
          <div className="p-4 bg-sky-50 border-t-2 border-sky-300 space-y-3">
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-sky-950">
                1. Tipo de Atención (Define Cuota Moderadora vs. Copago y filtra áreas)
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cambiarTipoAtencion('consulta')}
                  className={`text-left px-3 py-2 rounded-xl border transition ${
                    chatTipoAtencion === 'consulta'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100/60'
                  }`}
                >
                  <span className="block font-bold">
                    Consulta Médica / Valoración
                  </span>
                  <span
                    className={`block text-[10px] ${
                      chatTipoAtencion === 'consulta'
                        ? 'text-sky-100'
                        : 'text-slate-500'
                    }`}
                  >
                    Contributivo: Cuota Moderadora · Subsidiado: $0
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => cambiarTipoAtencion('procedimiento')}
                  className={`text-left px-3 py-2 rounded-xl border transition ${
                    chatTipoAtencion === 'procedimiento'
                      ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                      : 'bg-white text-slate-700 border-sky-200 hover:bg-teal-50/70'
                  }`}
                >
                  <span className="block font-bold">
                    Procedimiento / Terapia / Tratamiento
                  </span>
                  <span
                    className={`block text-[10px] ${
                      chatTipoAtencion === 'procedimiento'
                        ? 'text-teal-100'
                        : 'text-slate-500'
                    }`}
                  >
                    Beneficiario: Copago % (Cotizante PBS exento)
                  </span>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-sky-950 mb-1">
                  2. Área / Servicio ({areasFiltradas.length})
                </label>
                <select
                  value={areaEfectiva}
                  onChange={(e) => {
                    const a = e.target.value as AreaServicioId;
                    setChatAreaServicio(a);
                    const esps = obtenerEspecialidadesParaAreaYTipo(
                      a,
                      chatTipoAtencion
                    );
                    if (chatTipoAtencion === 'procedimiento') {
                      const procs = obtenerProcedimientosPorArea(a);
                      const primero = procs[0];
                      if (primero) {
                        setChatProcId(primero.id);
                        setChatEspId(primero.especialidadId);
                      } else {
                        setChatProcId(PROCEDIMIENTO_PERSONALIZADO_ID);
                        if (esps[0]) setChatEspId(esps[0].id);
                      }
                    } else if (esps[0]) {
                      setChatEspId(esps[0].id);
                    }
                  }}
                  className={`${INP} border-sky-300 font-semibold`}
                >
                  {areasFiltradas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {chatTipoAtencion === 'procedimiento' &&
                      a.id === 'especializada'
                        ? '2. Procedimientos Especializados y Quirúrgicos'
                        : a.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {chatTipoAtencion === 'procedimiento' ? (
                  <>
                    <label className="block font-bold text-sky-950 mb-1">
                      3. Procedimiento ({procsArea.length} + personalizado)
                    </label>
                    <select
                      value={procIdEfectivo}
                      onChange={(e) => {
                        const nuevoProcId = e.target.value;
                        setChatProcId(nuevoProcId);
                        if (nuevoProcId !== PROCEDIMIENTO_PERSONALIZADO_ID) {
                          const pObj = obtenerProcedimientoPorId(nuevoProcId);
                          if (pObj) setChatEspId(pObj.especialidadId);
                        } else if (espsChatArea[0]) {
                          setChatEspId(espsChatArea[0].id);
                        }
                      }}
                      className={`${INP} border-teal-400 font-semibold`}
                    >
                      {espsChatArea.map((es) => {
                        const procsEsp = procsArea.filter(
                          (p) => p.especialidadId === es.id
                        );
                        if (procsEsp.length === 0) return null;
                        return (
                          <optgroup key={es.id} label={es.nombre}>
                            {procsEsp.map((p) => {
                              const tarProc = obtenerTarifaProcedimientoCatalogo(
                                p.id,
                                tarifasCatalogoProcedimientos,
                                tarifasParticulares,
                                tarifas.particular,
                                tarifasProcedimientos,
                                tarifas.particularProcedimiento
                              );
                              const esVar = tarProc <= 0;
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.nombre}
                                  {esVar
                                    ? ' · Valor por definir (N2/N3)'
                                    : esParticular
                                    ? ` · $${tarProc.toLocaleString('es-CO')}`
                                    : ''}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      })}
                      <optgroup label="Casos Complejos o Especiales">
                        <option value={PROCEDIMIENTO_PERSONALIZADO_ID}>
                          Otro / Procedimiento Personalizado (Valor por definir N2/N3)
                        </option>
                      </optgroup>
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block font-bold text-sky-950 mb-1">
                      3. Especialidad ({espsChatArea.length})
                    </label>
                    <select
                      value={chatEspId}
                      onChange={(e) => setChatEspId(e.target.value)}
                      className={`${INP} border-sky-300 font-semibold`}
                    >
                      {espsChatArea.map((es) => {
                        const tar = obtenerTarifaParticularEspecialidad(
                          es.id,
                          tarifasParticulares,
                          tarifas.particular
                        );
                        return (
                          <option key={es.id} value={es.id}>
                            {es.nombre} · ({es.duracionMin} min)
                            {esParticular
                              ? ` · $${tar.toLocaleString('es-CO')}`
                              : ''}
                          </option>
                        );
                      })}
                    </select>
                  </>
                )}
              </div>
            </div>

            {chatTipoAtencion === 'procedimiento' &&
              procIdEfectivo === PROCEDIMIENTO_PERSONALIZADO_ID && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
                  <p className="font-bold text-amber-950">
                    Procedimiento Personalizado o Especial (Valor por definir en Autorizaciones N2/N3)
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-0.5">
                        Especialidad médica encargada *
                      </label>
                      <select
                        value={chatEspId}
                        onChange={(e) => setChatEspId(e.target.value)}
                        className={`${INP} bg-white border-amber-300 font-semibold`}
                      >
                        {espsChatArea.map((es) => (
                          <option key={es.id} value={es.id}>
                            {es.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-0.5">
                        Nombre del procedimiento *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Resección especializada, biopsia compleja..."
                        value={chatProcPersonalizadoNombre}
                        onChange={(e) =>
                          setChatProcPersonalizadoNombre(e.target.value)
                        }
                        className={`${INP} bg-white border-amber-300 font-semibold`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-0.5">
                      Detalle clínico u observación (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Según orden médica adjunta, requiere valoración previa..."
                      value={chatProcPersonalizadoDetalle}
                      onChange={(e) =>
                        setChatProcPersonalizadoDetalle(e.target.value)
                      }
                      className={`${INP} bg-white border-amber-200`}
                    />
                  </div>
                </div>
              )}

            <div className="rounded-xl bg-white border border-sky-200 p-2.5 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-sky-950">
                <span>
                  <strong>{etiquetaConcepto}:</strong>
                  {chatTipoAtencion === 'procedimiento'
                    ? esProcPrecioPorDefinir
                      ? ' costo variable según complejidad médica'
                      : ` valor base $${valorProcReferencial.toLocaleString(
                          'es-CO'
                        )}`
                    : ' valor previo a la consulta'}
                </span>
                <span
                  className={`font-extrabold shrink-0 ml-2 ${
                    esProcPrecioPorDefinir
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {esProcPrecioPorDefinir
                    ? 'Valor por definir (Autorizaciones N2/N3)'
                    : valorEstimadoEsp === 0
                    ? '$0 COP (Exento)'
                    : `$${valorEstimadoEsp.toLocaleString('es-CO')} COP`}
                </span>
              </div>
              <p
                className={`text-[10px] font-semibold ${
                  !reqDocsActual.requiereOrden &&
                  !reqDocsActual.requiereAutorizacion
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                {!reqDocsActual.requiereOrden &&
                !reqDocsActual.requiereAutorizacion
                  ? `✓ ${reqDocsActual.motivoExencion}`
                  : `📄 ${reqDocsActual.motivoExencion}`}
              </p>
              {chatTipoAtencion === 'procedimiento' && (
                <p className="text-[10px] font-semibold text-teal-800">
                  {esProcPrecioPorDefinir
                    ? '⏱️ Tiempo y valor asignados por la IPS: Autorizaciones (Nivel 2 o 3) definirá la duración exacta y el costo tras revisar tu Orden Médica y te lo notificará por correo.'
                    : '⏱️ Tiempo asignado por la IPS: Autorizaciones (Nivel 2 o 3) definirá y confirmará la duración exacta según tu Orden Médica y te lo notificará por correo.'}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={
                chatTipoAtencion === 'procedimiento' &&
                procIdEfectivo === PROCEDIMIENTO_PERSONALIZADO_ID &&
                chatProcPersonalizadoNombre.trim().length < 3
              }
              onClick={confirmarEspecialidadChat}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold"
            >
              Buscar Especialistas Disponibles
            </button>
          </div>
        ) : pasoChat === 'seleccion_fecha' ? (
          <div className="p-4 bg-sky-50 border-t-2 border-sky-300 space-y-3">
            {alertaDescansoChat && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs text-amber-950">
                <p className="font-bold">
                  ⚠️ {alertaDescansoChat.medicoDescansando.nombre} descansa los{' '}
                  {alertaDescansoChat.diaNombre} (
                  {formatearFechaLegible(alertaDescansoChat.fechaIso)}).
                </p>
                <p className="text-[11px]">
                  Sugerencia rápida: atiende ese día con un colega o con nuestro
                  Auxiliar Médico de Turno, o elige otra fecha abajo:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {alertaDescansoChat.colegasDisponibles.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => seleccionarSuplentePorDescanso(col)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 font-bold text-amber-900 hover:bg-amber-100"
                    >
                      {col.nombre} ({col.consultorio})
                    </button>
                  ))}
                  {alertaDescansoChat.auxiliarDisponible && (
                    <button
                      type="button"
                      onClick={() =>
                        seleccionarSuplentePorDescanso(
                          alertaDescansoChat.auxiliarDisponible!
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold"
                    >
                      ✓ {alertaDescansoChat.auxiliarDisponible.nombre}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-900 flex items-center gap-1.5">
                <Ic n="calendar" c="w-4 h-4" />
                <span>Seleccionar Fecha</span>
              </span>
              <span className="font-semibold text-sky-700 capitalize">
                {formatearFechaLegible(fechaInputTemp)}
              </span>
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                min={hoyIsoActual}
                max={maxFechaMesIso}
                value={fechaInputTemp}
                onChange={(e) => setFechaInputTemp(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-sky-300 text-sm font-bold"
              />
              <button
                type="button"
                onClick={confirmarFechaCalendarioPaciente}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
              >
                Consultar Horarios
              </button>
            </div>
          </div>
        ) : pasoChat === 'solicitud_fotos' ? (
          <div className="p-4 bg-emerald-50 border-t-2 border-emerald-300 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <IconCamera className="w-4 h-4" />
                <span>
                  {!reqDocsActual.requiereOrden &&
                  !reqDocsActual.requiereAutorizacion
                    ? 'Confirmación Directa (Sin Orden ni Autorización)'
                    : 'Adjuntar Soportes (Storage)'}
                </span>
              </span>
              {cargandoImagen && (
                <span className="font-bold text-sky-700">Procesando...</span>
              )}
            </div>

            {!reqDocsActual.requiereOrden &&
            !reqDocsActual.requiereAutorizacion ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">✓ No necesitas subir Orden Médica ni Autorización EPS obligatoriamente</p>
                  <p className="text-[11px] text-emerald-800">
                    {reqDocsActual.motivoExencion}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 space-y-2 text-xs">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Opcional: si ya cuentas con Orden Médica o Autorización EPS, puedes adjuntarla ahora (no es obligatorio):
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      {
                        titulo: 'Orden Médica (Opcional)',
                        data: fotoOrdenData,
                        tipo: 'orden' as const,
                      },
                      {
                        titulo: 'Autorización EPS (Opcional)',
                        data: fotoAutorizacionData,
                        tipo: 'autorizacion' as const,
                      },
                    ].map((f) => (
                      <div
                        key={f.tipo}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-[11px]">{f.titulo}</p>
                          <span
                            className={`text-[10px] block truncate max-w-[140px] ${
                              f.data
                                ? 'text-emerald-700 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {f.data ? `✓ ${f.data.nombre}` : 'Opcional'}
                          </span>
                        </div>
                        <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] shrink-0">
                          {f.data ? 'Cambiar' : 'Adjuntar (Foto/PDF)'}
                          <input
                            type="file"
                            accept="image/*,application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => manejarArchivoFoto(e, f.tipo)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-emerald-950 bg-white border border-emerald-200 rounded-xl px-3 py-2">
                  📄 {reqDocsActual.motivoExencion}
                </p>
                <div
                  className={`grid ${
                    reqDocsActual.requiereOrden &&
                    reqDocsActual.requiereAutorizacion
                      ? 'sm:grid-cols-2'
                      : ''
                  } gap-3 text-xs`}
                >
                  {[
                    ...(reqDocsActual.requiereOrden
                      ? [
                          {
                            titulo: reqDocsActual.permiteAlMenosUno
                              ? '1. Orden Médica (o Autorización)'
                              : '1. Orden Médica *',
                            data: fotoOrdenData,
                            tipo: 'orden' as const,
                          },
                        ]
                      : []),
                    ...(reqDocsActual.requiereAutorizacion
                      ? [
                          {
                            titulo: reqDocsActual.permiteAlMenosUno
                              ? '2. Autorización EPS (o Orden)'
                              : '2. Autorización EPS *',
                            data: fotoAutorizacionData,
                            tipo: 'autorizacion' as const,
                          },
                        ]
                      : []),
                  ].map((f) => (
                    <div
                      key={f.tipo}
                      className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold">{f.titulo}</p>
                        <span
                          className={`text-[11px] block truncate max-w-[150px] ${
                            f.data
                              ? 'text-emerald-700 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {f.data ? `✓ ${f.data.nombre}` : 'Sin archivo'}
                        </span>
                      </div>
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold shrink-0">
                        {f.data ? 'Cambiar' : 'Subir Foto / PDF'}
                        <input
                          type="file"
                          accept="image/*,application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) => manejarArchivoFoto(e, f.tipo)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="font-bold text-slate-900">
                  🩺 Motivo de consulta / Describe tus síntomas (opcional, lo verá tu médico)
                </label>
                <span className="text-[10px] text-slate-400">
                  {motivoConsultaTemp.length}/300
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={300}
                placeholder="Ej: Dolor de garganta hace 3 días, fiebre leve, control de tensión arterial o lectura de exámenes..."
                value={motivoConsultaTemp}
                onChange={(e) => setMotivoConsultaTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              disabled={
                (reqDocsActual.permiteAlMenosUno
                  ? !fotoOrdenData && !fotoAutorizacionData
                  : (reqDocsActual.requiereOrden && !fotoOrdenData) ||
                    (reqDocsActual.requiereAutorizacion &&
                      !fotoAutorizacionData)) ||
                enviandoFormulario ||
                cargandoImagen
              }
              onClick={confirmarEnvioFotosYAgendar}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
            >
              {enviandoFormulario
                ? 'Agendando y enviando factura al correo...'
                : 'Confirmar, Agendar y Enviar Factura por Correo'}
            </button>
          </div>
        ) : pasoChat === 'completado' && ultimaCitaAgendada ? (
          <div className="p-4 bg-white border-t-2 border-emerald-300 space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-extrabold text-emerald-950">
                  Pre-Factura / Liquidación · {ultimaCitaAgendada.id}
                </p>
                <p className="text-[11px] text-emerald-800">
                  {ultimaCitaAgendada.procedimientoNombre && (
                    <span className="block font-bold text-teal-900">
                      Procedimiento: {ultimaCitaAgendada.procedimientoNombre}
                    </span>
                  )}
                  {obtenerEtiquetaConceptoPago(
                    ultimaCitaAgendada.pacienteClasificacion,
                    determinarTipoAtencionCita(
                      ultimaCitaAgendada,
                      tiposAtencionCitas
                    )
                  )}{' '}
                  · {ultimaCitaAgendada.especialidadNombre} ·{' '}
                  {obtenerConsultorioPorMedico(ultimaCitaAgendada.medicoId)}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-emerald-700 font-semibold">
                  {ultimaCitaAgendada.costoPendiente
                    ? 'Valor por definir'
                    : ultimaCitaAgendada.valorCopago === 0
                    ? 'Estado de pago'
                    : 'Valor a llevar / pagar antes de cita'}
                </span>
                <span
                  className={`text-base font-extrabold ${
                    ultimaCitaAgendada.costoPendiente
                      ? 'text-amber-700'
                      : 'text-emerald-800'
                  }`}
                >
                  {ultimaCitaAgendada.costoPendiente
                    ? 'Por definir (N2/N3)'
                    : ultimaCitaAgendada.valorCopago === 0
                    ? '$0 COP (Exento)'
                    : `$${ultimaCitaAgendada.valorCopago.toLocaleString(
                        'es-CO'
                      )} COP`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <span className="font-semibold text-emerald-700">
                ✓ Cita guardada y comprobante enviado a {paciente.correo}.
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerFactura(ultimaCitaAgendada)}
                  className="px-3.5 py-2 rounded-xl bg-teal-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Ic n="receipt" c="w-4 h-4" />
                  <span>Ver / Imprimir Factura</span>
                </button>
                <button
                  type="button"
                  onClick={() => onVerQr(ultimaCitaAgendada)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5"
                >
                  <Ic n="qr" c="w-4 h-4" />
                  <span>Ver Pase QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => iniciarAsistenteParaPaciente(paciente)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Agendar otra
                </button>
                <button
                  type="button"
                  onClick={irAMisCitas}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Ir a Mis Citas
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MisCitasView({
  citasDelPaciente,
  recibosCitas,
  tiposAtencionCitas,
  apartadosDocs,
  ahoraMs,
  soportesPendientesTemp,
  manejarArchivoApartado,
  confirmarSubidaApartado,
  subiendoApartadoId,
  obtenerConsultorioPorMedico,
  califEsperaTemp,
  setCalifEsperaTemp,
  califTratoTemp,
  setCalifTratoTemp,
  califClaridadTemp,
  setCalifClaridadTemp,
  comentarioSatTemp,
  setComentarioSatTemp,
  guardarEncuestaSatisfaccionPaciente,
  cancelarCitaPaciente,
  onReprogramarCita,
  onIrAsistente,
  onVerQr,
  onVerFactura,
  onVerImagen,
}: {
  citasDelPaciente: CitaMedica[];
  recibosCitas: Record<string, string>;
  tiposAtencionCitas: Record<string, TipoAtencionTipo>;
  apartadosDocs: Record<string, number>;
  ahoraMs: number;
  soportesPendientesTemp: Record<
    string,
    { orden?: ArchivoFotoTemp; autorizacion?: ArchivoFotoTemp }
  >;
  manejarArchivoApartado: (
    citaId: string,
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'orden' | 'autorizacion'
  ) => void;
  confirmarSubidaApartado: (cita: CitaMedica) => void;
  subiendoApartadoId: string | null;
  obtenerConsultorioPorMedico: (id: string) => string;
  califEsperaTemp: Record<string, number>;
  setCalifEsperaTemp: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  califTratoTemp: Record<string, number>;
  setCalifTratoTemp: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  califClaridadTemp: Record<string, number>;
  setCalifClaridadTemp: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  comentarioSatTemp: Record<string, string>;
  setComentarioSatTemp: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  guardarEncuestaSatisfaccionPaciente: (citaId: string) => void;
  cancelarCitaPaciente: (cita: CitaMedica) => void;
  onReprogramarCita: (cita: CitaMedica) => void;
  onIrAsistente: () => void;
  onVerQr: (cita: CitaMedica) => void;
  onVerFactura: (cita: CitaMedica) => void;
  onVerImagen: (titulo: string, url: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Mis Citas Agendadas y Pases QR
          </h2>
          <p className="text-xs text-slate-500">
            Orden cronológico en vivo. Preséntate 15 minutos antes con tu Pase QR.
          </p>
        </div>
        <button
          type="button"
          onClick={onIrAsistente}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          + Nueva Cita
        </button>
      </div>
      {citasDelPaciente.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border text-center space-y-3">
          <p className="text-slate-500 text-sm">No tienes citas agendadas.</p>
          <button
            type="button"
            onClick={onIrAsistente}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
          >
            Agendar mi primera cita
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {ordenarCitasNuevasArribaYCerradasAbajo(citasDelPaciente).map(
            (cita) => {
            const vE = califEsperaTemp[cita.id] ?? 5;
            const vT = califTratoTemp[cita.id] ?? 5;
            const vC = califClaridadTemp[cita.id] ?? 5;
            const promVivo = ((vE + vT + vC) / 3).toFixed(1);
            const reciboNum = recibosCitas[cita.id] || cita.reciboNumero;
            const tipoAtencion = determinarTipoAtencionCita(
              cita,
              tiposAtencionCitas
            );
            const concepto = obtenerEtiquetaConceptoPago(
              cita.pacienteClasificacion,
              tipoAtencion
            );
            const esReenvioObservado =
              (cita.estadoCita === 'Pre-admitida' ||
                cita.estadoCita === 'Reprogramada') &&
              cita.estadoDocumentos === 'Observados';
            const tempFiles = soportesPendientesTemp[cita.id] || {};
            const docSolicitado = esReenvioObservado
              ? extraerDocumentoSolicitado(cita.observacionAdmin) || 'ambos'
              : null;
            const mostrarOrdenUpload =
              docSolicitado === 'orden' || docSolicitado === 'ambos';
            const mostrarAutUpload =
              docSolicitado === 'autorizacion' || docSolicitado === 'ambos';
            const listoSubirApartado =
              docSolicitado === 'orden'
                ? Boolean(tempFiles.orden)
                : docSolicitado === 'autorizacion'
                ? Boolean(tempFiles.autorizacion)
                : Boolean(tempFiles.orden || tempFiles.autorizacion) &&
                  Boolean(tempFiles.orden || cita.fotoOrdenUrl) &&
                  Boolean(tempFiles.autorizacion || cita.fotoAutorizacionUrl);
            const notaLimpia = limpiarEtiquetaApartado(cita.observacionAdmin);

            const criterios = [
              {
                label: '1. Tiempo de espera',
                val: vE,
                set: setCalifEsperaTemp,
              },
              {
                label: '2. Trato del personal',
                val: vT,
                set: setCalifTratoTemp,
              },
              {
                label: '3. Claridad médica',
                val: vC,
                set: setCalifClaridadTemp,
              },
            ];
            return (
              <div key={cita.id} className={`${CARD} space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {cita.id}
                      </span>
                      {(cita.reprogramacionesCount || 0) > 0 && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Reprogramada ({cita.reprogramacionesCount}x)
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">
                      {cita.especialidadNombre} ({formatearDuracionVisibleCita(cita, tiposAtencionCitas)})
                    </h3>
                    {cita.procedimientoNombre && (
                      <p className="text-xs font-bold text-teal-800 mt-0.5">
                        Procedimiento: {cita.procedimientoNombre}
                        {cita.procedimientoPersonalizado ? ' (Personalizado)' : ''}
                      </p>
                    )}
                    {cita.procedimientoDetalle && (
                      <p className="text-[11px] text-slate-500">
                        Detalle: {cita.procedimientoDetalle}
                      </p>
                    )}
                    <p className="text-xs text-emerald-700 font-semibold">
                      {cita.medicoNombre} ·{' '}
                      {obtenerConsultorioPorMedico(cita.medicoId)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span
                      className={`block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        cita.estadoCita === 'Atendida'
                          ? 'bg-teal-100 text-teal-900'
                          : cita.estadoCita === 'Admitida en Sala'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cita.estadoCita === 'Cancelada'
                          ? 'bg-rose-100 text-rose-800'
                          : cita.estadoCita === 'Reprogramada'
                          ? 'bg-amber-100 text-amber-900'
                          : cita.estadoCita === 'No asistió'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {cita.estadoCita}
                    </span>
                    <span
                      className={`block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cita.estadoDocumentos === 'Aprobados'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cita.estadoDocumentos === 'Observados'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Docs: {cita.estadoDocumentos}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p>
                    <strong>Fecha:</strong> {formatearFechaLegible(cita.fecha)}
                  </p>
                  <p>
                    <strong>Hora Cita:</strong> {cita.hora} ·{' '}
                    <strong>Llegada:</strong>{' '}
                    {calcularHoraLlegadaRecomendada(cita.hora)}
                  </p>
                  <p>
                    <strong>{concepto}:</strong>{' '}
                    {cita.costoPendiente ? (
                      <span className="font-bold text-amber-700">
                        Valor por definir (Autorizaciones N2/N3)
                      </span>
                    ) : cita.valorCopago === 0 ? (
                      '$0 COP (Exento)'
                    ) : (
                      `$${cita.valorCopago.toLocaleString('es-CO')} COP`
                    )}
                    {cita.metodoPago ? ` (${cita.metodoPago})` : ''}
                    {reciboNum ? ` · Recibo ${reciboNum}` : ''}
                  </p>
                  {cita.motivoConsulta && (
                    <p>
                      <strong>Motivo / Síntomas:</strong> {cita.motivoConsulta}
                    </p>
                  )}
                </div>

                {esReenvioObservado && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-amber-950">
                        {docSolicitado === 'orden'
                          ? '⚠️ Autorizaciones solicita: Orden Médica'
                          : docSolicitado === 'autorizacion'
                          ? '⚠️ Autorizaciones solicita: Autorización EPS'
                          : '⚠️ Autorizaciones solicita: Orden Médica y Autorización EPS'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900">
                      {docSolicitado === 'orden'
                        ? 'Para esta cita el personal indicó que debes cargar o reenviar una foto legible de tu Orden Médica.'
                        : docSolicitado === 'autorizacion'
                        ? 'Para esta cita el personal indicó que debes cargar o reenviar una foto legible de tu Autorización EPS.'
                        : 'Autorizaciones solicitó cargar o volver a enviar fotos legibles de tu Orden Médica y Autorización EPS para continuar con tu cita.'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {mostrarOrdenUpload && (
                        <label className="cursor-pointer p-2 rounded-lg bg-white border border-amber-300 flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-amber-950">
                            {tempFiles.orden
                              ? `✓ ${tempFiles.orden.nombre}`
                              : '1. Nueva Orden Médica'}
                          </span>
                          <span className="px-2 py-1 rounded bg-sky-600 text-white font-bold text-[10px] shrink-0">
                            {tempFiles.orden ? 'Cambiar' : 'Reemplazar'}
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              manejarArchivoApartado(cita.id, e, 'orden')
                            }
                          />
                        </label>
                      )}
                      {mostrarAutUpload && (
                        <label className="cursor-pointer p-2 rounded-lg bg-white border border-amber-300 flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-amber-950">
                            {tempFiles.autorizacion
                              ? `✓ ${tempFiles.autorizacion.nombre}`
                              : '2. Nueva Autorización EPS'}
                          </span>
                          <span className="px-2 py-1 rounded bg-sky-600 text-white font-bold text-[10px] shrink-0">
                            {tempFiles.autorizacion ? 'Cambiar' : 'Reemplazar'}
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              manejarArchivoApartado(cita.id, e, 'autorizacion')
                            }
                          />
                        </label>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={
                        !listoSubirApartado || subiendoApartadoId === cita.id
                      }
                      onClick={() => confirmarSubidaApartado(cita)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
                    >
                      {subiendoApartadoId === cita.id
                        ? 'Subiendo a Storage...'
                        : '✓ Reenviar Documentos Corregidos'}
                    </button>
                  </div>
                )}

                {(notaLimpia || cita.motivoReprogramacion) && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong>Nota / Motivo:</strong>{' '}
                    {cita.motivoReprogramacion || notaLimpia}
                  </div>
                )}

                {cita.estadoCita === 'Atendida' && (
                  <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2.5">
                    {typeof cita.calificacionSatisfaccion === 'number' ? (
                      <div className="space-y-1.5">
                        <span className="font-bold text-teal-950 block">
                          ✓ Calificación: ★ {cita.calificacionSatisfaccion} / 5.0
                        </span>
                        {typeof cita.calificacionEspera === 'number' && (
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-white border border-teal-200">
                              Espera: <strong>{cita.calificacionEspera}/5</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white border border-teal-200">
                              Trato: <strong>{cita.calificacionTrato}/5</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white border border-teal-200">
                              Claridad:{' '}
                              <strong>{cita.calificacionClaridad}/5</strong>
                            </span>
                          </div>
                        )}
                        {cita.comentarioSatisfaccion && (
                          <p className="text-[11px] text-slate-600 italic">
                            "{cita.comentarioSatisfaccion}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-teal-950">
                            Encuesta rápida (3 criterios):
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold">
                            Prom: ★ {promVivo}
                          </span>
                        </div>
                        <div className="space-y-2 bg-white p-2.5 rounded-xl border border-teal-100">
                          {criterios.map((cr) => (
                            <div
                              key={cr.label}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="font-semibold text-slate-700">
                                {cr.label}
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() =>
                                      cr.set((p) => ({
                                        ...p,
                                        [cita.id]: n,
                                      }))
                                    }
                                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                      cr.val >= n
                                        ? 'bg-amber-400 border-amber-500 text-slate-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Comentario opcional..."
                            value={comentarioSatTemp[cita.id] || ''}
                            onChange={(e) =>
                              setComentarioSatTemp((p) => ({
                                ...p,
                                [cita.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              guardarEncuestaSatisfaccionPaciente(cita.id)
                            }
                            className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-bold"
                          >
                            Enviar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {cita.estadoCita !== 'Cancelada' &&
                      cita.estadoCita !== 'No asistió' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onVerQr(cita)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
                          >
                            <Ic n="qr" c="w-3.5 h-3.5" />
                            <span>Pase QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onVerFactura(cita)}
                            className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1"
                          >
                            <Ic n="receipt" c="w-3.5 h-3.5" />
                            <span>Factura / Recibo</span>
                          </button>
                        </>
                      )}
                    {cita.fotoOrdenUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onVerImagen(
                            `Orden · ${cita.id}`,
                            cita.fotoOrdenUrl || ''
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold"
                      >
                        Ver Orden
                      </button>
                    )}
                    {cita.fotoAutorizacionUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onVerImagen(
                            `Autorización · ${cita.id}`,
                            cita.fotoAutorizacionUrl || ''
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold"
                      >
                        Ver Autorización
                      </button>
                    )}
                  </div>
                  {(cita.estadoCita === 'Pre-admitida' ||
                    cita.estadoCita === 'Reprogramada') &&
                    !esCitaVencidaSinLlegada(cita) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onReprogramarCita(cita)}
                          className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Ic n="calendar" c="w-3.5 h-3.5" />
                          <span>Reprogramar Cita</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelarCitaPaciente(cita)}
                          className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold"
                        >
                          Cancelar Cita
                        </button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
