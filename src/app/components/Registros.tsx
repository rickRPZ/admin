import { useState } from 'react';
import { Search, Plus, Upload, FileSpreadsheet, X, FileDown, Grid3x3, List , Filter} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { TicketView } from './TicketView';
import * as XLSX from 'xlsx';
import * as atT from '../lib/attendeeTransforms';

type TicketType =
  | 'general'
  | 'descuento_servidores'
  | 'descuento_1_dia';

export function Registros() {
  const { attendees, addAttendee, events, selectedEventId, setSelectedEventId, refreshData, addPayment } = useApp();
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  const filteredAttendees = attendees
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter(attendee => {
      const matchesSearchTerm =
      attendee.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.church.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEventTerm = selectedEventId === 'all' || attendee.eventId === selectedEventId;
      return matchesSearchTerm && matchesEventTerm;
    });

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    church: '',
    eventId: 'intercesion' as 'adoradores' | 'intercesion',
    ticketType: 'general' as TicketType,
    paymentStatus: 'pendiente' as 'pendiente' | 'pagado',
    paymentMethod: 'efectivo' as 'efectivo' | 'transferencia',
    notes: '',
    manualAmount: '',
  });

  const getAmountFromTicketType = (ticketType: TicketType) => {
    switch (ticketType) {
      case 'descuento_1':
        return 300;
      case 'descuento_2':
        return 350;
      case 'general':
        return 500;
      case 'descuento_servidores':
      case 'descuento_1_dia':
        return 0;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isManualTicket =
      formData.ticketType === 'descuento_servidores' ||
      formData.ticketType === 'descuento_1_dia';

    const manualAmountValue = Number(formData.manualAmount);
    if (isManualTicket && (!formData.manualAmount || Number.isNaN(manualAmountValue) || manualAmountValue <= 0)) {
      alert('Ingresa un monto válido para el ticket seleccionado.');
      return;
    }

    try {
      setLoading(true);
      const { manualAmount, ...attendeePayload } = formData;
      const newAttendee = await addAttendee(attendeePayload);

      await addPayment({
        attendeeId: newAttendee.id,
        paymentMethod: formData.paymentMethod,
        amount: manualAmountValue,
      });

      setShowForm(false);
      setFormData({
        fullname: '',
        phone: '',
        email: '',
        church: '',
        eventId: 'intercesion',
        ticketType: 'general',
        paymentStatus: 'pendiente',
        paymentMethod: 'efectivo',
        notes: '',
        manualAmount: '',
      });
      //setShowTicket(newAttendee.id);
    } catch (error) {
      console.error('Error creating attendee or payment:', error);
      alert('Error al crear el registro');
    } finally {
      setLoading(false);
    }
  };

  const getLastPaymentMethod = (attendeeId: string) => {
    const attendeePayments = payments
      .filter(payment => payment.attendeeId === attendeeId)
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));

    return attendeePayments.length > 0 ? attendeePayments[0].paymentMethod : '';
  };

  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = attendees.map((attendee, index) => ({
      'No.': index + 1,
      'Nombre Completo': attendee.fullname,
      'Email': attendee.email,
      'Teléfono': attendee.phone,
      'Iglesia': attendee.church,
      'Evento': atT.transformEvent(attendee.eventId),
      'Tipo de Boleto': atT.transformTicketType(attendee.ticketType),
      'Estado de Pago': atT.transformPaymentStatus(attendee.paymentStatus),
      'Método de Pago': getLastPaymentMethod(attendee.id),
      'Check-in': attendee.checkedIn ? 'SÍ' : 'NO',
      'Talleres': atT.transformWorkshops(attendee.workshops),
      'Fecha de Registro': attendee.createdAt,
      'Usuario Registro': attendee.registryUser || '',
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

  const downloadTemplate = () => {
    const templateData = [{
      'Nombre Completo': 'Juan Pérez',
      'Email': '',
      'Teléfono': '5512345678',
      'Iglesia': 'CFN',
      'Tipo de Boleto': 'general',
      'Estado de Pago': 'pendiente',
      'Método de Pago': '',
      'Talleres': '',
      'Notas': '',
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    // Add instructions sheet
    const instructions = [
      { Instrucción: 'INSTRUCCIONES PARA IMPORTACIÓN' },
      { Instrucción: '' },
      { Instrucción: '1. Complete todos los campos requeridos:' },
      { Instrucción: '   - Nombre Completo (obligatorio)' },
      { Instrucción: '   - Teléfono (obligatorio)' },
      { Instrucción: '   - Iglesia (obligatorio)' },
      { Instrucción: '   - Metodo Pago (obligatorio)' },
      { Instrucción: '   - Monto (obligatorio)' },
      { Instrucción: '' },
      { Instrucción: '2. Tipo de Boleto: general, vip, o estudiante' },
      { Instrucción: '3. Estado de Pago: pendiente, parcial, o pagado' },
      { Instrucción: '4. Método de Pago: efectivo, tarjeta, o transferencia (solo si estado no es pendiente)' },
      { Instrucción: '5. Talleres: separe múltiples talleres con comas' },
      { Instrucción: '' },
      { Instrucción: `IDs de Eventos disponibles:` },
      ...events.filter(e => e.active).map(e => ({ Instrucción: `   ${e.id} - ${e.name}` })),
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');

    XLSX.writeFile(wb, 'Plantilla_Importacion_Registros.xlsx');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // Transform data to match attendee schema
          const attendeesToImport = jsonData.map((row: any) => {
            const workshops = row['Talleres']
              ? row['Talleres'].split(',').map((w: string) => w.trim()).filter(Boolean)
              : [];

            return {
              fullName: row['Nombre Completo'],
              email: row['Email'],
              phone: String(row['Teléfono']),
              church: row['Iglesia'],
              eventId: row['ID Evento'],
              ticketType: (row['Tipo de Boleto'] || 'general').toLowerCase(),
              workshops,
              paymentStatus: (row['Estado de Pago'] || 'pendiente').toLowerCase(),
              paymentMethod: row['Método de Pago'] ? row['Método de Pago'].toLowerCase() : undefined,
              notes: row['Notas'] || '',
              checkedIn: false,
            };
          });

          // Validate required fields
          const validAttendees = attendeesToImport.filter(a =>
            a.fullName && a.email && a.phone && a.church && a.eventId
          );

          if (validAttendees.length === 0) {
            throw new Error('No se encontraron registros válidos en el archivo');
          }

          // Send to backend
          const result = await attendeesAPI.bulkCreate(validAttendees);
          setImportResults(result);

          // Refresh data
          await refreshData();
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error al procesar el archivo: ' + (error as Error).message);
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error al leer el archivo');
      setIsImporting(false);
    }

    // Reset file input
    e.target.value = '';
  };

  if (showImport) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Importar Registros</h1>
            <button
              onClick={() => {
                setShowImport(false);
                setImportResults(null);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {importResults ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resultados de Importación</h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{importResults.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Procesados</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{importResults.successCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Exitosos</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{importResults.errorCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Errores</p>
                  </div>
                </div>

                {importResults.results.errors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Errores Encontrados
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {importResults.results.errors.map((error: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-900">Fila {error.row}</p>
                          <p className="text-sm text-red-700">{error.error}</p>
                          <p className="text-xs text-red-600 mt-1">
                            {error.data.fullName || 'Sin nombre'} - {error.data.email || 'Sin email'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowImport(false);
                      setImportResults(null);
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instrucciones</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Descarga la plantilla de Excel para ver el formato requerido</li>
                  <li>Completa todos los campos obligatorios (Nombre, Email, Teléfono, Iglesia, ID Evento)</li>
                  <li>Los emails deben ser únicos para cada registro</li>
                  <li>Guarda el archivo en formato .xlsx o .csv</li>
                  <li>Sube el archivo usando el botón de abajo</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Descargar Plantilla</h2>
                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Descargar Plantilla Excel
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Cargar Archivo</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportFile}
                    disabled={isImporting}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className={`w-16 h-16 mb-4 ${isImporting ? 'text-gray-300' : 'text-blue-500'}`} />
                    {isImporting ? (
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-700 font-medium">Procesando archivo...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 font-medium mb-1">
                          Haz clic para seleccionar un archivo
                        </p>
                        <p className="text-sm text-gray-500">
                          Formatos aceptados: .xlsx, .xls, .csv
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              Evento
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="intercesion">Intercesión</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Boleto *
            </label>
            <select
              value={formData.ticketType}
              onChange={(e) => {
                const ticketType = e.target.value as TicketType;
                setFormData({
                  ...formData,
                  ticketType,
                  manualAmount:
                    ticketType === 'descuento_servidores' || ticketType === 'descuento_1_dia' || ticketType === 'general'
                      ? formData.manualAmount
                      : '',
                });
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="descuento_servidores">Servidores</option>
              <option value="descuento_1_dia">1 Día</option>
              <option value="general">General</option>
            </select>
          </div>

          {(formData.ticketType === 'descuento_servidores' || formData.ticketType === 'descuento_1_dia' || formData.ticketType === 'general') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto manual *
              </label>
              <input
                type="number"
                min="1"
                value={formData.manualAmount}
                onChange={(e) => setFormData({ ...formData, manualAmount: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa el monto"
                required
              />
            </div>
          )}

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

          {/* Import Button 
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            title="Importar desde Excel"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>*/}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/*<div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
          >
            <option value="intercesion">Intercesión</option>
          </select>
        </div>*/}
      </div>

      {viewMode === 'compact' ? (
        /* Compact View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAttendees.map(attendee => (
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
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">{attendee.phone}</p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {atT.transformTicketType(attendee.ticketType)}
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
          {filteredAttendees.map(attendee => (
            <div
              key={attendee.id}
              onClick={() => setShowTicket(attendee.id)}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{attendee.fullname}</h3>
                  <p className="text-sm text-gray-600">{attendee.phone}</p>
                  <p className="text-sm text-gray-600">{attendee.church}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      attendee.paymentStatus === 'pagado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {atT.transformPaymentStatus(attendee.paymentStatus)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {atT.transformTicketType(attendee.ticketType)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {atT.transformEvent(attendee.eventId)}
                    </span>
                    {attendee.checkedIn && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Check-in ✓
                      </span>
                    )}
                  </div>
                </div>
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
