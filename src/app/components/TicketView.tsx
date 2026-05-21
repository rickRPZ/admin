import { X, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Attendee } from '../contexts/AppContext';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface TicketViewProps {
  attendee: Attendee;
  onClose: () => void;
}

function getTicketUrl(qrCode: string): string {
  return `${window.location.origin}/ticket/${qrCode}`;
}

export function TicketView({ attendee, onClose }: TicketViewProps) {
  const ticketUrl = getTicketUrl(attendee.qrCode);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      setIsDownloading(true);

      // Capture the ticket as image
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Boleto-${attendee.fullName.replace(/\s+/g, '-')}-${attendee.qrCode}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Error al descargar el boleto. Por favor intenta de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Boleto Digital</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-[#3F0D18] text-[#E9E2D0] py-3 rounded-lg font-medium hover:bg-[#5a1424] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? 'Generando...' : 'Descargar'}
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#012235] text-[#E9E2D0] py-3 rounded-lg font-medium hover:bg-[#013a5a] transition-colors">
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${
            attendee.paymentStatus === 'pagado'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-orange-50 border-2 border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado de Pago</p>
                <p className={`font-semibold ${
                  attendee.paymentStatus === 'pagado' ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {attendee.paymentStatus === 'pagado' ? '✓ Pagado' : '⏱ Pendiente'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Método</p>
                <p className="font-semibold capitalize text-gray-900">{attendee.paymentMethod}</p>
              </div>
            </div>
          </div>

          {attendee.checkedIn && attendee.checkedInAt && (
            <div className="bg-[#012235] bg-opacity-10 border-2 border-[#012235] border-opacity-30 p-4 rounded-xl mb-6">
              <p className="text-sm text-[#012235] font-medium">✓ Check-in Realizado</p>
              <p className="text-sm text-[#3F0D18] mt-1">
                {new Date(attendee.checkedInAt).toLocaleString('es-MX', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          )}

          <div ref={ticketRef} className="bg-gradient-to-br from-[#3F0D18] to-[#012235] rounded-2xl p-6 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#E9E2D0' }}>
                {attendee.eventName || 'Evento'}
              </h3>
              <p className="text-[#E9E2D0] opacity-80">Sistema de Eventos</p>
            </div>

            <div className="bg-[#E9E2D0] rounded-xl p-4 mb-6">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={ticketUrl}
                  size={200}
                  level="H"
                  fgColor="#3F0D18"
                  bgColor="#E9E2D0"
                />
              </div>
              <p className="text-center text-[#3F0D18] text-sm mt-3 font-mono break-all px-2 font-semibold">
                {attendee.qrCode}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[#E9E2D0] opacity-80 text-sm">Nombre</p>
                <p className="font-semibold text-lg text-[#E9E2D0]">{attendee.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#E9E2D0] opacity-80 text-sm">Iglesia</p>
                  <p className="font-medium text-[#E9E2D0]">{attendee.church}</p>
                </div>
                <div>
                  <p className="text-[#E9E2D0] opacity-80 text-sm">Tipo de Acceso</p>
                  <p className="font-medium uppercase text-[#E9E2D0]">{attendee.ticketType}</p>
                </div>
              </div>

              <div>
                <p className="text-[#E9E2D0] opacity-80 text-sm">Fecha</p>
                <p className="font-medium text-[#E9E2D0]">Viernes, 1 de Mayo 2026</p>
              </div>

              <div>
                <p className="text-[#E9E2D0] opacity-80 text-sm mb-2">Talleres Registrados</p>
                <div className="space-y-1">
                  {attendee.workshops.map((workshop, index) => (
                    <div key={index} className="bg-[#E9E2D0] bg-opacity-20 px-3 py-2 rounded-lg text-sm text-[#E9E2D0]">
                      {workshop}
                    </div>
                  ))}
                  {attendee.workshops.length === 0 && (
                    <p className="text-[#E9E2D0] opacity-80 text-sm italic">Sin talleres asignados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
