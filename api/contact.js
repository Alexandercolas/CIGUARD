const { createHmac } = require('node:crypto');

const topics = {
  quote: ['QUOTE_REQUEST', 'Solicitud de cotización'],
  product: ['LEAD', 'Consulta sobre un producto'],
  partnership: ['LEAD', 'Propuesta de colaboración'],
  support: ['SUPPORT', 'Solicitud de soporte'],
  other: ['OTHER', 'Otra consulta'],
};

function field(value, max) {
  return typeof value === 'string' && value.trim().length <= max ? value.trim() : null;
}

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Usa el formulario para enviar la solicitud.' });
  }
  if (request.headers.origin !== 'https://ciguard.vercel.app') {
    return response.status(403).json({ error: 'Abre el formulario desde CIGUARD.' });
  }
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) {
    return response.status(415).json({ error: 'Formato de solicitud inválido.' });
  }
  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 12000) {
    return response.status(400).json({ error: 'Solicitud inválida o demasiado larga.' });
  }
  const name = field(body.nombre, 100);
  const email = field(body.correo, 254)?.toLowerCase();
  const company = field(body.empresa ?? '', 100);
  const phoneInput = field(body.telefono ?? '', 28);
  const message = field(body.mensaje, 2500);
  const topic = typeof body.asunto === 'string' && Object.hasOwn(topics, body.asunto) ? topics[body.asunto] : null;
  if (body.website || body.consent !== 'on' || !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || company === null || phoneInput === null || !message || message.length < 10 || !topic
      || typeof body.eventId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.eventId)) {
    return response.status(400).json({ error: 'Revisa los datos obligatorios, el correo y la aceptación de privacidad.' });
  }
  let phone = phoneInput.replace(/[\s().-]/g, '');
  if (/^8(?:09|29|49)\d{7}$/.test(phone)) phone = '+1' + phone;
  if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) {
    return response.status(400).json({ error: 'Indica el teléfono con código de país. Ejemplo: +1 809 555 0100.' });
  }

  const secret = process.env.CIGUARD_CAPTURE_SECRET;
  if (!secret) return response.status(503).json({ error: 'El formulario está temporalmente fuera de servicio.' });
  const raw = JSON.stringify({
    eventId: body.eventId,
    name, email,
    ...(phone ? { phone } : {}),
    intent: topic[0],
    subject: 'CIGUARD · ' + topic[1],
    message: company ? 'Empresa: ' + company + '\n\n' + message : message,
    campaign: 'Ciguard · Contacto web',
    medium: 'web',
    landingPage: 'https://ciguard.vercel.app/#contacto',
    consent: 'Ciguard · consentimiento de contacto · 2026-11',
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', secret).update(timestamp + '.' + raw).digest('hex');
  try {
    const result = await fetch('https://nucleo-crm-rho.vercel.app/api/capture/ciguard_web_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-nucleo-timestamp': timestamp, 'x-nucleo-signature': 'sha256=' + signature },
      body: raw, redirect: 'error', signal: AbortSignal.timeout(8000),
    });
    if (result.status === 429) return response.status(429).json({ error: 'Se alcanzó el límite de envíos. Intenta más tarde.' });
    const data = await result.json();
    if (!result.ok || typeof data.id !== 'string') throw new Error('Núcleo no confirmó la captación');
    return response.status(200).json({ reference: data.id });
  } catch {
    return response.status(502).json({ error: 'No pudimos confirmar la entrega. Conservamos lo que escribiste para que puedas reintentar.' });
  }
};
