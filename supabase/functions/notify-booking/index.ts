import { createClient } from 'npm:@supabase/supabase-js@2';

type BookingWebhook = {
  type?: unknown;
  schema?: unknown;
  table?: unknown;
  record?: Record<string, unknown> | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function asText(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : '—';
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedSecret = Deno.env.get('BOOKING_WEBHOOK_SECRET');
  if (!expectedSecret) {
    console.error('Missing BOOKING_WEBHOOK_SECRET secret');
    return new Response('Notification is not configured', { status: 500 });
  }
  if (request.headers.get('x-booking-webhook-secret') !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: BookingWebhook;
  try {
    payload = await request.json();
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  if (
    payload.type !== 'INSERT' ||
    payload.schema !== 'public' ||
    payload.table !== 'bookings' ||
    !isRecord(payload.record)
  ) {
    return new Response('Unexpected database webhook payload', { status: 400 });
  }

  const bookingId = payload.record.id;
  if (typeof bookingId !== 'string' && typeof bookingId !== 'number') {
    return new Response('Booking ID is missing', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const recipient = Deno.env.get('NOTIFICATION_EMAIL');
  const sender = Deno.env.get('RESEND_FROM_EMAIL');
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !recipient || !sender) {
    console.error('Missing one or more notification secrets');
    return new Response('Notification is not configured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      'id, full_name, whatsapp, activity, product, format, country, package_name, price_fcfa, slot_id',
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    console.error('Could not load booking for notification:', bookingError?.message ?? 'not found');
    return new Response('Could not load booking', { status: 500 });
  }

  const { data: slot, error: slotError } = await supabase
    .from('slots')
    .select('starts_at')
    .eq('id', booking.slot_id)
    .maybeSingle();

  if (slotError || !slot?.starts_at) {
    console.error('Could not load booking slot:', slotError?.message ?? 'not found');
    return new Response('Could not load booking slot', { status: 500 });
  }

  const slotDate = new Date(slot.starts_at);
  if (Number.isNaN(slotDate.getTime())) {
    console.error('Booking slot has an invalid starts_at value');
    return new Response('Invalid booking slot date', { status: 500 });
  }

  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Lome',
  }).format(slotDate);
  const details = [
    ['Nom', asText(booking.full_name)],
    ['WhatsApp', asText(booking.whatsapp)],
    ['Activité', asText(booking.activity)],
    ['Produit', asText(booking.product)],
    ['Format', asText(booking.format)],
    ['Pays', asText(booking.country)],
    ['Package', asText(booking.package_name)],
    [
      'Prix',
      typeof booking.price_fcfa === 'number'
        ? `${new Intl.NumberFormat('fr-FR').format(booking.price_fcfa)} FCFA`
        : '—',
    ],
    ['Créneau (Lomé)', dateLabel],
  ] as const;
  const text = [
    'Nouvelle réservation OCD Live',
    '',
    ...details.map(([label, value]) => `${label} : ${value}`),
    '',
    `Réservation n° ${booking.id}`,
  ].join('\n');
  const html = `
    <h1>Nouvelle réservation OCD Live</h1>
    <table>
      <tbody>
        ${details
          .map(
            ([label, value]) =>
              `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
          )
          .join('')}
      </tbody>
    </table>
    <p>Réservation n° ${escapeHtml(String(booking.id))}</p>
  `;

  let resendResponse: Response;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `Nouvelle réservation OCD Live — ${asText(booking.full_name)}`,
        text,
        html,
      }),
    });
  } catch (error) {
    console.error('Resend request failed:', error);
    return new Response('Could not reach the email provider', { status: 502 });
  }

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    console.error(`Resend returned ${resendResponse.status}:`, errorBody);
    return new Response('Email provider rejected the notification', { status: 502 });
  }

  return new Response('Notification sent', { status: 200 });
});
