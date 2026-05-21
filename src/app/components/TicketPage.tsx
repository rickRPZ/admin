import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { TicketView } from './TicketView';
import { Loader2 } from 'lucide-react';

export function TicketPage() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { attendees } = useApp();
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (qrCode && attendees.length > 0) {
      const found = attendees.find(a => a.qrCode === qrCode);
      if (found) {
        setAttendee(found);
      }
      setLoading(false);
    }
  }, [qrCode, attendees]);

  if (loading || attendees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando boleto...</p>
        </div>
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Boleto no encontrado</h2>
          <p className="text-gray-600 mb-6">
            El código QR escaneado no corresponde a ningún boleto registrado.
          </p>
          <button
            onClick={() => navigate('/checkin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ir a Check-in
          </button>
        </div>
      </div>
    );
  }

  return <TicketView attendee={attendee} onClose={() => navigate(-1)} />;
}
