import React, { useState } from 'react';
import {
  ESPECIALIDADES,
  esArchivoPdf,
  esEstadoCitaCerrado,
  formatearDuracionVisibleCita,
  formatearFechaLegible,
  limpiarEtiquetaApartado,
  obtenerPinEfectivoMedico,
  ordenarCitasCronologicamente,
  type CitaMedica,
  type MedicoBase,
  type TipoAtencionTipo,
} from '../data/saludVivaData';
import { CARD, INP, Ic, IconCamera } from './uiShared';

export function MedicoPanelView({
  medicoActual,
  citasDelMedico,
  hoyIsoActual,
  tiposAtencionCitas,
  obtenerConsultorioPorMedico,
  onVerImagen,
  notaClinicaTemp,
  setNotaClinicaTemp,
  guardandoCitaMedicoId,
  guardarNotaClinicaMedico,
  finalizarConsultaMedico,
  editandoPerfilMedico,
  setEditandoPerfilMedico,
  guardandoPerfilMedico,
  guardarPerfilMedico,
  descansoSemanalNombre,
}: {
  medicoActual: MedicoBase;
  citasDelMedico: CitaMedica[];
  hoyIsoActual: string;
  tiposAtencionCitas: Record<string, TipoAtencionTipo>;
  obtenerConsultorioPorMedico: (id: string) => string;
  onVerImagen: (titulo: string, url: string) => void;
  notaClinicaTemp: Record<string, string>;
  setNotaClinicaTemp: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  guardandoCitaMedicoId: string | null;
  guardarNotaClinicaMedico: (cita: CitaMedica, nota: string) => Promise<void>;
  finalizarConsultaMedico: (cita: CitaMedica, nota: string) => Promise<void>;
  editandoPerfilMedico: boolean;
  setEditandoPerfilMedico: (b: boolean) => void;
  guardandoPerfilMedico: boolean;
  guardarPerfilMedico: (datos: {
    nombre: string;
    consultorio: string;
    telefono: string;
    correo: string;
    pin: string;
    confirmarPin: string;
  }) => Promise<{ ok: boolean; error?: string; warning?: string }>;
  descansoSemanalNombre?: string;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<
    'todas' | 'hoy' | 'en_sala' | 'pendientes' | 'atendidas'
  >('todas');

  const [formNombre, setFormNombre] = useState(medicoActual.nombre);
  const [formConsultorio, setFormConsultorio] = useState(
    medicoActual.consultorio
  );
  const [formTelefono, setFormTelefono] = useState(medicoActual.telefono || '');
  const [formCorreo, setFormCorreo] = useState(medicoActual.correo || '');
  const [formPin, setFormPin] = useState(() =>
    obtenerPinEfectivoMedico(medicoActual)
  );
  const [formConfirmarPin, setFormConfirmarPin] = useState(() =>
    obtenerPinEfectivoMedico(medicoActual)
  );
  const [mostrarPin, setMostrarPin] = useState(false);
  const [feedbackPerfil, setFeedbackPerfil] = useState<{
    tipo: 'ok' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const abrirEditorPerfil = () => {
    const pinActual = obtenerPinEfectivoMedico(medicoActual);
    setFormNombre(medicoActual.nombre);
    setFormConsultorio(medicoActual.consultorio);
    setFormTelefono(medicoActual.telefono || '');
    setFormCorreo(medicoActual.correo || '');
    setFormPin(pinActual);
    setFormConfirmarPin(pinActual);
    setMostrarPin(false);
    setFeedbackPerfil(null);
    setEditandoPerfilMedico(true);
  };

  const manejarGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackPerfil(null);
    const res = await guardarPerfilMedico({
      nombre: formNombre,
      consultorio: formConsultorio,
      telefono: formTelefono,
      correo: formCorreo,
      pin: formPin,
      confirmarPin: formConfirmarPin,
    });
    if (res.ok) {
      setFeedbackPerfil({
        tipo: res.warning ? 'info' : 'ok',
        texto:
          res.warning || '✓ Datos profesionales y PIN guardados correctamente.',
      });
      setEditandoPerfilMedico(false);
    } else {
      setFeedbackPerfil({
        tipo: 'error',
        texto: res.error || 'No se pudieron actualizar tus datos.',
      });
    }
  };

  const especialidadNombre =
    ESPECIALIDADES.find((e) => e.id === medicoActual.especialidad)?.nombre ||
    medicoActual.especialidad;

  const enSalaCount = citasDelMedico.filter(
    (c) => c.estadoCita === 'Admitida en Sala'
  ).length;
  const preAdmitidasCount = citasDelMedico.filter(
    (c) =>
      c.estadoCita === 'Pre-admitida' || c.estadoCita === 'Reprogramada'
  ).length;
  const atendidasCount = citasDelMedico.filter(
    (c) => c.estadoCita === 'Atendida'
  ).length;

  const filtradas = citasDelMedico.filter((c) => {
    if (filtroEstado === 'hoy' && c.fecha !== hoyIsoActual) return false;
    if (filtroEstado === 'en_sala' && c.estadoCita !== 'Admitida en Sala')
      return false;
    if (
      filtroEstado === 'pendientes' &&
      c.estadoCita !== 'Pre-admitida' &&
      c.estadoCita !== 'Reprogramada'
    )
      return false;
    if (filtroEstado === 'atendidas' && c.estadoCita !== 'Atendida')
      return false;

    const q = busqueda.trim().toLowerCase();
    if (
      q &&
      !c.id.toLowerCase().includes(q) &&
      !c.pacienteNombre.toLowerCase().includes(q) &&
      !c.pacienteCedula.toLowerCase().includes(q) &&
      !(c.motivoConsulta || '').toLowerCase().includes(q) &&
      !(c.procedimientoNombre || '').toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  // Prioridad clínica: En Sala primero, luego Pre-admitidas/Reprogramadas cronológicamente, cerradas abajo
  const ordenadas = [
    ...ordenarCitasCronologicamente(
      filtradas.filter((c) => c.estadoCita === 'Admitida en Sala')
    ),
    ...ordenarCitasCronologicamente(
      filtradas.filter(
        (c) =>
          !esEstadoCitaCerrado(c.estadoCita) &&
          c.estadoCita !== 'Admitida en Sala'
      )
    ),
    ...ordenarCitasCronologicamente(
      filtradas.filter((c) => esEstadoCitaCerrado(c.estadoCita))
    ).reverse(),
  ];

  return (
    <div className="space-y-5">
      <div
        className={`${CARD} border-indigo-200 space-y-4`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center gap-1">
                <Ic n="steth" c="w-3.5 h-3.5" />
                <span>Consultorio Médico</span>
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                {medicoActual.nombre}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Código: <strong>{medicoActual.codigo}</strong> · Especialidad:{' '}
              <strong>{especialidadNombre}</strong> · Ubicación:{' '}
              <strong>{medicoActual.consultorio}</strong>
              {descansoSemanalNombre ? ` · Descanso: ${descansoSemanalNombre}` : ''}
            </p>
            {(medicoActual.telefono || medicoActual.correo) && (
              <p className="text-xs text-slate-500">
                {medicoActual.telefono ? `📞 ${medicoActual.telefono}` : ''}
                {medicoActual.telefono && medicoActual.correo ? ' · ' : ''}
                {medicoActual.correo ? `✉️ ${medicoActual.correo}` : ''}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                editandoPerfilMedico
                  ? setEditandoPerfilMedico(false)
                  : abrirEditorPerfil()
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                editandoPerfilMedico
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
              }`}
            >
              <Ic n="edit" c="w-3.5 h-3.5" />
              <span>
                {editandoPerfilMedico
                  ? 'Cerrar Edición'
                  : 'Editar Mis Datos y PIN'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[10px] text-slate-500 font-semibold">
              Total Citas
            </span>
            <strong className="text-base text-slate-900">
              {citasDelMedico.length}
            </strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="block text-[10px] text-emerald-700 font-semibold">
              En Sala (Listos)
            </span>
            <strong className="text-base text-emerald-800">
              {enSalaCount}
            </strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200">
            <span className="block text-[10px] text-sky-700 font-semibold">
              Pre-admitidos
            </span>
            <strong className="text-base text-sky-800">
              {preAdmitidasCount}
            </strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200">
            <span className="block text-[10px] text-teal-800 font-semibold">
              Atendidos
            </span>
            <strong className="text-base text-teal-900">
              {atendidasCount}
            </strong>
          </div>
        </div>

        {feedbackPerfil && !editandoPerfilMedico && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold border ${
              feedbackPerfil.tipo === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedbackPerfil.tipo === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {feedbackPerfil.texto}
          </div>
        )}

        {editandoPerfilMedico && (
          <form
            onSubmit={manejarGuardarPerfil}
            className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-indigo-950">
                  Actualizar Datos del Profesional y PIN de Acceso
                </h3>
                <p className="text-[11px] text-slate-600">
                  Código: <strong>{medicoActual.codigo}</strong> · Especialidad:{' '}
                  <strong>{especialidadNombre}</strong>
                </p>
              </div>
              {medicoActual.pin && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                  PIN personalizado activo
                </span>
              )}
            </div>

            {feedbackPerfil && (
              <div
                className={`p-2.5 rounded-xl font-semibold border ${
                  feedbackPerfil.tipo === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {feedbackPerfil.texto}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: Dr. Andrés Felipe Vargas"
                  className={INP}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultorio / Ubicación
                </label>
                <input
                  type="text"
                  required
                  value={formConsultorio}
                  onChange={(e) => setFormConsultorio(e.target.value)}
                  placeholder="Ej: Cons. 101"
                  className={INP}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teléfono de contacto (opcional)
                </label>
                <input
                  type="tel"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  placeholder="Ej: 3001234567"
                  className={INP}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo profesional (opcional)
                </label>
                <input
                  type="email"
                  value={formCorreo}
                  onChange={(e) => setFormCorreo(e.target.value)}
                  placeholder="medico@saludviva.co"
                  className={INP}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    PIN de acceso (4 dígitos)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarPin((v) => !v)}
                    className="text-[11px] font-bold text-indigo-700 hover:underline"
                  >
                    {mostrarPin ? 'Ocultar PIN' : 'Ver PIN'}
                  </button>
                </div>
                <input
                  type={mostrarPin ? 'text' : 'password'}
                  maxLength={4}
                  inputMode="numeric"
                  required
                  value={formPin}
                  onChange={(e) =>
                    setFormPin(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="••••"
                  className={`${INP} tracking-[0.4em] font-bold text-center`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirmar PIN (4 dígitos)
                </label>
                <input
                  type={mostrarPin ? 'text' : 'password'}
                  maxLength={4}
                  inputMode="numeric"
                  required
                  value={formConfirmarPin}
                  onChange={(e) =>
                    setFormConfirmarPin(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="••••"
                  className={`${INP} tracking-[0.4em] font-bold text-center`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditandoPerfilMedico(false);
                  setFeedbackPerfil(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoPerfilMedico}
                className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold"
              >
                {guardandoPerfilMedico
                  ? 'Guardando...'
                  : 'Guardar Cambios y PIN'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <input
          type="text"
          placeholder="Buscar por paciente, cédula, ID cita o síntoma..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`${INP} flex-1 min-w-[220px]`}
        />
        <select
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(
              e.target.value as
                | 'todas'
                | 'hoy'
                | 'en_sala'
                | 'pendientes'
                | 'atendidas'
            )
          }
          className={`${INP} w-auto font-bold`}
        >
          <option value="todas">Todas las citas ({citasDelMedico.length})</option>
          <option value="hoy">Agenda de hoy ({hoyIsoActual})</option>
          <option value="en_sala">Admitidas en Sala ({enSalaCount})</option>
          <option value="pendientes">
            Pre-admitidas / Reprog. ({preAdmitidasCount})
          </option>
          <option value="atendidas">Atendidas ({atendidasCount})</option>
        </select>
      </div>

      {ordenadas.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2 text-xs text-slate-500">
          <p className="font-bold text-slate-700 text-sm">
            No hay pacientes en esta vista
          </p>
          <p>
            Cuando los pacientes agenden citas contigo ({medicoActual.codigo}),
            verás aquí sus síntomas, Orden Médica y Autorización EPS.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {ordenadas.map((c) => {
            const ordenPdf = esArchivoPdf(c.fotoOrdenUrl, undefined);
            const autPdf = esArchivoPdf(c.fotoAutorizacionUrl, undefined);
            const notaPrevia = limpiarEtiquetaApartado(c.observacionAdmin);
            const notaInput = notaClinicaTemp[c.id] ?? '';
            const cerr = esEstadoCitaCerrado(c.estadoCita);
            const puedeFinalizarDirecto =
              c.estadoCita === 'Admitida en Sala' &&
              c.valorCopago === 0 &&
              !c.costoPendiente;

            return (
              <div
                key={c.id}
                className={`${CARD} space-y-3 text-xs ${
                  c.estadoCita === 'Admitida en Sala'
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : cerr
                    ? 'opacity-85 bg-slate-50/70'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {c.pacienteNombre}
                      </span>
                      <span className="text-slate-500">
                        (CC {c.pacienteCedula})
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>{c.pacienteEps}</strong> ·{' '}
                      {c.pacienteClasificacion}
                    </p>
                    <p className="font-bold text-slate-900">
                      {c.especialidadNombre} ·{' '}
                      <span className="text-indigo-700">
                        {formatearDuracionVisibleCita(c, tiposAtencionCitas)}
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
                    <p className="text-slate-600">
                      📅 {formatearFechaLegible(c.fecha)} ·{' '}
                      <strong>{c.hora}</strong> ·{' '}
                      {obtenerConsultorioPorMedico(c.medicoId)}
                    </p>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <span
                      className={`block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        c.estadoCita === 'Atendida'
                          ? 'bg-teal-100 text-teal-900'
                          : c.estadoCita === 'Admitida en Sala'
                          ? 'bg-emerald-600 text-white'
                          : c.estadoCita === 'Cancelada' ||
                            c.estadoCita === 'No asistió'
                          ? 'bg-rose-100 text-rose-800'
                          : c.estadoCita === 'Reprogramada'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {c.estadoCita === 'Admitida en Sala'
                        ? 'En Sala (Listo)'
                        : c.estadoCita}
                    </span>
                    <span
                      className={`block px-2 py-0.5 rounded-full font-bold text-[10px] ${
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

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <span className="font-bold text-indigo-950 block">
                    🩺 Síntomas / Motivo de consulta descrito por el paciente:
                  </span>
                  <p className="text-slate-800 leading-relaxed">
                    {c.motivoConsulta ? (
                      c.motivoConsulta
                    ) : (
                      <span className="italic text-slate-500">
                        El paciente no registró descripción previa de síntomas.
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {c.fotoOrdenUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        onVerImagen(
                          `Orden Médica · ${c.pacienteNombre}`,
                          c.fotoOrdenUrl || ''
                        )
                      }
                      className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold flex items-center justify-center gap-1.5"
                    >
                      <IconCamera className="w-4 h-4 shrink-0" />
                      <span>
                        Ver Orden Médica{ordenPdf ? ' (PDF)' : ''}
                      </span>
                    </button>
                  ) : (
                    <span className="p-2.5 rounded-xl bg-slate-50 border text-slate-400 text-center">
                      Sin Orden Médica
                    </span>
                  )}

                  {c.fotoAutorizacionUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        onVerImagen(
                          `Autorización EPS · ${c.pacienteNombre}`,
                          c.fotoAutorizacionUrl || ''
                        )
                      }
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center gap-1.5"
                    >
                      <IconCamera className="w-4 h-4 shrink-0" />
                      <span>
                        Ver Autorización EPS{autPdf ? ' (PDF)' : ''}
                      </span>
                    </button>
                  ) : (
                    <span className="p-2.5 rounded-xl bg-slate-50 border text-slate-400 text-center">
                      Sin Autorización EPS
                    </span>
                  )}
                </div>

                {notaPrevia && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    <strong>Registro / Evolución actual:</strong> {notaPrevia}
                  </div>
                )}

                {!cerr && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      📋 Nota médica / Evolución o indicaciones de consulta:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Paciente valorado en consultorio, se solicita examen de control o se formulan indicaciones..."
                      value={notaInput}
                      onChange={(e) =>
                        setNotaClinicaTemp((prev) => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          guardandoCitaMedicoId === c.id || !notaInput.trim()
                        }
                        onClick={() => guardarNotaClinicaMedico(c, notaInput)}
                        className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold"
                      >
                        {guardandoCitaMedicoId === c.id
                          ? 'Guardando...'
                          : 'Guardar Nota Clínica'}
                      </button>

                      {puedeFinalizarDirecto ? (
                        <button
                          type="button"
                          disabled={guardandoCitaMedicoId === c.id}
                          onClick={() => finalizarConsultaMedico(c, notaInput)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold"
                        >
                          ✓ Finalizar Consulta ($0 Exento)
                        </button>
                      ) : c.estadoCita === 'Admitida en Sala' ? (
                        <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-semibold text-[11px]">
                          💳 Copago pendiente en Caja N3:{' '}
                          {c.costoPendiente
                            ? 'Por definir (N2/N3)'
                            : `$${c.valorCopago.toLocaleString('es-CO')} COP`}
                        </span>
                      ) : (
                        <span className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-semibold text-[11px]">
                          ⏳ Pendiente de admisión en sala (Ventanilla N3)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
