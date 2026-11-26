import React, { useMemo, useState } from 'react';
import {
  AREAS_SERVICIO,
  ESPECIALIDADES,
  MEDICOS_BASE,
  calcularValorConsulta,
  especialidadSoportaTipoAtencion,
  formatearClasificacion,
  obtenerEtiquetaConceptoPago,
  obtenerRequisitosDocumentos,
  type AreaServicioId,
  type MedicoBase,
  type RangoAfiliacionTipo,
  type RegimenTipo,
  type TarifasConfig,
  type TipoAfiliacionTipo,
} from '../data/saludVivaData';
import { CORREO_INSTITUCIONAL } from '../services/mailer';
import { CamposAfiliacion, INP, Ic } from './uiShared';

const CONSULTA_IMG_URL = '/src/assets/images/consulta_medica_real.jpg';
const DIAGNOSTICO_IMG_URL = '/src/assets/images/atencion_paciente_real.jpg';

const DESCRIPCIONES_AREAS: Record<AreaServicioId, string> = {
  general:
    'Puerta de entrada al sistema de salud: valoración médica general sin orden previa y seguimiento integral.',
  especializada:
    '32 especialidades clínicas y quirúrgicas ambulatorias con agenda controlada y pre-admisión digital.',
  salud_mental:
    'Atención en psicología, psiquiatría de adultos, infantil y neuropsicología con enfoque integral.',
  materno_perinatal:
    'Ginecología, perinatología y control prenatal prioritario para cuidado materno y perinatal.',
  apoyo_terapeutico:
    'Rehabilitación física, fonoaudiología, terapia ocupacional, respiratoria y nutrición clínica.',
  apoyo_diagnostico:
    'Odontología y vacunación con acceso directo, optometría y audiología con orden médica, laboratorio e imágenes.',
};

function ImagenConRespaldo({
  src,
  alt,
  className,
  fallbackLabel,
}: {
  src: string;
  alt: string;
  className: string;
  fallbackLabel: string;
}) {
  const [errorImg, setErrorImg] = useState(false);

  if (errorImg) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-sky-600 to-emerald-600 flex flex-col items-center justify-center p-6 text-center text-white`}
      >
        <Ic n="steth" c="w-10 h-10 text-sky-200 mb-2" />
        <span className="text-sm font-semibold text-sky-50">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrorImg(true)}
      className={className}
    />
  );
}

export function LoginView({
  modoAccesoInicio,
  setModoAccesoInicio,
  errorLogin,
  setErrorLogin,
  cedulaLogin,
  setCedulaLogin,
  pinPacienteLogin,
  setPinPacienteLogin,
  recuperandoPin,
  handleRecuperarPinCorreo,
  handleLoginPacienteRegistrado,
  enviandoFormulario,
  nuevoNombres,
  setNuevoNombres,
  nuevoApellidos,
  setNuevoApellidos,
  nuevoCedula,
  setNuevoCedula,
  nuevoPinPaciente,
  setNuevoPinPaciente,
  nuevoTelefono,
  setNuevoTelefono,
  nuevoCorreo,
  setNuevoCorreo,
  nuevoEps,
  setNuevoEps,
  nuevoRegimen,
  setNuevoRegimen,
  nuevoTipoAfiliacion,
  setNuevoTipoAfiliacion,
  nuevoRango,
  setNuevoRango,
  aceptoHabeasDataNuevo,
  setAceptoHabeasDataNuevo,
  handleRegistroUsuarioNuevo,
  tarifas,
  segundosBloqueoAdmin,
  cedulaAdminLogin,
  setCedulaAdminLogin,
  pinAdmin,
  setPinAdmin,
  handleLoginAdmin,
  codigoMedicoLogin,
  setCodigoMedicoLogin,
  pinMedicoLogin,
  setPinMedicoLogin,
  handleLoginMedico,
  medicosLista = MEDICOS_BASE,
  tarifasParticulares = {},
}: {
  modoAccesoInicio: 'registrado' | 'nuevo' | 'medico' | 'admin';
  setModoAccesoInicio: (m: 'registrado' | 'nuevo' | 'medico' | 'admin') => void;
  errorLogin: string;
  setErrorLogin: (s: string) => void;
  cedulaLogin: string;
  setCedulaLogin: (s: string) => void;
  pinPacienteLogin: string;
  setPinPacienteLogin: (s: string) => void;
  recuperandoPin: boolean;
  handleRecuperarPinCorreo: () => void;
  handleLoginPacienteRegistrado: (e: React.FormEvent) => void;
  enviandoFormulario: boolean;
  nuevoNombres: string;
  setNuevoNombres: (s: string) => void;
  nuevoApellidos: string;
  setNuevoApellidos: (s: string) => void;
  nuevoCedula: string;
  setNuevoCedula: (s: string) => void;
  nuevoPinPaciente: string;
  setNuevoPinPaciente: (s: string) => void;
  nuevoTelefono: string;
  setNuevoTelefono: (s: string) => void;
  nuevoCorreo: string;
  setNuevoCorreo: (s: string) => void;
  nuevoEps: string;
  setNuevoEps: (s: string) => void;
  nuevoRegimen: RegimenTipo;
  setNuevoRegimen: (r: RegimenTipo) => void;
  nuevoTipoAfiliacion: TipoAfiliacionTipo;
  setNuevoTipoAfiliacion: (t: TipoAfiliacionTipo) => void;
  nuevoRango: RangoAfiliacionTipo;
  setNuevoRango: (r: RangoAfiliacionTipo) => void;
  aceptoHabeasDataNuevo: boolean;
  setAceptoHabeasDataNuevo: (b: boolean) => void;
  handleRegistroUsuarioNuevo: (e: React.FormEvent) => void;
  tarifas: TarifasConfig;
  segundosBloqueoAdmin: number;
  cedulaAdminLogin: string;
  setCedulaAdminLogin: (s: string) => void;
  pinAdmin: string;
  setPinAdmin: (s: string) => void;
  handleLoginAdmin: (e: React.FormEvent) => void;
  codigoMedicoLogin: string;
  setCodigoMedicoLogin: (s: string) => void;
  pinMedicoLogin: string;
  setPinMedicoLogin: (s: string) => void;
  handleLoginMedico: (e: React.FormEvent) => void;
  medicosLista?: MedicoBase[];
  tarifasParticulares?: Record<string, number>;
}) {
  const [areaDirectorio, setAreaDirectorio] = useState<'todas' | AreaServicioId>(
    'todas'
  );
  const [filtroDocDir, setFiltroDocDir] = useState<
    'todos' | 'directo' | 'solo_orden' | 'ambos' | 'procedimientos'
  >('todos');
  const [busquedaDir, setBusquedaDir] = useState('');
  const [mostrarTodasDir, setMostrarTodasDir] = useState(false);

  const clasifPrev = formatearClasificacion(
    nuevoRegimen,
    nuevoTipoAfiliacion,
    nuevoRango
  );
  const valNuevo = calcularValorConsulta(clasifPrev, tarifas);
  const minTarifaParticular = useMemo(
    () =>
      Math.min(
        ...ESPECIALIDADES.map(
          (e) => tarifasParticulares[e.id] ?? e.tarifaParticular
        )
      ),
    [tarifasParticulares]
  );

  const irAPortalAcceso = (
    modo: 'registrado' | 'nuevo' | 'medico' | 'admin'
  ) => {
    setModoAccesoInicio(modo);
    setErrorLogin('');
    window.requestAnimationFrame(() => {
      const tarjeta = document.getElementById('tarjeta-acceso');
      if (tarjeta) {
        tarjeta.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const primerInput = tarjeta.querySelector(
          'input:not([disabled])'
        ) as HTMLInputElement | null;
        if (primerInput) {
          window.setTimeout(() => {
            primerInput.focus({ preventScroll: true });
          }, 350);
        }
      }
    });
  };

  const seleccionarAreaEnDirectorio = (areaId: AreaServicioId) => {
    setAreaDirectorio(areaId);
    setMostrarTodasDir(true);
    window.requestAnimationFrame(() => {
      const el = document.getElementById('directorio');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const especialidadesFiltradas = useMemo(() => {
    const q = busquedaDir.trim().toLowerCase();
    return ESPECIALIDADES.filter((esp) => {
      if (areaDirectorio !== 'todas' && esp.areaId !== areaDirectorio) {
        return false;
      }
      const soportaConsulta = especialidadSoportaTipoAtencion(esp.id, 'consulta');
      const soportaProc = especialidadSoportaTipoAtencion(
        esp.id,
        'procedimiento'
      );
      const reqConsulta = soportaConsulta
        ? obtenerRequisitosDocumentos(
            esp.id,
            'Contributivo · Cotizante · Rango A',
            'consulta'
          )
        : null;

      if (filtroDocDir === 'directo') {
        if (
          !reqConsulta ||
          reqConsulta.requiereOrden ||
          reqConsulta.requiereAutorizacion
        ) {
          return false;
        }
      } else if (filtroDocDir === 'solo_orden') {
        if (
          !reqConsulta ||
          !reqConsulta.requiereOrden ||
          reqConsulta.requiereAutorizacion
        ) {
          return false;
        }
      } else if (filtroDocDir === 'ambos') {
        if (
          !reqConsulta ||
          !reqConsulta.requiereOrden ||
          !reqConsulta.requiereAutorizacion
        ) {
          return false;
        }
      } else if (filtroDocDir === 'procedimientos') {
        if (!soportaProc) return false;
      }

      if (!q) return true;
      const areaNombre =
        AREAS_SERVICIO.find((a) => a.id === esp.areaId)?.nombre.toLowerCase() ||
        '';
      const medMatch = medicosLista.some(
        (m) =>
          m.especialidad === esp.id && m.nombre.toLowerCase().includes(q)
      );
      return (
        esp.nombre.toLowerCase().includes(q) ||
        areaNombre.includes(q) ||
        medMatch
      );
    });
  }, [areaDirectorio, filtroDocDir, busquedaDir, medicosLista]);

  const especialidadesVisibles =
    mostrarTodasDir || busquedaDir.trim().length > 0 || areaDirectorio !== 'todas'
      ? especialidadesFiltradas
      : especialidadesFiltradas.slice(0, 9);

  return (
    <div className="w-full">
      {/* BANDA SUPERIOR INSTITUCIONAL CON INICIO DE SESIÓN ARRIBA DE TODO */}
      <section
        id="portal-acceso"
        className="bg-gradient-to-r from-sky-800 via-sky-700 to-emerald-700 text-white scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* COLUMNA IZQUIERDA: PRESENTACIÓN INSTITUCIONAL SIN IMAGEN */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-6">
              <div className="space-y-4">
                <p className="text-xs font-medium tracking-wide text-sky-100">
                  Portal SGSSS · IPS Salud Viva · Barranquilla
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.12] [text-wrap:balance]">
                  Agenda tus citas médicas y servicios ambulatorios sin filas
                </h1>
                <p className="text-sm sm:text-base text-sky-50 leading-relaxed max-w-xl">
                  Ingresa con tu cédula o regístrate en minutos para programar
                  consultas y procedimientos, adjuntar tus soportes y recibir tu
                  Pase QR y pre-factura en tu correo.
                </p>
              </div>

              <div className="border-t border-white/20 pt-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-sky-100 block text-xs">
                    Sede Principal Alto Prado
                  </span>
                  <strong className="text-white font-semibold">
                    Carrera 51B # 82 - 140 · Barranquilla
                  </strong>
                </div>
                <div>
                  <span className="text-sky-100 block text-xs">
                    Horario de Atención Continua
                  </span>
                  <strong className="text-white font-semibold">
                    Lunes a Sábado · 06:00 AM – 06:00 PM
                  </strong>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: INICIO DE SESIÓN / REGISTRO ARRIBA DE TODO */}
            <div
              id="tarjeta-acceso"
              className="lg:col-span-7 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col scroll-mt-24"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-b border-slate-200 p-1.5 gap-1.5">
                {[
                  {
                    id: 'registrado',
                    label: 'Ya Registrado',
                    cls: 'bg-sky-600 text-white shadow-xs',
                    n: 'user' as const,
                  },
                  {
                    id: 'nuevo',
                    label: 'Usuario Nuevo',
                    cls: 'bg-emerald-600 text-white shadow-xs',
                    n: 'userPlus' as const,
                  },
                  {
                    id: 'medico',
                    label: 'Médico',
                    cls: 'bg-indigo-700 text-white shadow-xs',
                    n: 'steth' as const,
                  },
                  {
                    id: 'admin',
                    label: 'Administrativo',
                    cls: 'bg-teal-700 text-white shadow-xs',
                    n: 'shield' as const,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setModoAccesoInicio(
                        t.id as 'registrado' | 'nuevo' | 'medico' | 'admin'
                      );
                      setErrorLogin('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                      modoAccesoInicio === t.id
                        ? t.cls
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    <Ic n={t.n} c="w-4 h-4 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8 bg-white flex-1 flex flex-col justify-center">
                {errorLogin && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <Ic n="alert" c="w-5 h-5 shrink-0" />
                    <span>{errorLogin}</span>
                  </div>
                )}

                {modoAccesoInicio === 'registrado' && (
                  <form
                    onSubmit={handleLoginPacienteRegistrado}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Ingreso de Paciente
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Digita tu cédula y PIN de 4 dígitos o recupéralo por
                        correo.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Número de Cédula (CC)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 1045678901"
                        value={cedulaLogin}
                        onChange={(e) =>
                          setCedulaLogin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          PIN de Seguridad (4 dígitos)
                        </label>
                        <button
                          type="button"
                          disabled={recuperandoPin}
                          onClick={handleRecuperarPinCorreo}
                          className="text-xs font-bold text-sky-600 hover:underline disabled:opacity-50"
                        >
                          {recuperandoPin ? 'Enviando...' : '¿Olvidaste tu PIN?'}
                        </button>
                      </div>
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="••••"
                        value={pinPacienteLogin}
                        onChange={(e) =>
                          setPinPacienteLogin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center tracking-[0.5em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enviandoFormulario}
                      className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {enviandoFormulario
                        ? 'Verificando...'
                        : 'Ingresar al Portal'}
                    </button>
                  </form>
                )}

                {modoAccesoInicio === 'nuevo' && (
                  <form
                    onSubmit={handleRegistroUsuarioNuevo}
                    className="space-y-3.5"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Registro de Paciente Nuevo
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Guardado seguro bajo protección Ley 1581 de 2012.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">
                          Nombres
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Laura Sofía"
                          value={nuevoNombres}
                          onChange={(e) => setNuevoNombres(e.target.value)}
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Pérez Gómez"
                          value={nuevoApellidos}
                          onChange={(e) => setNuevoApellidos(e.target.value)}
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Cédula
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Mínimo 6 dígitos"
                          value={nuevoCedula}
                          onChange={(e) =>
                            setNuevoCedula(e.target.value.replace(/\D/g, ''))
                          }
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Crea tu PIN (4 dígitos)
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          inputMode="numeric"
                          placeholder="Ej: 2580"
                          value={nuevoPinPaciente}
                          onChange={(e) =>
                            setNuevoPinPaciente(
                              e.target.value.replace(/\D/g, '')
                            )
                          }
                          className={`${INP} tracking-widest font-bold`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          placeholder="Ej: 3001234567"
                          value={nuevoTelefono}
                          onChange={(e) => setNuevoTelefono(e.target.value)}
                          className={INP}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Correo (Facturas y PIN)
                        </label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={nuevoCorreo}
                          onChange={(e) => setNuevoCorreo(e.target.value)}
                          className={INP}
                        />
                      </div>
                    </div>
                    <CamposAfiliacion
                      eps={nuevoEps}
                      regimen={nuevoRegimen}
                      tipoAfiliacion={nuevoTipoAfiliacion}
                      rango={nuevoRango}
                      onChange={(v) => {
                        setNuevoEps(v.eps);
                        setNuevoRegimen(v.regimen);
                        setNuevoTipoAfiliacion(v.tipoAfiliacion);
                        setNuevoRango(v.rango);
                      }}
                    />
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="text-emerald-900 font-medium">
                        {nuevoRegimen === 'Particular'
                          ? 'Tarifa Particular (varía según especialidad):'
                          : `${obtenerEtiquetaConceptoPago(clasifPrev)}:`}
                      </span>
                      <span className="font-extrabold text-emerald-700 shrink-0 ml-2 tabular-nums">
                        {nuevoRegimen === 'Particular'
                          ? `Desde $${minTarifaParticular.toLocaleString('es-CO')} COP`
                          : valNuevo === 0
                          ? '$0 COP (Exento)'
                          : `$${valNuevo.toLocaleString('es-CO')} COP`}
                      </span>
                    </div>
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptoHabeasDataNuevo}
                        onChange={(e) =>
                          setAceptoHabeasDataNuevo(e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 accent-sky-600 shrink-0"
                      />
                      <span>
                        <strong>Habeas Data (Ley 1581):</strong> Autorizo a{' '}
                        <strong>IPS Salud Viva</strong> para tratar mis datos y
                        enviar facturas/avisos clínicos a mi correo.
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={enviandoFormulario || !aceptoHabeasDataNuevo}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                    >
                      {enviandoFormulario
                        ? 'Guardando...'
                        : 'Registrar e Ingresar'}
                    </button>
                  </form>
                )}

                {modoAccesoInicio === 'medico' && (
                  <form onSubmit={handleLoginMedico} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Acceso Médico / Especialista
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Consulta tus citas asignadas, síntomas descritos por el
                        paciente, Orden Médica y Autorización EPS (imagen o
                        PDF).
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Código Institucional del Médico
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: MED-MG-101"
                        value={codigoMedicoLogin}
                        onChange={(e) =>
                          setCodigoMedicoLogin(e.target.value.toUpperCase())
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        PIN Médico (4 dígitos)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="••••"
                        value={pinMedicoLogin}
                        onChange={(e) =>
                          setPinMedicoLogin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center tracking-[0.5em] text-lg font-bold"
                      />
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Ingresa tu PIN personalizado de 4 dígitos (si aún no lo
                        cambias, usa los 4 dígitos de tu código, ej:{' '}
                        <strong>0101</strong>, o el PIN institucional{' '}
                        <strong>2026</strong>).
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={enviandoFormulario}
                      className="w-full py-3.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold transition-colors"
                    >
                      {enviandoFormulario
                        ? 'Verificando...'
                        : 'Ingresar al Consultorio'}
                    </button>
                  </form>
                )}

                {modoAccesoInicio === 'admin' && (
                  <form onSubmit={handleLoginAdmin} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Acceso Administrativo
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Control por niveles (1 a 4). Ingresa cédula y PIN de 4
                        dígitos.
                      </p>
                    </div>
                    {segundosBloqueoAdmin > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
                        <span>Bloqueo temporal</span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white tabular-nums">
                          {segundosBloqueoAdmin}s
                        </span>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Cédula Administrativa
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        disabled={segundosBloqueoAdmin > 0}
                        placeholder="Ej: 1005005005 o 4004"
                        value={cedulaAdminLogin}
                        onChange={(e) =>
                          setCedulaAdminLogin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        PIN (4 dígitos)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        disabled={segundosBloqueoAdmin > 0}
                        placeholder="••••"
                        value={pinAdmin}
                        onChange={(e) =>
                          setPinAdmin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center tracking-[0.5em] text-lg font-bold disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enviandoFormulario || segundosBloqueoAdmin > 0}
                      className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold transition-colors"
                    >
                      {segundosBloqueoAdmin > 0
                        ? `Espera ${segundosBloqueoAdmin}s`
                        : enviandoFormulario
                        ? 'Validando...'
                        : 'Ingresar al Panel'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FRANJA INSTITUCIONAL DE CIFRAS CLAVE */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="pt-2 lg:pt-0 lg:pr-6">
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
              {AREAS_SERVICIO.length} Áreas
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Atención general, especializada, salud mental, materno-perinatal y
              apoyo diagnóstico.
            </p>
          </div>
          <div className="pt-2 lg:pt-0 lg:px-6">
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
              {ESPECIALIDADES.length} Especialidades
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Consultas médicas y procedimientos ambulatorios en Barranquilla.
            </p>
          </div>
          <div className="pt-4 lg:pt-0 lg:px-6">
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
              {medicosLista.length} Profesionales
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Agenda directa con especialistas titulares y médico suplente de
              turno.
            </p>
          </div>
          <div className="pt-4 lg:pt-0 lg:pl-6">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
              Pase QR + Correo
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Liquidación SGSSS automática, Pase QR y comprobante enviado al
              instante.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: ÁREAS DE ATENCIÓN */}
      <section
        id="servicios"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-sky-700">
              Portafolio de Servicios Ambulatorios
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight [text-wrap:balance]">
              Explora nuestras áreas clínicas y consulta sus requisitos
            </h2>
          </div>
          <button
            type="button"
            onClick={() => irAPortalAcceso('nuevo')}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors self-start sm:self-auto"
          >
            Registrarme para Agendar
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS_SERVICIO.map((area, idx) => {
            const espsArea = ESPECIALIDADES.filter((e) => e.areaId === area.id);
            const medCount = medicosLista.filter((m) =>
              espsArea.some((e) => e.id === m.especialidad)
            ).length;
            const nombreLimpio = area.nombre.replace(/^\d+\.\s*/, '');
            const seleccionada = areaDirectorio === area.id;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => seleccionarAreaEnDirectorio(area.id)}
                className={`text-left p-6 rounded-2xl border transition-colors flex flex-col justify-between gap-4 bg-white ${
                  seleccionada
                    ? 'border-sky-600 ring-1 ring-sky-600 bg-sky-50/40'
                    : 'border-slate-200 hover:border-sky-600/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                    <span className="font-bold text-sky-700">
                      0{idx + 1}. Área Clínica
                    </span>
                    <span>
                      {espsArea.length}{' '}
                      {espsArea.length === 1 ? 'especialidad' : 'especialidades'}{' '}
                      · {medCount} prof.
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {nombreLimpio}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {DESCRIPCIONES_AREAS[area.id]}
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-700 inline-flex items-center gap-1">
                  Ver especialidades en el directorio →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 2: DIRECTORIO INTERACTIVO DE ESPECIALIDADES Y DOCUMENTOS */}
      <section
        id="directorio"
        className="bg-white border-y border-slate-200 py-12 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-sky-700">
                Directorio Médico y Requisitos de Soportes
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Consulta especialidades, profesionales y documentos requeridos
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
              <input
                type="text"
                value={busquedaDir}
                onChange={(e) => setBusquedaDir(e.target.value)}
                placeholder="Buscar especialidad o médico (ej: Odontología, Cardiología)..."
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              <select
                value={filtroDocDir}
                onChange={(e) =>
                  setFiltroDocDir(
                    e.target.value as
                      | 'todos'
                      | 'directo'
                      | 'solo_orden'
                      | 'ambos'
                      | 'procedimientos'
                  )
                }
                aria-label="Filtrar por requisito de documento"
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="todos">Todos los requisitos</option>
                <option value="directo">Sin documentos (acceso directo)</option>
                <option value="solo_orden">Solo Orden Médica</option>
                <option value="ambos">Orden + Autorización EPS</option>
                <option value="procedimientos">
                  Con Procedimientos (Orden o Autorización)
                </option>
              </select>
            </div>
          </div>

          {/* TABS DE ÁREAS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setAreaDirectorio('todas')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                areaDirectorio === 'todas'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({ESPECIALIDADES.length})
            </button>
            {AREAS_SERVICIO.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAreaDirectorio(a.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  areaDirectorio === a.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {a.nombre.replace(/^\d+\.\s*/, '')}
              </button>
            ))}
          </div>

          {especialidadesFiltradas.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                No encontramos especialidades o médicos con ese criterio.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAreaDirectorio('todas');
                  setFiltroDocDir('todos');
                  setBusquedaDir('');
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {especialidadesVisibles.map((esp) => {
                  const areaNom =
                    AREAS_SERVICIO.find((a) => a.id === esp.areaId)?.nombre.replace(
                      /^\d+\.\s*/,
                      ''
                    ) || '';
                  const soportaConsulta = especialidadSoportaTipoAtencion(
                    esp.id,
                    'consulta'
                  );
                  const soportaProc = especialidadSoportaTipoAtencion(
                    esp.id,
                    'procedimiento'
                  );
                  const reqConsulta = soportaConsulta
                    ? obtenerRequisitosDocumentos(
                        esp.id,
                        'Contributivo · Cotizante · Rango A',
                        'consulta'
                      )
                    : null;
                  const docsTexto = !soportaConsulta
                    ? 'Procedimiento: Orden o Autorización'
                    : !reqConsulta?.requiereOrden &&
                      !reqConsulta?.requiereAutorizacion
                    ? 'Acceso directo: sin documentos'
                    : reqConsulta.requiereOrden &&
                      !reqConsulta.requiereAutorizacion
                    ? 'Requiere solo Orden Médica'
                    : 'Requiere Orden y Autorización EPS';
                  const medEsp = medicosLista.filter(
                    (m) => m.especialidad === esp.id
                  );

                  return (
                    <div
                      key={esp.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                          <span>{areaNom}</span>
                          <span aria-hidden="true">·</span>
                          <span>{esp.duracionMin} min</span>
                          <span aria-hidden="true">·</span>
                          <span>{medEsp.length} prof.</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {esp.nombre}
                        </h3>
                        <p className="text-xs font-semibold text-sky-700">
                          {docsTexto}
                        </p>
                        {soportaConsulta && soportaProc && (
                          <p className="text-[11px] text-slate-500">
                            Procedimientos disponibles (Orden o Autorización)
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 tabular-nums truncate">
                          Particular $
                          {(
                            tarifasParticulares[esp.id] ?? esp.tarifaParticular
                          ).toLocaleString('es-CO')}
                        </span>
                        <button
                          type="button"
                          onClick={() => irAPortalAcceso('registrado')}
                          className="font-bold text-sky-600 hover:underline whitespace-nowrap shrink-0"
                        >
                          Agendar →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {especialidadesFiltradas.length > 9 &&
                !busquedaDir.trim() &&
                areaDirectorio === 'todas' && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarTodasDir((v) => !v)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
                    >
                      {mostrarTodasDir
                        ? 'Ver vista resumida (9 especialidades)'
                        : `Ver todas las especialidades (${especialidadesFiltradas.length})`}
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: INSTRUCTIVO PASO A PASO Y LIQUIDACIÓN SGSSS */}
      <section
        id="instructivo"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20"
      >
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-sky-700">
                Instructivo de Agendamiento Digital
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight [text-wrap:balance]">
                ¿Cómo funciona tu cita en IPS Salud Viva?
              </h2>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {[
                {
                  num: '01',
                  titulo: 'Ingresa o regístrate arriba en segundos',
                  desc: 'Usa tu cédula y PIN de 4 dígitos si ya estás registrado, o crea tu cuenta nueva seleccionando tu EPS, régimen y rango SGSSS.',
                },
                {
                  num: '02',
                  titulo: 'Adjunta soportes al momento de agendar',
                  desc: 'Medicina General, Odontología y Vacunación no piden documentos. Optometría y Audiología piden solo Orden Médica. Las demás consultas piden Orden y Autorización EPS, y los procedimientos aceptan al menos uno de los dos.',
                },
                {
                  num: '03',
                  titulo: 'Recibe tu Pase QR y pre-factura en tu correo',
                  desc: 'Al confirmar la franja horaria, el sistema liquida tu Cuota Moderadora o Copago según normativa y envía la tirilla QR y el comprobante electrónico.',
                },
                {
                  num: '04',
                  titulo: 'Preséntate 15 minutos antes en Admisiones',
                  desc: 'Muestra tu Pase QR en recepción para validación rápida en sala sin filas ni reprocesos.',
                },
              ].map((paso) => (
                <div key={paso.num} className="py-4 flex gap-4">
                  <span className="text-lg font-extrabold text-sky-600 tabular-nums shrink-0">
                    {paso.num}.
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {paso.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {paso.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <div className="aspect-4/3 overflow-hidden">
                <ImagenConRespaldo
                  src={CONSULTA_IMG_URL}
                  alt="Profesional clínica en laboratorio y apoyo diagnóstico de IPS Salud Viva"
                  className="w-full h-full object-cover object-top"
                  fallbackLabel="Laboratorio y Apoyo Diagnóstico"
                />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  Cuotas Moderadoras Vigentes (Consultas PBS)
                </h3>
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">
                      Contributivo · Rango A (&lt; 2 SMLMV)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${tarifas.A.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">
                      Contributivo · Rango B (2 a 5 SMLMV)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${tarifas.B.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">
                      Contributivo · Rango C (&gt; 5 SMLMV)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${tarifas.C.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">
                      Subsidiado y Población no asegurada
                    </span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      $0 COP (Exento)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: SEDE Y CANALES DE ATENCIÓN */}
      <section
        id="canales"
        className="bg-slate-100/80 border-t border-slate-200 py-12 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid lg:grid-cols-12">
            <div className="lg:col-span-5 aspect-4/3 lg:aspect-auto">
              <ImagenConRespaldo
                src={DIAGNOSTICO_IMG_URL}
                alt="Atención humana y preventiva al paciente en IPS Salud Viva"
                className="w-full h-full object-cover object-top"
                fallbackLabel="Atención Integral y Preventiva"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-sky-700">
                  Canales de Atención y Sede Barranquilla
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Sede Principal Alto Prado · Atención Presencial y Digital
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Nuestro equipo de Admisiones, Autorizaciones y Caja acompaña
                  todo tu proceso desde el agendamiento hasta la salida de
                  consulta.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm border-y border-slate-200 py-4">
                <div>
                  <span className="text-slate-500 block text-xs">
                    Dirección Sede Principal
                  </span>
                  <strong className="text-slate-900">
                    Carrera 51B # 82 - 140, Alto Prado, Barranquilla
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">
                    Horario de Atención
                  </span>
                  <strong className="text-slate-900">
                    Lunes a Sábado · 06:00 AM – 06:00 PM
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">
                    Línea Telefónica y WhatsApp
                  </span>
                  <strong className="text-slate-900 tabular-nums">
                    (605) 385 0000 · +57 300 555 2026
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">
                    Correo Institucional
                  </span>
                  <strong className="text-slate-900 break-all">
                    {CORREO_INSTITUCIONAL}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => irAPortalAcceso('registrado')}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  Ingresar con mi Cédula
                </button>
                <button
                  type="button"
                  onClick={() => irAPortalAcceso('nuevo')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  Registrarme como Paciente Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
