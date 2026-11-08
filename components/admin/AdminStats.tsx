export default function AdminStats() {
  const stats = [
    { label: 'Total Réservations', value: '48', change: '+12% ce mois', color: 'border-l-ocd-orange' },
    { label: 'Lives Sur Place (Lomé)', value: '28', change: 'Studio', color: 'border-l-emerald-500' },
    { label: 'Lives À Distance', value: '20', change: 'International', color: 'border-l-blue-500' },
    { label: 'En attente de validation', value: '5', change: 'Action requise', color: 'border-l-amber-500' },
  ];

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, i) => (
        <div
          key={i}
          className={ounded-2xl border border-ocd-line/80 bg-white p-6 shadow-sm border-l-4 }
        >
          <p className='text-xs font-bold uppercase tracking-wider text-ocd-anthracite/60'>
            {stat.label}
          </p>
          <h4 className='mt-2 text-3xl font-black text-ocd-anthracite'>{stat.value}</h4>
          <span className='mt-1 inline-block text-xs font-semibold text-ocd-anthracite/50'>
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
}
