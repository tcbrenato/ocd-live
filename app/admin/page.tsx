import AdminLayout from '@/components/admin/AdminLayout';
import AdminStats from '@/components/admin/AdminStats';
import ReservationsTable, { Reservation } from '@/components/admin/ReservationsTable';

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    clientName: 'Kossi Mensah',
    email: 'kossi@example.com',
    phone: '+228 90 00 00 01',
    productName: 'Savon Noir Artisanal',
    country: 'Togo',
    format: 'onplace',
    date: '12 Mars 2026',
    timeSlot: '10:00 - 11:30',
    status: 'confirmed',
  },
  {
    id: '2',
    clientName: 'Aminatou Diallo',
    email: 'aminatou@example.com',
    phone: '+223 70 00 00 02',
    productName: 'Pagne Bogolan Moderne',
    country: 'Mali',
    format: 'remote',
    date: '14 Mars 2026',
    timeSlot: '14:00 - 15:30',
    status: 'pending',
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout activeTab='overview'>
      <div className='flex flex-col gap-8'>
        <div>
          <h2 className='text-2xl font-black text-ocd-anthracite'>Tableau de bord</h2>
          <p className='text-sm text-ocd-anthracite/60 mt-1'>
            Bienvenue dans l'espace de gestion des lives OCD.
          </p>
        </div>

        <AdminStats />

        <div className='mt-4'>
          <h3 className='text-lg font-bold text-ocd-anthracite mb-4'>Réservations récentes</h3>
          <ReservationsTable initialReservations={MOCK_RESERVATIONS} />
        </div>
      </div>
    </AdminLayout>
  );
}
