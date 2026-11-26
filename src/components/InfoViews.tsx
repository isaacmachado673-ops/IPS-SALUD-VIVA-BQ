import React, { useState } from 'react';
import {
  AREAS_SERVICIO,
  ESPECIALIDADES,
  obtenerTarifaParticularEspecialidad,
  obtenerValorReferencialProcedimiento,
  type TarifasConfig,
} from '../data/saludVivaData';
import { CORREO_INSTITUCIONAL } from '../services/mailer';

export function NormativaSgsssView({
  tarifas,
  tarifasParticulares,
  tarifasProcedimientos,
}: {
  tarifas: TarifasConfig;
  tarifasParticulares: Record<string, number>;
  tarifasProcedimientos: Record<string, number>;
}) {
  const [mostrarTablaParticulares, setMostrarTablaParticulares] = useState(false);
  const [busquedaEsp, setBusquedaEsp] = useState('');

  const espsFiltradas = ESPECIALIDADES.filter((e) => {
    const q = busquedaEsp.trim().toLowerCase();
    return !q || e.nombre.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Marco Normativo SGSSS Colombia · Cuotas Moderadoras, Copagos y Particulares
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Acuerdo 260 de 2004, Decreto 1652 de 2022, UVB vigente y Ley 1581 de
            2012 (Habeas Data).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
            <h3 className="font-extrabold text-sky-950 text-sm">
              1. Cuota Moderadora (Consultas Médicas)
            </h3>
            <p className="text-sky-900 leading-relaxed">
              Aplica para <strong>Régimen Contributivo</strong> tanto en{' '}
              <strong>Cotizante como en Beneficiario</strong> (Rangos A, B y C).
              Se liquida y se paga <strong>antes de ingresar a la consulta</strong>{' '}
              con el médico u odontólogo/especialista.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1.5">
            <h3 className="font-extrabold text-teal-950 text-sm">
              2. Copago (Procedimientos, Terapias y Cirugías)
            </h3>
            <p className="text-teal-900 leading-relaxed">
              El <strong>copago NO es la cuota de consulta</strong>: aplica a
              procedimientos médicos, terapias, cirugías o ayudas diagnósticas
              cubiertas. En el Contributivo aplica a <strong>Beneficiarios</strong>{' '}
              (Rango A: 11,5%, Rango B: 17,3%, Rango C: 23% del servicio; la EPS
              cubre el resto). Los <strong>Cotizantes PBS están exentos de copago</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Tabla de Liquidación por Tipo de Atención y Soportes
            </h3>
            <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-lg">
              Consultas: Medicina General, Odontología y Vacunación son sin documentos · Optometría y Audiología piden solo Orden Médica · Las demás piden Orden y Autorización · Procedimientos: Orden o Autorización
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse bg-white rounded-xl overflow-hidden border">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-2.5 font-bold">Tipo de Atención</th>
                  <th className="p-2.5 font-bold">Cotizante Contributivo</th>
                  <th className="p-2.5 font-bold">Beneficiario Contributivo</th>
                  <th className="p-2.5 font-bold">Subsidiado / No Asegurado</th>
                  <th className="p-2.5 font-bold">Particular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-sky-900">
                    Consulta Médica / Valoración
                  </td>
                  <td className="p-2.5">Cuota Moderadora (Rango A/B/C)</td>
                  <td className="p-2.5">Cuota Moderadora (Rango A/B/C)</td>
                  <td className="p-2.5 font-semibold text-emerald-700">$0 COP (Exento)</td>
                  <td className="p-2.5">Tarifa Consulta Particular</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-teal-900">
                    Procedimiento / Terapia / Tratamiento
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-700">
                    $0 COP (Exento de Copago PBS)
                  </td>
                  <td className="p-2.5 font-semibold text-teal-800">
                    Copago: 11,5% (A) · 17,3% (B) · 23% (C)
                  </td>
                  <td className="p-2.5">
                    Rango A: $0 · Rango B/C: Copago 10%
                  </td>
                  <td className="p-2.5">Tarifa Procedimiento Particular</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-3 font-bold">Régimen</th>
                <th className="p-3 font-bold">Tipo de Afiliado</th>
                <th className="p-3 font-bold">Rango / Categoría</th>
                <th className="p-3 font-bold">Consulta Médica (Antes de cita)</th>
                <th className="p-3 font-bold">Procedimiento / Terapia (Copago)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                [
                  'Contributivo',
                  'Cotizante',
                  'Rango A / B / C',
                  `A: $${tarifas.A.toLocaleString('es-CO')} · B: $${tarifas.B.toLocaleString('es-CO')} · C: $${tarifas.C.toLocaleString('es-CO')}`,
                  '$0 COP (Exento de Copago PBS)',
                  'text-emerald-700',
                ],
                [
                  'Contributivo',
                  'Beneficiario',
                  'Rango A (< 2 SMLMV)',
                  `$${tarifas.A.toLocaleString('es-CO')} COP (Cuota Moderadora)`,
                  'Copago 11,5% del servicio (EPS cubre 88,5%)',
                  'text-teal-800',
                ],
                [
                  'Contributivo',
                  'Beneficiario',
                  'Rango B (2 a 5 SMLMV)',
                  `$${tarifas.B.toLocaleString('es-CO')} COP (Cuota Moderadora)`,
                  'Copago 17,3% del servicio (EPS cubre 82,7%)',
                  'text-teal-800',
                ],
                [
                  'Contributivo',
                  'Beneficiario',
                  'Rango C (> 5 SMLMV)',
                  `$${tarifas.C.toLocaleString('es-CO')} COP (Cuota Moderadora)`,
                  'Copago 23% del servicio (EPS cubre 77%)',
                  'text-teal-800',
                ],
                [
                  'Subsidiado',
                  'Afiliado subsidiado',
                  'Rango A / B / C (SISBÉN IV)',
                  '$0 COP (Exento)',
                  'Rango A: $0 · Rango B/C: Copago 10%',
                  'text-emerald-700',
                ],
                [
                  'Población no asegurada',
                  'No aplica',
                  'SISBÉN en trámite / Sin EPS',
                  '$0 COP (Exento)',
                  '$0 COP (Exento)',
                  'text-emerald-700',
                ],
                [
                  'Particular',
                  'No aplica',
                  'Sin EPS (Tarifa plena según especialidad)',
                  'Según especialidad (ver tabla)',
                  'Tarifa plena de procedimiento',
                  'text-slate-900',
                ],
              ].map(([reg, tipo, rng, conc, val, cls]) => (
                <tr key={`${reg}-${tipo}-${rng}`}>
                  <td className="p-3 font-semibold">{reg}</td>
                  <td className="p-3">{tipo}</td>
                  <td className="p-3">{rng}</td>
                  <td className="p-3 font-semibold text-sky-700">{conc}</td>
                  <td className={`p-3 font-bold ${cls}`}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tarifario de Consultas Particulares por Especialidad ({ESPECIALIDADES.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Aplica únicamente para pacientes registrados bajo modalidad Particular.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarTablaParticulares((v) => !v)}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
            >
              {mostrarTablaParticulares
                ? 'Ocultar Tarifario Particular'
                : 'Ver Tarifario Particular (51 Especialidades)'}
            </button>
          </div>

          {mostrarTablaParticulares && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Buscar especialidad..."
                value={busquedaEsp}
                onChange={(e) => setBusquedaEsp(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <div className="max-h-80 overflow-y-auto border rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 border-b">
                    <tr>
                      <th className="p-2.5 font-bold">Grupo / Área</th>
                      <th className="p-2.5 font-bold">Especialidad</th>
                      <th className="p-2.5 font-bold text-center">
                        Duración Consulta
                      </th>
                      <th className="p-2.5 font-bold text-right">
                        Consulta Particular
                      </th>
                      <th className="p-2.5 font-bold text-right">
                        Procedimiento / Ref.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {espsFiltradas.map((esp) => {
                      const areaNom =
                        AREAS_SERVICIO.find((a) => a.id === esp.areaId)?.nombre ||
                        esp.areaId;
                      const val = obtenerTarifaParticularEspecialidad(
                        esp.id,
                        tarifasParticulares,
                        tarifas.particular
                      );
                      const valProc = obtenerValorReferencialProcedimiento(
                        esp.id,
                        tarifasParticulares,
                        tarifas.particular,
                        tarifasProcedimientos,
                        tarifas.particularProcedimiento
                      );
                      return (
                        <tr key={esp.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500">{areaNom}</td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            {esp.nombre}
                          </td>
                          <td className="p-2.5 text-center">
                            {[
                              'fisioterapia',
                              'terapia_ocupacional',
                              'terapia_respiratoria',
                              'ecografia_diagnostica',
                              'toma_muestras_lab',
                            ].includes(esp.id)
                              ? 'Variable (30–120 min)'
                              : `${esp.duracionMin} min`}
                          </td>
                          <td className="p-2.5 text-right font-extrabold text-emerald-700">
                            ${val.toLocaleString('es-CO')} COP
                          </td>
                          <td className="p-2.5 text-right font-extrabold text-teal-800">
                            ${valProc.toLocaleString('es-CO')} COP
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContactoView() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-3 text-xs">
        <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
          Sede Principal Norte
        </span>
        <h3 className="text-lg font-bold text-slate-900">
          IPS Salud Viva · Barranquilla
        </h3>
        <p>
          <strong>Dirección:</strong> Carrera 51B # 82 - 140, Alto Prado,
          Barranquilla.
        </p>
        <p>
          <strong>Horario:</strong> Lunes a Sábado · 06:00 AM – 06:00 PM.
        </p>
        <p>
          <strong>Línea:</strong> (605) 385 0000 · WhatsApp: +57 300 555 2026
        </p>
        <p>
          <strong>Correo Institucional:</strong> {CORREO_INSTITUCIONAL}
        </p>
      </div>
      <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-3 text-xs">
        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          Recomendaciones
        </span>
        <h3 className="text-lg font-bold text-slate-900">
          Requisitos para tu Consulta
        </h3>
        <ul className="space-y-2 list-disc pl-4 text-slate-600">
          <li>
            Presentarse 15 minutos antes con documento original y Pase QR.
          </li>
          <li>
            Tener soportes aprobados por Agendas y Autorizaciones (Nivel 2+).
          </li>
          <li>
            Cancelar la Cuota Moderadora (Contributivo Cotizante/Beneficiario) o
            Tarifa Particular en Admisiones antes de ingresar a consulta.
          </li>
        </ul>
      </div>
    </div>
  );
}
