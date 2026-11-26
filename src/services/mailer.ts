import { escaparHtml } from '../data/saludVivaData';

export const APPS_SCRIPT_EMAIL_URL =
  'https://script.google.com/macros/s/AKfycbzgi5rotfRnoeGNiiJmwmlTG8bV3A0m9OF1hJdjMc5MDrANWUnjwF-j_iRvcf34FBZbBQ/exec';
export const APPS_SCRIPT_TOKEN = 'IPS-SALUD-VIVA-2026';
export const CORREO_INSTITUCIONAL = 'ipsvivasalud@gmail.com';

export interface PayloadCorreoAppsScript {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function enviarCorreoAppsScript(
  payload: PayloadCorreoAppsScript
): Promise<{ ok: boolean; error?: string }> {
  if (!payload.to || !payload.to.includes('@')) {
    return { ok: false, error: 'Correo de destino inválido' };
  }
  try {
    const res = await fetch(APPS_SCRIPT_EMAIL_URL, {
      method: 'POST',
      credentials: 'omit',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        token: APPS_SCRIPT_TOKEN,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: raw || `HTTP ${res.status}` };
    }
    try {
      const parsed = JSON.parse(raw) as { ok?: boolean; error?: string };
      if (parsed && parsed.ok === false) {
        return { ok: false, error: parsed.error || 'Error en Apps Script' };
      }
    } catch {
      // Si responde 200 sin JSON estricto, asumimos entrega aceptada si no hubo HTML de error
      if (raw.toLowerCase().includes('no se pudo abrir')) {
        return { ok: false, error: 'Error de acceso en Google Apps Script' };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error de red al enviar correo',
    };
  }
}

export interface DatosFacturaCorreo {
  facturaId: string;
  reciboNumero?: string;
  citaId: string;
  pacienteNombre: string;
  pacienteCedula: string;
  pacienteEps: string;
  pacienteClasificacion: string;
  conceptoPago: string;
  especialidad: string;
  procedimientoNombre?: string;
  procedimientoDetalle?: string;
  costoPendiente?: boolean;
  medico: string;
  consultorio: string;
  fechaCita: string;
  horaCita: string;
  valorTexto: string;
  metodoPago: string;
  estadoPago: string;
  fechaEmision: string;
}

export function construirHtmlFacturaORecibo(d: DatosFacturaCorreo): {
  subject: string;
  html: string;
  text: string;
} {
  const esPagado = d.estadoPago.toUpperCase().includes('PAGADO');
  const titulo = esPagado
    ? 'Recibo Oficial de Caja - IPS Salud Viva'
    : 'Pre-Factura / Liquidación de Cita - IPS Salud Viva';
  const subject = `${esPagado ? 'Recibo de Caja' : 'Factura / Cita'} ${d.citaId} - IPS Salud Viva`;
  const colorBadge = esPagado ? '#0f766e' : '#0284c7';

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:${colorBadge};color:#ffffff;padding:20px 24px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9">IPS Salud Viva · Barranquilla</div>
        <h2 style="margin:6px 0 0;font-size:20px">${escaparHtml(titulo)}</h2>
      </div>
      <div style="padding:24px;font-size:13px;line-height:1.55">
        <p style="margin:0 0 14px">Hola <strong>${escaparHtml(d.pacienteNombre)}</strong>, adjuntamos el detalle de tu comprobante:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:6px 0;color:#64748b">N.° Documento / Factura:</td><td style="padding:6px 0;font-weight:bold;text-align:right">${escaparHtml(d.facturaId)}</td></tr>
          ${d.reciboNumero ? `<tr><td style="padding:6px 0;color:#64748b">Recibo / Voucher Caja:</td><td style="padding:6px 0;font-weight:bold;text-align:right;color:#0f766e">${escaparHtml(d.reciboNumero)}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b">Código Cita:</td><td style="padding:6px 0;font-weight:bold;text-align:right">${escaparHtml(d.citaId)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Cédula Paciente:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.pacienteCedula)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">EPS / Régimen:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.pacienteEps)} (${escaparHtml(d.pacienteClasificacion)})</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Especialidad:</td><td style="padding:6px 0;font-weight:bold;text-align:right">${escaparHtml(d.especialidad)}</td></tr>
          ${d.procedimientoNombre ? `<tr><td style="padding:6px 0;color:#64748b">Procedimiento:</td><td style="padding:6px 0;font-weight:bold;text-align:right;color:#0f766e">${escaparHtml(d.procedimientoNombre)}</td></tr>` : ''}
          ${d.procedimientoDetalle ? `<tr><td style="padding:6px 0;color:#64748b">Detalle / Indicación:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.procedimientoDetalle)}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b">Profesional / Consultorio:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.medico)} · ${escaparHtml(d.consultorio)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Fecha y Hora:</td><td style="padding:6px 0;font-weight:bold;text-align:right">${escaparHtml(d.fechaCita)} · ${escaparHtml(d.horaCita)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Concepto:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.conceptoPago)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Medio de Pago:</td><td style="padding:6px 0;text-align:right">${escaparHtml(d.metodoPago)}</td></tr>
          <tr style="border-top:2px solid #e2e8f0"><td style="padding:10px 0;font-weight:bold;font-size:15px">${d.costoPendiente ? 'Valor del Procedimiento:' : 'Total a Pagar / Pagado:'}</td><td style="padding:10px 0;font-weight:bold;font-size:16px;text-align:right;color:${d.costoPendiente ? '#b45309' : colorBadge}">${escaparHtml(d.costoPendiente ? 'Por definir en Autorizaciones (N2/N3)' : d.valorTexto)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b">Estado:</td><td style="padding:4px 0;font-weight:bold;text-align:right">${escaparHtml(d.estadoPago)}</td></tr>
        </table>
        <div style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:12px;color:#334155">
          Preséntate <strong>15 minutos antes</strong> en Carrera 51B # 82 - 140, Alto Prado, Barranquilla, con tu documento original y Pase QR. Emisión: ${escaparHtml(d.fechaEmision)}.
        </div>
      </div>
    </div>
  </div>`;

  const text = `${titulo}\nFactura: ${d.facturaId}${d.reciboNumero ? ` | Recibo: ${d.reciboNumero}` : ''}\nCita: ${d.citaId}\nPaciente: ${d.pacienteNombre} (${d.pacienteCedula})\nEspecialidad: ${d.especialidad}${d.procedimientoNombre ? `\nProcedimiento: ${d.procedimientoNombre}` : ''}\nMédico: ${d.medico} (${d.consultorio})\nFecha/Hora: ${d.fechaCita} ${d.horaCita}\nConcepto: ${d.conceptoPago}\nValor: ${d.costoPendiente ? 'Por definir en Autorizaciones (N2/N3)' : d.valorTexto}\nMedio: ${d.metodoPago} | Estado: ${d.estadoPago}`;

  return { subject, html, text };
}

export function construirHtmlNotificacionCita(d: {
  asunto: string;
  titulo: string;
  citaId: string;
  pacienteNombre: string;
  mensaje: string;
  especialidad: string;
  procedimientoNombre?: string;
  medico: string;
  consultorio: string;
  fechaCita: string;
  horaCita: string;
}): { subject: string; html: string; text: string } {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:#0284c7;color:#ffffff;padding:18px 24px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9">IPS Salud Viva · Barranquilla</div>
        <h2 style="margin:6px 0 0;font-size:18px">${escaparHtml(d.titulo)}</h2>
      </div>
      <div style="padding:24px;font-size:13px;line-height:1.6">
        <p style="margin:0 0 12px">Hola <strong>${escaparHtml(d.pacienteNombre)}</strong>,</p>
        <p style="margin:0 0 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:12px;color:#0c4a6e">${escaparHtml(d.mensaje)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:5px 0;color:#64748b">Código Cita:</td><td style="padding:5px 0;font-weight:bold;text-align:right">${escaparHtml(d.citaId)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Especialidad:</td><td style="padding:5px 0;text-align:right">${escaparHtml(d.especialidad)}</td></tr>
          ${d.procedimientoNombre ? `<tr><td style="padding:5px 0;color:#64748b">Procedimiento:</td><td style="padding:5px 0;font-weight:bold;text-align:right;color:#0f766e">${escaparHtml(d.procedimientoNombre)}</td></tr>` : ''}
          <tr><td style="padding:5px 0;color:#64748b">Profesional:</td><td style="padding:5px 0;text-align:right">${escaparHtml(d.medico)} · ${escaparHtml(d.consultorio)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Fecha y Hora:</td><td style="padding:5px 0;font-weight:bold;text-align:right">${escaparHtml(d.fechaCita)} · ${escaparHtml(d.horaCita)}</td></tr>
        </table>
      </div>
    </div>
  </div>`;
  const text = `${d.titulo}\nHola ${d.pacienteNombre}:\n${d.mensaje}\nCita: ${d.citaId} | ${d.especialidad}${d.procedimientoNombre ? ` | Proc: ${d.procedimientoNombre}` : ''} | ${d.medico} (${d.consultorio}) | ${d.fechaCita} ${d.horaCita}`;
  return { subject: d.asunto, html, text };
}

export function construirHtmlPinTemporal(d: {
  pacienteNombre: string;
  pinTemp: string;
  fecha: string;
}): { subject: string; html: string; text: string } {
  const subject = 'PIN Temporal de Seguridad - IPS Salud Viva';
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:#0f766e;color:#ffffff;padding:18px 24px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9">IPS Salud Viva · Portal Pacientes</div>
        <h2 style="margin:6px 0 0;font-size:18px">🔐 Recuperación de PIN Temporal</h2>
      </div>
      <div style="padding:24px;font-size:13px;line-height:1.6">
        <p>Hola <strong>${escaparHtml(d.pacienteNombre)}</strong>,</p>
        <p>Tu PIN temporal de 4 dígitos para ingresar al portal (${escaparHtml(d.fecha)}) es:</p>
        <div style="text-align:center;margin:18px 0">
          <span style="display:inline-block;padding:12px 28px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:26px;font-weight:bold;letter-spacing:8px">${escaparHtml(d.pinTemp)}</span>
        </div>
        <p style="color:#475569;font-size:12px">Úsalo para ingresar y actualízalo desde la opción "Editar mis datos".</p>
      </div>
    </div>
  </div>`;
  const text = `IPS Salud Viva - PIN Temporal: ${d.pinTemp}. Úsalo para ingresar al portal y cámbialo en "Editar mis datos".`;
  return { subject, html, text };
}
