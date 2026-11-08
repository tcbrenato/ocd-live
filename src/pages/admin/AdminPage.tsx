import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Id = string | number;

interface Slot {
  id: Id;
  starts_at: string;
  is_booked: boolean;
  is_open: boolean;
}

interface Booking {
  id: Id;
  slot_id: Id;
  format: 'onsite' | 'remote';
  full_name: string;
  whatsapp: string;
  activity: string | null;
  product: string | null;
  country: string | null;
  package_name: string | null;
  price_fcfa: number | null;
  consent: boolean;
  created_at?: string;
}

const TZ = 'Africa/Lome';

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-CA', { timeZone: TZ }); // AAAA-MM-JJ

const fmtDayLong = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  });

const fmtFCFA = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;

const waLink = (num: string, text?: string) =>
  `https://wa.me/${num.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* ---------- Connexion ---------- */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou mot de passe incorrect.');
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-ocd-line bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-black text-ocd-anthracite">Administration</h1>
        <p className="mt-1 text-sm text-ocd-anthracite/60">Connecte-toi pour continuer.</p>
        <label className="mt-6 block text-xs font-bold uppercase text-ocd-anthracite/60">
          E-mail
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ocd-line px-4 py-3 text-base font-normal normal-case text-ocd-anthracite focus:border-ocd-orange focus:outline-none"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase text-ocd-anthracite/60">
          Mot de passe
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ocd-line px-4 py-3 text-base font-normal normal-case text-ocd-anthracite focus:border-ocd-orange focus:outline-none"
          />
        </label>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-ocd-orange px-4 py-3 text-sm font-bold text-ocd-anthracite disabled:opacity-50"
        >
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <a href="/" className="mt-4 block text-center text-xs font-semibold text-ocd-anthracite/50">
          ← Retour au site
        </a>
      </form>
    </div>
  );
}

/* ---------- Page admin ---------- */
function Dashboard({ session }: { session: Session }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'bookings' | 'slots'>('bookings');
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'onsite' | 'remote'>('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [busyId, setBusyId] = useState<Id | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [b, s] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('slots').select('id, starts_at, is_booked, is_open').order('starts_at'),
    ]);
    if (b.error || s.error) {
      setError(`Chargement impossible : ${(b.error ?? s.error)?.message}`);
    }
    setBookings((b.data as Booking[]) ?? []);
    setSlots((s.data as Slot[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const slotById = useMemo(() => new Map(slots.map((s) => [String(s.id), s])), [slots]);

  const rows = useMemo(
    () =>
      bookings
        .map((b) => ({ b, slot: slotById.get(String(b.slot_id)) }))
        .sort((x, y) => (x.slot?.starts_at ?? '').localeCompare(y.slot?.starts_at ?? '')),
    [bookings, slotById],
  );

  const days = useMemo(
    () => Array.from(new Set(slots.map((s) => fmtDay(s.starts_at)))).sort(),
    [slots],
  );

  const filtered = rows.filter(({ b, slot }) => {
    if (formatFilter !== 'all' && b.format !== formatFilter) return false;
    if (dayFilter !== 'all' && (!slot || fmtDay(slot.starts_at) !== dayFilter)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [b.full_name, b.whatsapp, b.activity, b.product, b.country, b.package_name]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const now = Date.now();
  const stats = {
    total: bookings.length,
    onsite: bookings.filter((b) => b.format === 'onsite').length,
    remote: bookings.filter((b) => b.format === 'remote').length,
    revenue: bookings.reduce((sum, b) => sum + (b.price_fcfa ?? 0), 0),
    upcoming: rows.filter((r) => r.slot && new Date(r.slot.starts_at).getTime() >= now).length,
    freeSlots: slots.filter(
      (s) => s.is_open && !s.is_booked && new Date(s.starts_at).getTime() >= now,
    ).length,
  };

  /* Annuler une réservation et libérer son créneau */
  const cancelBooking = async (b: Booking) => {
    if (!window.confirm(`Annuler la réservation de ${b.full_name} ? Le créneau sera libéré.`)) return;
    setBusyId(b.id);
    const del = await supabase.from('bookings').delete().eq('id', b.id).select('id');
    if (del.error || !del.data?.length) {
      setError(`Suppression impossible : ${del.error?.message ?? 'droits insuffisants.'}`);
      setBusyId(null);
      return;
    }
    await supabase.from('slots').update({ is_booked: false }).eq('id', b.slot_id);
    setBusyId(null);
    void load();
  };

  /* Ouvrir / fermer un créneau */
  const toggleSlot = async (s: Slot) => {
    if (s.is_booked) return;
    setBusyId(s.id);
    const { error } = await supabase.from('slots').update({ is_open: !s.is_open }).eq('id', s.id);
    if (error) setError(`Modification impossible : ${error.message}`);
    setBusyId(null);
    void load();
  };

  /* Ouvrir / fermer tous les créneaux libres d'un jour */
  const setDayOpen = async (day: string, open: boolean) => {
    const ids = slots.filter((s) => fmtDay(s.starts_at) === day && !s.is_booked).map((s) => s.id);
    if (!ids.length) return;
    const { error } = await supabase.from('slots').update({ is_open: open }).in('id', ids);
    if (error) setError(`Modification impossible : ${error.message}`);
    void load();
  };

  /* Export CSV (lisible par Excel) */
  const exportCsv = () => {
    const head = ['Date', 'Heure', 'Nom', 'WhatsApp', 'Format', 'Pays', 'Activité', 'Produit', 'Package', 'Prix FCFA'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = filtered.map(({ b, slot }) =>
      [
        slot ? fmtDay(slot.starts_at) : '',
        slot ? fmtTime(slot.starts_at) : '',
        b.full_name,
        b.whatsapp,
        b.format === 'onsite' ? 'Sur place' : 'À distance',
        b.country,
        b.activity,
        b.product,
        b.package_name,
        b.price_fcfa,
      ]
        .map(esc)
        .join(';'),
    );
    const csv = '\uFEFF' + [head.map(esc).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-ocd-live-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const d = fmtDay(s.starts_at);
      map.set(d, [...(map.get(d) ?? []), s]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const bookingBySlot = useMemo(
    () => new Map(bookings.map((b) => [String(b.slot_id), b])),
    [bookings],
  );

  const statCards = [
    { label: 'Total réservations', value: stats.total, color: 'text-ocd-orange' },
    { label: 'Sur place (Lomé)', value: stats.onsite, color: 'text-ocd-anthracite' },
    { label: 'À distance', value: stats.remote, color: 'text-blue-600' },
    { label: 'Chiffre d\'affaires', value: fmtFCFA(stats.revenue), color: 'text-green-700' },
    { label: 'Lives à venir', value: stats.upcoming, color: 'text-ocd-anthracite' },
    { label: 'Créneaux libres', value: stats.freeSlots, color: 'text-ocd-anthracite' },
  ];

  const btn =
    'rounded-xl px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50';

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 text-ocd-anthracite sm:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ocd-line pb-6">
          <div>
            <h1 className="text-3xl font-black">Administration OCD Live</h1>
            <p className="text-sm text-ocd-anthracite/60">
              Gestion des créneaux et des réservations · {session.user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void load()} className={`${btn} border border-ocd-line bg-white`}>
              ↻ Actualiser
            </button>
            <a href="/" className={`${btn} bg-ocd-anthracite text-white`}>
              ← Retour au site
            </a>
            <button
              onClick={() => void supabase.auth.signOut()}
              className={`${btn} border border-ocd-line bg-white`}
            >
              Se déconnecter
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {statCards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-ocd-line bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase text-ocd-anthracite/60">{c.label}</span>
              <p className={`mt-2 text-2xl font-black sm:text-3xl ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex gap-2">
          {(
            [
              ['bookings', 'Réservations'],
              ['slots', 'Créneaux'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`${btn} ${
                tab === key ? 'bg-ocd-orange text-ocd-anthracite' : 'border border-ocd-line bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-ocd-anthracite/60">Chargement…</p>}

        {/* Réservations */}
        {tab === 'bookings' && !loading && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (nom, WhatsApp, produit…)"
                className="min-w-[220px] flex-1 rounded-xl border border-ocd-line bg-white px-4 py-2.5 text-sm focus:border-ocd-orange focus:outline-none"
              />
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as typeof formatFilter)}
                className="rounded-xl border border-ocd-line bg-white px-3 py-2.5 text-sm"
              >
                <option value="all">Tous les formats</option>
                <option value="onsite">Sur place</option>
                <option value="remote">À distance</option>
              </select>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="rounded-xl border border-ocd-line bg-white px-3 py-2.5 text-sm"
              >
                <option value="all">Tous les jours</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {fmtDayLong(d)}
                  </option>
                ))}
              </select>
              <button onClick={exportCsv} className={`${btn} bg-ocd-anthracite text-white`}>
                ⬇ Export CSV
              </button>
            </div>

            <p className="text-xs text-ocd-anthracite/60">
              {filtered.length} réservation{filtered.length > 1 ? 's' : ''} affichée
              {filtered.length > 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-ocd-line bg-white p-8 text-center text-sm text-ocd-anthracite/60">
                Aucune réservation à afficher.
                {bookings.length === 0 &&
                  " Si tu en attends, vérifie que ton e-mail figure bien dans la table admin_emails (étape 2)."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-ocd-line bg-white shadow-sm">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-ocd-line bg-ocd-paper/50 text-xs uppercase text-ocd-anthracite/60">
                    <tr>
                      <th className="px-4 py-3">Créneau</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Format</th>
                      <th className="px-4 py-3">Activité / produit</th>
                      <th className="px-4 py-3">Package</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(({ b, slot }) => (
                      <tr key={String(b.id)} className="border-b border-ocd-line/60 last:border-0 align-top">
                        <td className="px-4 py-3 font-semibold">
                          {slot ? (
                            <>
                              {fmtDayLong(fmtDay(slot.starts_at))}
                              <br />
                              <span className="text-ocd-anthracite/60">{fmtTime(slot.starts_at)}</span>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{b.full_name}</div>
                          <div className="text-ocd-anthracite/60">{b.whatsapp}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              b.format === 'onsite'
                                ? 'bg-ocd-orange/15 text-ocd-orange-dark'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {b.format === 'onsite' ? 'Sur place' : 'À distance'}
                          </span>
                          {b.country && <div className="mt-1 text-xs text-ocd-anthracite/60">{b.country}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div>{b.activity || '—'}</div>
                          <div className="text-ocd-anthracite/60">{b.product || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{b.package_name || '—'}</div>
                          <div className="font-semibold text-ocd-orange-dark">
                            {b.price_fcfa != null ? fmtFCFA(b.price_fcfa) : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={waLink(
                                b.whatsapp,
                                `Bonjour ${b.full_name}, c'est OCD Live. Nous confirmons ton live${
                                  slot ? ` du ${fmtDayLong(fmtDay(slot.starts_at))} à ${fmtTime(slot.starts_at)}` : ''
                                }.`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              WhatsApp
                            </a>
                            <button
                              onClick={() => void cancelBooking(b)}
                              disabled={busyId === b.id}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Créneaux */}
        {tab === 'slots' && !loading && (
          <section className="flex flex-col gap-6">
            <p className="text-sm text-ocd-anthracite/70">
              Clique sur un créneau libre pour le fermer (il n'est plus proposé aux clients) ou le rouvrir.
              Un créneau réservé ne peut pas être fermé : annule d'abord la réservation.
            </p>
            {slotsByDay.map(([day, daySlots]) => (
              <div key={day} className="rounded-2xl border border-ocd-line bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold capitalize">{fmtDayLong(day)}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void setDayOpen(day, false)}
                      className={`${btn} border border-ocd-line`}
                    >
                      Fermer le jour
                    </button>
                    <button
                      onClick={() => void setDayOpen(day, true)}
                      className={`${btn} border border-ocd-line`}
                    >
                      Ouvrir le jour
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {daySlots.map((s) => {
                    const booking = bookingBySlot.get(String(s.id));
                    const style = s.is_booked
                      ? 'bg-ocd-anthracite text-white cursor-not-allowed'
                      : s.is_open
                        ? 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-400 line-through hover:bg-gray-200';
                    return (
                      <button
                        key={String(s.id)}
                        onClick={() => void toggleSlot(s)}
                        disabled={busyId === s.id}
                        title={booking ? `Réservé : ${booking.full_name}` : s.is_open ? 'Ouvert' : 'Fermé'}
                        className={`rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${style}`}
                      >
                        {fmtTime(s.starts_at)}
                        <span className="mt-0.5 block truncate font-medium opacity-80">
                          {booking ? booking.full_name : s.is_open ? 'Libre' : 'Fermé'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------- Point d'entrée ---------- */
export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  return session ? <Dashboard session={session} /> : <Login />;
}