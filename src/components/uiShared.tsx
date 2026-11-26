import React from 'react';
import {
  AREAS_SERVICIO,
  ESPECIALIDADES,
  LISTA_EPS,
  LISTA_RANGOS,
  LISTA_REGIMENES,
  ajustarAfiliacion,
  calcularHoraLlegadaRecomendada,
  determinarTipoAtencionCita,
  esArchivoPdf,
  formatearDuracionVisibleCita,
  formatearFechaLegible,
  generarFranjasHorariasDisponibles,
  obtenerAlternativasPorDescanso,
  obtenerDiaSemanaIso,
  obtenerEtiquetaConceptoPago,
  obtenerNombreDiaSemana,
  type AreaServicioId,
  type AuxiliarTurnoConfig,
  type CitaMedica,
  type ConfirmacionModalData,
  type DiaSemanaNum,
  type EspecialidadId,
  type MedicoBase,
  type MedicoConOcupacion,
  type RangoAfiliacionTipo,
  type RegimenTipo,
  type TipoAfiliacionTipo,
  type TipoAtencionTipo,
} from '../data/saludVivaData';

export const INP = 'w-full px-3 py-2 rounded-xl border border-slate-300 text-xs';
export const CARD = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-xs';

export const IC_PATHS = {
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  userPlus:
    'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  shield:
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  alert:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar:
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  logout:
    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  steth:
    'M4.5 6.5v4a4.5 4.5 0 009 0v-4M9 15v2a4 4 0 008 0v-3m0 0a2 2 0 100-4 2 2 0 000 4z',
  trash:
    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  qr: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h2m2 0h2m-6 3h2m2-3v3',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  receipt:
    'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
};

export const Ic = ({
  n,
  c = 'w-5 h-5',
}: {
  n: keyof typeof IC_PATHS;
  c?: string;
}) => (
  <svg
    className={c}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={IC_PATHS[n]} />
  </svg>
);

export const IconHeartPulse = ({
  className = 'w-6 h-6',
}: {
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 12h2l1.5-3 2 6 1.5-3h3"
    />
  </svg>
);

export const IconCamera = ({
  className = 'w-5 h-5',
}: {
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export function CamposAfiliacion({
  eps,
  regimen,
  tipoAfiliacion,
  rango,
  onChange,
}: {
  eps: string;
  regimen: RegimenTipo;
  tipoAfiliacion: TipoAfiliacionTipo;
  rango: RangoAfiliacionTipo;
  onChange: (next: {
    eps: string;
    regimen: RegimenTipo;
    tipoAfiliacion: TipoAfiliacionTipo;
    rango: RangoAfiliacionTipo;
  }) => void;
}) {
  const sinEps =
    regimen === 'Población no asegurada' || regimen === 'Particular';
  return (
    <div className="grid grid-cols-2 gap-2.5 text-xs">
      <div>
        <label className="block font-semibold mb-1">EPS</label>
        <select
          disabled={sinEps}
          value={sinEps ? 'Sin EPS / No afiliado' : eps}
          onChange={(e) =>
            onChange({ eps: e.target.value, regimen, tipoAfiliacion, rango })
          }
          className={`${INP} font-medium disabled:bg-slate-100 disabled:text-slate-500`}
        >
          {sinEps ? (
            <option value="Sin EPS / No afiliado">Sin EPS / No afiliado</option>
          ) : (
            LISTA_EPS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))
          )}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Régimen</label>
        <select
          value={regimen}
          onChange={(e) =>
            onChange(
              ajustarAfiliacion(
                e.target.value as RegimenTipo,
                eps,
                tipoAfiliacion,
                rango
              )
            )
          }
          className={`${INP} font-medium`}
        >
          {LISTA_REGIMENES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Tipo de afiliación</label>
        <select
          disabled={regimen !== 'Contributivo'}
          value={tipoAfiliacion}
          onChange={(e) =>
            onChange({
              eps,
              regimen,
              tipoAfiliacion: e.target.value as TipoAfiliacionTipo,
              rango,
            })
          }
          className={`${INP} font-medium disabled:bg-slate-100 disabled:text-slate-600`}
        >
          {regimen === 'Contributivo' ? (
            <>
              <option value="Cotizante">Cotizante</option>
              <option value="Beneficiario">Beneficiario</option>
            </>
          ) : regimen === 'Subsidiado' ? (
            <option value="Afiliado subsidiado">
              Afiliado subsidiado (No aplica)
            </option>
          ) : (
            <option value="No aplica">No aplica</option>
          )}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Rango / Categoría</label>
        <select
          disabled={regimen !== 'Contributivo' && regimen !== 'Subsidiado'}
          value={rango}
          onChange={(e) =>
            onChange({
              eps,
              regimen,
              tipoAfiliacion,
              rango: e.target.value as RangoAfiliacionTipo,
            })
          }
          className={`${INP} font-medium disabled:bg-slate-100 disabled:text-slate-600`}
        >
          {regimen === 'Contributivo' || regimen === 'Subsidiado' ? (
            LISTA_RANGOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))
          ) : (
            <option value="No aplica">No aplica</option>
          )}
        </select>
      </div>
    </div>
  );
}

export function ModalConfirmacion({
  modal,
  ejecutando,
  onCerrar,
  onConfirmar,
}: {
  modal: ConfirmacionModalData;
  ejecutando: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div
      onClick={() => !ejecutando && onCerrar()}
      className="fixed inset-0 bg-slate-900/75 z-[60] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              modal.peligroso
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Ic n="alert" c="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              {modal.titulo}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {modal.mensaje}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            disabled={ejecutando}
            onClick={onCerrar}
            className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
          >
            Volver
          </button>
          <button
            type="button"
            disabled={ejecutando}
            onClick={onConfirmar}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 ${
              modal.peligroso ? 'bg-rose-600' : 'bg-sky-600'
            }`}
          >
            {ejecutando ? 'Procesando...' : modal.textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalImagenSoporte({
  imagen,
  onCerrar,
}: {
  imagen: { titulo: string; url: string };
  onCerrar: () => void;
}) {
  const esPdf = esArchivoPdf(imagen.url);
  return (
    <div
      onClick={onCerrar}
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full p-4 space-y-3 shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900">
            {esPdf ? `📄 ${imagen.titulo} (PDF)` : imagen.titulo}
          </h4>
          <div className="flex items-center gap-2">
            <a
              href={imagen.url}
              target="_blank"
              rel="noreferrer"
              download={esPdf ? `${imagen.titulo.replace(/\s+/g, '_')}.pdf` : undefined}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
            >
              {esPdf ? 'Abrir / Descargar PDF' : 'Abrir Imagen'}
            </a>
            <button
              type="button"
              onClick={onCerrar}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
        {esPdf ? (
          <iframe
            src={imagen.url}
            title={imagen.titulo}
            className="w-full h-[72vh] rounded-xl border border-slate-200 bg-slate-50"
          />
        ) : (
          <img
            src={imagen.url}
            alt={imagen.titulo}
            className="w-full max-h-[72vh] object-contain rounded-xl bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

export function ModalTirillaQr({
  cita,
  consultorio,
  reciboNumero,
  onCerrar,
}: {
  cita: CitaMedica;
  consultorio: string;
  reciboNumero?: string;
  onCerrar: () => void;
}) {
  const concepto = obtenerEtiquetaConceptoPago(cita.pacienteClasificacion);
  return (
    <div
      onClick={onCerrar}
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-4"
    >
      <div
        id="tirilla-imprimible"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <IconHeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold">IPS Salud Viva</h4>
              <p className="text-[10px] text-slate-500">
                Pase Digital de Pre-admisión
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="no-print px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
        <div className="flex flex-col items-center text-center bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(
              `IPS-SALUDVIVA|${cita.id}`
            )}`}
            alt={`QR ${cita.id}`}
            className="w-36 h-36 rounded-xl bg-white p-1.5 border"
          />
          <span className="text-base font-extrabold tracking-wider text-sky-800 bg-sky-100 px-3 py-0.5 rounded-lg">
            {cita.id}
          </span>
          <p className="text-[10px] text-slate-500 max-w-xs">
            Código QR protegido (Ley 1581): solo contiene el ID de la cita para
            lectura en Admisiones.
          </p>
        </div>
        <div className="space-y-1.5 text-xs bg-white p-3.5 rounded-2xl border">
          <div className="flex justify-between">
            <span className="text-slate-500">Paciente:</span>
            <span className="font-bold">{cita.pacienteNombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Especialidad:</span>
            <span className="font-bold text-right">
              {cita.especialidadNombre} ({formatearDuracionVisibleCita(cita)})
            </span>
          </div>
          {cita.procedimientoNombre && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Procedimiento:</span>
              <span className="font-bold text-teal-800 text-right">
                {cita.procedimientoNombre}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Profesional:</span>
            <span className="font-semibold">{cita.medicoNombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultorio:</span>
            <span className="font-extrabold text-emerald-700">{consultorio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha y Hora:</span>
            <span className="font-bold">
              {cita.fecha} · {cita.hora}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Llegada:</span>
            <span className="font-bold text-sky-700">
              {calcularHoraLlegadaRecomendada(cita.hora)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t">
            <span className="text-slate-500">{concepto}:</span>
            <span
              className={`font-extrabold ${
                cita.costoPendiente ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {cita.costoPendiente
                ? 'Por definir (N2/N3)'
                : cita.valorCopago === 0
                ? '$0 COP (Exento)'
                : `$${cita.valorCopago.toLocaleString('es-CO')} COP`}
            </span>
          </div>
          {reciboNumero && (
            <div className="flex justify-between text-[11px] text-teal-800">
              <span>Recibo / Voucher:</span>
              <span className="font-bold">{reciboNumero}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          Imprimir / Guardar Tirilla en PDF
        </button>
      </div>
    </div>
  );
}

export function ModalFacturaRecibo({
  cita,
  consultorio,
  reciboNumero,
  tipoAtencion,
  onCerrar,
}: {
  cita: CitaMedica;
  consultorio: string;
  reciboNumero?: string;
  tipoAtencion?: TipoAtencionTipo;
  onCerrar: () => void;
}) {
  const pagada = cita.estadoCita === 'Atendida';
  const tipoFinal = tipoAtencion || determinarTipoAtencionCita(cita);
  const concepto = obtenerEtiquetaConceptoPago(
    cita.pacienteClasificacion,
    tipoFinal
  );
  const valorTexto = cita.costoPendiente
    ? 'Valor por definir (Autorizaciones N2/N3)'
    : cita.valorCopago === 0
    ? '$0 COP (Exento)'
    : `$${cita.valorCopago.toLocaleString('es-CO')} COP`;

  return (
    <div
      onClick={onCerrar}
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-4"
    >
      <div
        id="tirilla-imprimible"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border"
      >
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                pagada
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {pagada
                ? 'Recibo Oficial de Caja · Pagado'
                : tipoFinal === 'procedimiento'
                ? 'Pre-Factura · Procedimiento / Copago'
                : 'Pre-Factura / Liquidación de Consulta'}
            </span>
            <h4 className="text-lg font-extrabold text-slate-900 mt-1">
              IPS Salud Viva · Barranquilla
            </h4>
            <p className="text-[11px] text-slate-500">
              Carrera 51B # 82 - 140, Alto Prado · NIT 901.555.202-6
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="no-print px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold"
          >
            Cerrar
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Código Cita:</span>
            <span className="font-extrabold text-sky-800">{cita.id}</span>
          </div>
          {reciboNumero && (
            <div className="flex justify-between">
              <span className="text-slate-500">N.° Recibo / Datáfono:</span>
              <span className="font-extrabold text-teal-800">{reciboNumero}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Paciente:</span>
            <span className="font-bold">
              {cita.pacienteNombre} (CC {cita.pacienteCedula})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">EPS / Régimen:</span>
            <span className="font-semibold text-right">
              {cita.pacienteEps} · {cita.pacienteClasificacion}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Servicio:</span>
            <span className="font-bold text-right">
              {cita.especialidadNombre} ({formatearDuracionVisibleCita(cita, tipoFinal ? { [cita.id]: tipoFinal } : undefined)})
            </span>
          </div>
          {cita.procedimientoNombre && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Procedimiento:</span>
              <span className="font-bold text-teal-800 text-right">
                {cita.procedimientoNombre}
              </span>
            </div>
          )}
          {cita.procedimientoDetalle && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Detalle médico:</span>
              <span className="text-slate-700 text-right">
                {cita.procedimientoDetalle}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Profesional / Consultorio:</span>
            <span className="font-semibold text-right">
              {cita.medicoNombre} · {consultorio}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha y Hora Cita:</span>
            <span className="font-bold">
              {cita.fecha} · {cita.hora}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-600 font-semibold">Concepto:</span>
            <span className="font-bold text-slate-900">{concepto}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-semibold">Medio de Pago:</span>
            <span className="font-bold">
              {cita.metodoPago ||
                (cita.costoPendiente
                  ? 'Pendiente liquidación N2/N3'
                  : cita.valorCopago === 0
                  ? 'Exento ($0)'
                  : 'Pendiente en Caja')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-300">
            <span className="text-sm font-extrabold text-slate-900">
              {pagada
                ? 'Total Pagado:'
                : cita.costoPendiente
                ? 'Estado del Valor:'
                : 'Valor a Llevar / Pagar en Caja:'}
            </span>
            <span
              className={`font-extrabold ${
                cita.costoPendiente
                  ? 'text-sm text-amber-700'
                  : 'text-lg text-emerald-700'
              }`}
            >
              {valorTexto}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 leading-relaxed">
          {cita.costoPendiente
            ? 'El valor de este procedimiento será definido por Autorizaciones (Nivel 2 o 3) tras revisar la Orden Médica y se enviará a tu correo.'
            : cita.valorCopago === 0
            ? 'Tu cita está exenta de pago antes de la consulta según el régimen vigente SGSSS.'
            : pagada
            ? 'Pago verificado y conciliado en Admisiones / Caja IPS Salud Viva.'
            : 'Este valor corresponde al pago previo obligatorio antes de ingresar a consulta (Efectivo, Datáfono o Transferencia en Admisiones).'}
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
        >
          Imprimir / Guardar Comprobante PDF
        </button>
      </div>
    </div>
  );
}

export function ModalReprogramacion({
  citaReprogramando,
  reproAreaServicio,
  setReproAreaServicio,
  reproEspecialidad,
  setReproEspecialidad,
  reproMedicoId,
  setReproMedicoId,
  reproFecha,
  setReproFecha,
  reproHora,
  setReproHora,
  reproMotivo,
  setReproMotivo,
  errorReprogramacion,
  setErrorReprogramacion,
  medicos,
  medicosLista,
  citas,
  descansosMedicos,
  auxiliarTurno,
  topeMaximoCitas,
  hoyIsoActual,
  maxFechaMesIso,
  enviandoFormulario,
  onCerrar,
  onConfirmar,
  onCancelarCita,
  modoPaciente = false,
}: {
  citaReprogramando: CitaMedica;
  reproAreaServicio: AreaServicioId;
  setReproAreaServicio: (v: AreaServicioId) => void;
  reproEspecialidad: EspecialidadId;
  setReproEspecialidad: (v: EspecialidadId) => void;
  reproMedicoId: string;
  setReproMedicoId: (v: string) => void;
  reproFecha: string;
  setReproFecha: (v: string) => void;
  reproHora: string;
  setReproHora: (v: string) => void;
  reproMotivo: string;
  setReproMotivo: (v: string) => void;
  errorReprogramacion: string;
  setErrorReprogramacion: (v: string) => void;
  medicos: MedicoConOcupacion[];
  medicosLista: MedicoBase[];
  citas: CitaMedica[];
  descansosMedicos: Record<string, DiaSemanaNum>;
  auxiliarTurno: AuxiliarTurnoConfig;
  topeMaximoCitas: number;
  hoyIsoActual: string;
  maxFechaMesIso: string;
  enviandoFormulario: boolean;
  onCerrar: () => void;
  onConfirmar: (e: React.FormEvent) => void;
  onCancelarCita: () => void;
  modoPaciente?: boolean;
}) {
  const espsReproArea = ESPECIALIDADES.filter(
    (e) => e.areaId === reproAreaServicio
  );
  const medicosTitularesRepro = medicos.filter(
    (m) => m.especialidad === reproEspecialidad
  );
  const medicoTitularSel = medicosLista.find((m) => m.id === reproMedicoId);
  const diaRepro = obtenerDiaSemanaIso(reproFecha);
  const diaDescansoMed = medicoTitularSel
    ? descansosMedicos[medicoTitularSel.id] ?? -1
    : -1;
  const medicoReproDescansa =
    Boolean(medicoTitularSel) &&
    diaDescansoMed !== -1 &&
    diaDescansoMed === diaRepro;

  const citasFechaRepro = citas.filter(
    (c) => c.id !== citaReprogramando.id && c.fecha === reproFecha
  );
  const alternativasDescanso = medicoTitularSel
    ? obtenerAlternativasPorDescanso(
        medicoTitularSel,
        reproFecha,
        medicosLista,
        descansosMedicos,
        auxiliarTurno,
        citasFechaRepro,
        topeMaximoCitas
      )
    : { colegasDisponibles: [], auxiliarDisponible: null };

  const duracionEspRepro =
    ESPECIALIDADES.find((e) => e.id === reproEspecialidad)?.duracionMin ?? 30;
  const duracionRepro =
    citaReprogramando.especialidad === reproEspecialidad &&
    citaReprogramando.duracionMin > duracionEspRepro
      ? citaReprogramando.duracionMin
      : duracionEspRepro;
  const citasOcupadasRepro = citas.filter(
    (c) =>
      c.id !== citaReprogramando.id &&
      c.medicoId === reproMedicoId &&
      c.fecha === reproFecha &&
      c.estadoCita !== 'Cancelada' &&
      c.estadoCita !== 'No asistió'
  );
  const medicoReproSaturado = citasOcupadasRepro.length >= topeMaximoCitas;
  const franjasHorariasRepro =
    reproMedicoId && reproFecha && !medicoReproSaturado && !medicoReproDescansa
      ? generarFranjasHorariasDisponibles(
          duracionRepro,
          reproFecha,
          citasOcupadasRepro.map((c) => ({
            hora: c.hora,
            duracionMin: c.duracionMin,
          }))
        )
      : [];

  const auxSuplenteObj = alternativasDescanso.auxiliarDisponible;

  return (
    <div
      onClick={onCerrar}
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {modoPaciente
                ? 'Reprogramar Mi Cita · Por Imprevisto'
                : 'Reprogramación · Anti-choques y Descansos'}
            </span>
            <h4 className="text-base font-extrabold mt-1">
              {citaReprogramando.id} · {citaReprogramando.pacienteNombre}
            </h4>
            <p className="text-xs text-slate-500">
              Actual: <strong>{citaReprogramando.especialidadNombre}</strong> ·{' '}
              {citaReprogramando.medicoNombre} ({citaReprogramando.fecha} ·{' '}
              {citaReprogramando.hora})
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
        {errorReprogramacion && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorReprogramacion}
          </div>
        )}
        <form onSubmit={onConfirmar} className="space-y-3.5 text-xs">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">1. Área / Servicio</label>
              <select
                value={reproAreaServicio}
                disabled={modoPaciente}
                onChange={(e) => {
                  const a = e.target.value as AreaServicioId;
                  setReproAreaServicio(a);
                  const primera = ESPECIALIDADES.find((x) => x.areaId === a);
                  if (primera) {
                    setReproEspecialidad(primera.id);
                    setReproMedicoId(
                      medicosLista.find((m) => m.especialidad === primera.id)
                        ?.id || ''
                    );
                  }
                  setReproHora('');
                  setErrorReprogramacion('');
                }}
                className={`${INP} font-semibold disabled:bg-slate-100 disabled:text-slate-600`}
              >
                {AREAS_SERVICIO.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">2. Especialidad</label>
              <select
                value={reproEspecialidad}
                disabled={modoPaciente}
                onChange={(e) => {
                  const esp = e.target.value;
                  setReproEspecialidad(esp);
                  setReproMedicoId(
                    medicosLista.find((m) => m.especialidad === esp)?.id || ''
                  );
                  setReproHora('');
                  setErrorReprogramacion('');
                }}
                className={`${INP} font-semibold disabled:bg-slate-100 disabled:text-slate-600`}
              >
                {espsReproArea.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.duracionMin} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">3. Especialista</label>
              <select
                value={reproMedicoId}
                onChange={(e) => {
                  setReproMedicoId(e.target.value);
                  setReproHora('');
                }}
                className={`${INP} font-semibold`}
              >
                {medicosTitularesRepro.length === 0 ? (
                  <option value="">Sin médicos</option>
                ) : (
                  medicosTitularesRepro.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} · {m.consultorio} (Hoy: {m.citasHoy}/
                      {m.capacidadMaxima})
                    </option>
                  ))
                )}
                {auxSuplenteObj && (
                  <option value={auxSuplenteObj.id}>
                    {auxSuplenteObj.nombre} · {auxSuplenteObj.consultorio}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">4. Nueva Fecha</label>
              <input
                type="date"
                min={hoyIsoActual}
                max={maxFechaMesIso}
                value={reproFecha}
                onChange={(e) => {
                  setReproFecha(e.target.value);
                  setReproHora('');
                }}
                className={`${INP} font-bold`}
              />
            </div>
          </div>

          {medicoReproDescansa && medicoTitularSel && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-amber-950">
              <p className="font-bold">
                ⚠️ {medicoTitularSel.nombre} tiene día de descanso los{' '}
                {obtenerNombreDiaSemana(diaDescansoMed)} (
                {formatearFechaLegible(reproFecha)}).
              </p>
              <p className="text-[11px]">
                Elige un colega disponible o asigna al Auxiliar Médico de Turno:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {alternativasDescanso.colegasDisponibles.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setReproMedicoId(col.id);
                      setReproHora('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-400 font-bold text-amber-900 hover:bg-amber-100"
                  >
                    {col.nombre} ({topeMaximoCitas - col.citasEseDia} cupos)
                  </button>
                ))}
                {auxSuplenteObj && (
                  <button
                    type="button"
                    onClick={() => {
                      setReproMedicoId(auxSuplenteObj.id);
                      setReproHora('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800"
                  >
                    {auxSuplenteObj.nombre}
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-bold">
                5. Franja Horaria ({franjasHorariasRepro.length} disp.)
              </label>
              {reproHora && (
                <span className="font-bold text-sky-700">
                  Elegida: {reproHora}
                </span>
              )}
            </div>
            {medicoReproDescansa ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                Selecciona arriba un colega, al auxiliar suplente u otra fecha.
              </div>
            ) : medicoReproSaturado ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                Tope diario ({topeMaximoCitas}) alcanzado.
              </div>
            ) : franjasHorariasRepro.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                Sin horarios disponibles.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 border">
                {franjasHorariasRepro.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setReproHora(h)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border ${
                      reproHora === h
                        ? 'bg-sky-600 border-sky-700 text-white'
                        : 'bg-white hover:bg-sky-50'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block font-bold mb-1">
              6. Motivo del imprevisto / Nota
            </label>
            <input
              type="text"
              placeholder={
                modoPaciente
                  ? 'Ej: Imprevisto laboral, calamidad o cambio de horario...'
                  : 'Ej: Cambio solicitado / Descanso médico / Autorización...'
              }
              value={reproMotivo}
              onChange={(e) => setReproMotivo(e.target.value)}
              className={INP}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <button
              type="submit"
              disabled={
                !reproMedicoId ||
                !reproFecha ||
                !reproHora ||
                medicoReproDescansa ||
                enviandoFormulario
              }
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5"
            >
              <Ic n="calendar" c="w-4 h-4" />
              <span>
                {enviandoFormulario
                  ? 'Guardando...'
                  : 'Confirmar y Avisar por Correo'}
              </span>
            </button>
            {!modoPaciente && (
              <button
                type="button"
                disabled={enviandoFormulario}
                onClick={onCancelarCita}
                className="py-2.5 px-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold"
              >
                Cancelar Cita
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
