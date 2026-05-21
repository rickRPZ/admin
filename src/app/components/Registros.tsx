import { useState } from 'react';
import { Search, Plus, Edit2, X, FileDown, Grid3x3, List } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { TicketView } from './TicketView';
import * as XLSX from 'xlsx';

export function Registros() {
  const { attendees, addAttendee } = useApp();
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    church: '',
    eventId: 'adoradores' as 'adoradores',
    ticketType: 'general' as 'general' | 'descuento_1' | 'descuento_2',
    paymentStatus: 'pendiente' as 'pendiente' | 'pagado',
    paymentMethod: 'efectivo' as 'efectivo' | 'transferencia',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAttendee = await addAttendee(formData);
      setShowForm(false);
      setShowTicket(newAttendee.id);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        church: '',
        eventId: 'adoradores',
        ticketType: 'general',
        paymentStatus: 'pendiente',
        paymentMethod: 'efectivo',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating attendee:', error);
      alert('Error al crear el registro');
    }
  };

  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = attendees.map((attendee, index) => ({
      'No.': index + 1,
      'Nombre Completo': attendee.fullname,
      'Email': attendee.email,
      'Teléfono': attendee.phone,
      'Iglesia': attendee.church,
      'Evento': attendee.eventName || attendee.eventId,
      'Tipo de Boleto': attendee.ticketType.toUpperCase(),
      'Estado de Pago': attendee.paymentStatus === 'pagado' ? 'PAGADO' : 'PENDIENTE',
      'Método de Pago': attendee.paymentMethod.charAt(0).toUpperCase() + attendee.paymentMethod.slice(1),
      'Check-in': attendee.checkedIn ? 'SÍ' : 'NO',
      'Fecha Check-in': attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString('es-MX') : '',
      'Talleres': attendee.workshops.join(', '),
      'Código QR': attendee.qrCode,
      'Fecha de Registro': new Date(attendee.createdAt).toLocaleString('es-MX'),
      'Notas': attendee.notes || '',
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');

    // Auto-size columns
    const maxWidth = 50;
    const columnWidths = Object.keys(dataToExport[0] || {}).map(key => ({
      wch: Math.min(
        Math.max(
          key.length,
          ...dataToExport.map(row => String(row[key as keyof typeof row]).length)
        ),
        maxWidth
      )
    }));
    ws['!cols'] = columnWidths;

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Registros_Evento_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  if (showTicket) {
    const attendee = attendees.find(a => a.id === showTicket);
    if (attendee) {
      return <TicketView attendee={attendee} onClose={() => setShowTicket(null)} />;
    }
  }

  if (showForm) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Registro</h1>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Iglesia *
            </label>
            <input
              type="text"
              value={formData.church}
              onChange={(e) => setFormData({ ...formData, church: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evento *
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="adoradores">Adoradores</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Boleto *
            </label>
            <select
              value={formData.ticketType}
              onChange={(e) => setFormData({ ...formData, ticketType: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="descuento_1">Mayo - $300</option>
              <option value="descuento_2">Junio - $400</option>
              <option value="general">Agosto - $500</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Pago
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Registrar Asistente
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registros</h1>

        <div className="flex items-center gap-2">
          {/* View Mode Toggles */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista compacta"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista detallada"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            disabled={attendees.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Exportar a Excel"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Compact View */}
      {viewMode === 'compact' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attendees.map(attendee => (
            <div
              key={attendee.id}
              onClick={() => setShowTicket(attendee.id)}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{attendee.fullname}</h3>
                <span className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                  attendee.paymentStatus === 'pagado' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">{attendee.email}</p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {attendee.ticketType}
                </span>
                {attendee.checkedIn && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    ✓
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed View */
        <div className="space-y-3">
          {attendees.map(attendee => (
            <div
              key={attendee.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{attendee.fullname}</h3>
                  <p className="text-sm text-gray-600 mt-1">{attendee.email}</p>
                  <p className="text-sm text-gray-600">{attendee.phone}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      attendee.paymentStatus === 'pagado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {attendee.paymentStatus === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {attendee.ticketType.toUpperCase()}
                    </span>
                    {attendee.eventName && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {attendee.eventName}
                      </span>
                    )}
                    {attendee.checkedIn && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Check-in ✓
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowTicket(attendee.id)}
                  className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 md:bottom-6 left-6 z-[60] w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center"
        title="Nuevo Registro"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
