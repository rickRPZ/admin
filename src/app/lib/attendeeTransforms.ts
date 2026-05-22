export const transformTicketType = (type: string) => {
  switch (type) {
    case 'descuento_1':
      return 'Mayo - $300';
    case 'descuento_2':
      return 'Junio - $400';
    case 'general':
      return 'Agosto - $500';
    default:
      return type;
  }
};

export const transformPaymentStatus = (status: string) => {
  switch (status) {
    case 'pagado':
      return 'Pagado';
    case 'pendiente':
      return 'Pendiente';
    default:
      return status;
  }
};

export const transformWorkshops = (workshops: unknown) => {
  if (Array.isArray(workshops) && workshops.length > 0) {
    return workshops.join(', ');
  }
  return '';
};

export const transformEvent = (eventId: string) => {
  switch (eventId) {
    case 'adoradores':
      return 'Adoradores 2026';
    default:
      return eventId;
  }
};
