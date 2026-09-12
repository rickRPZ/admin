import { Users, UserCheck, DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { attendees, selectedEventId, setSelectedEventId } = useApp();
  const { user } = useAuth();

  const filteredAttendees = selectedEventId === 'all'
    ? attendees
    : attendees.filter(a => a.eventId === selectedEventId);
    
  const totalRegistered = filteredAttendees.length;
  const checkedIn = filteredAttendees.filter(a => a.checkedIn).length;
  const paidAttendees = filteredAttendees.filter(a => a.paymentStatus === 'pagado').length;
  const pendingPayments = filteredAttendees.filter(a => a.paymentStatus === 'pendiente').length;

  const stats = [
    {
      label: 'Total Registrados',
      value: totalRegistered,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      label: 'Check-ins Realizados',
      value: checkedIn,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      label: 'Pagos Pendientes',
      value: pendingPayments,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de Asistencia</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de check-in</span>
              <span className="font-semibold text-green-600">
                {totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalRegistered > 0 ? (checkedIn / totalRegistered) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Estado de Pagos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de pago</span>
              <span className="font-semibold text-blue-600">
                {totalRegistered > 0 ? Math.round((paidAttendees / totalRegistered) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${totalRegistered > 0 ? (paidAttendees / totalRegistered) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
