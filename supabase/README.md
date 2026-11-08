# Booking notifications

The `notify-booking` Edge Function sends an internal email when a row is inserted
into `public.bookings`. It loads the booking and its slot using the server-side
Supabase service-role key; no Resend or service-role key is exposed to the site.

## Configure and deploy

1. Create a Resend account, verify a sending domain, and create an API key.
   `RESEND_FROM_EMAIL` must use an address on that verified domain.
2. In **Supabase → Edge Functions → Secrets**, set:
   - `RESEND_API_KEY`: the Resend API key.
   - `RESEND_FROM_EMAIL`: the verified sender, for example
     `OCD Live <reservations@your-verified-domain.example>`.
   - `NOTIFICATION_EMAIL`: the team's recipient address.
   - `BOOKING_WEBHOOK_SECRET`: a randomly generated secret with at least 32
     random bytes.
   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge
   Functions automatically. Never add the service-role key to the frontend.
3. Install and log in to the Supabase CLI, link this project, then deploy from
   the repository root:

   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy notify-booking --no-verify-jwt
   ```

   JWT verification is disabled because database webhooks do not send a user
   JWT. The function instead requires the private shared webhook header below.
4. In **Supabase → Database → Webhooks**, create an HTTP `POST` webhook for
   schema `public`, table `bookings`, event `INSERT`. Set its URL to
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-booking` and add
   the header `x-booking-webhook-secret` with the same value as
   `BOOKING_WEBHOOK_SECRET`.
5. Create a test booking and check **Edge Functions → Logs** and the Resend
   dashboard. The booking itself is committed independently of email delivery;
   investigate function or Resend errors in those logs.
