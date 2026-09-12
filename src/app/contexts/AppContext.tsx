import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { attendeesAPI, paymentsAPI, salesAPI, productsAPI, workshopsAPI, eventsAPI } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Attendee {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  eventId: string;
  eventName?: string;
  ticketType: 'general' | 'descuento_1' | 'descuento_2' | 'descuento_servidores' | 'descuento_1_dia';
  workshops: string[];
  paymentStatus: 'pagado' | 'pendiente';
  paymentMethod: 'efectivo' | 'transferencia';
  paymentEvidence?: string;
  church: string;
  notes?: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category: 'playeras' | 'libros' | 'gorras' | 'accesorios';
}

export interface Sale {
  id: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: 'efectivo' | 'transferencia';
  timestamp: string;
}

export interface Payment {
  id: string;
  attendeeId: string;
  paymentMethod: 'efectivo' | 'transferencia' | string;
  amount: number;
  created_at: string;
  registryUser: string;
}

interface AppContextType {
  attendees: Attendee[];
  addAttendee: (attendee: Omit<Attendee, 'id' | 'qrCode' | 'createdAt'>) => Promise<Attendee>;
  updateAttendee: (id: string, updates: Partial<Attendee>) => Promise<void>;
  checkIn: (qrCode: string) => Promise<boolean>;
  payments: Payment[];
  getPaymentsByAttendee: (attendeeId: string) => Promise<Payment[]>;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'registryUser'>) => Promise<Payment>;
  products: Product[];
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => Promise<void>;
  workshops: string[];
  events: Event[];
  refreshData: () => Promise<void>;
  loading: boolean;
  setSelectedEventId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [attendeesData, paymentsData] = await Promise.all([
        attendeesAPI.getAll(),
        paymentsAPI.getAll(),
      ]);

      setAttendees(attendeesData.attendees || []);
      setPayments(paymentsData.payments || []);
      setSelectedEventId('intercesion'); // Set default event to 'intercesion'
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const addAttendee = async (attendeeData: Omit<Attendee, 'id' | 'qrCode' | 'createdAt'>) => {
    try {
      const { attendee } = await attendeesAPI.create(attendeeData);
      setAttendees(prev => [...prev, attendee]);
      return attendee;
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'registryUser'>) => {
    try {
      const { payment } = await paymentsAPI.create(paymentData);
      setPayments(prev => [...prev, payment]);
      return payment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const getPaymentsByAttendee = async (attendeeId: string) => {
    try {
      const { payments } = await paymentsAPI.getByAttendee(attendeeId);
      return payments || [];
    } catch (error) {
      console.error('Error fetching attendee payments:', error);
      return [];
    }
  };

  const updateAttendee = async (id: string, updates: Partial<Attendee>) => {
    try {
      const { attendee } = await attendeesAPI.update(id, updates);
      setAttendees(prev =>
        prev.map(a => (a.id === id ? attendee : a))
      );
    } catch (error) {
      console.error('Error updating attendee:', error);
      throw error;
    }
  };

  const checkIn = async (qrCode: string): Promise<boolean> => {
    try {
      const { success, attendee } = await attendeesAPI.checkIn(qrCode);
      if (success && attendee) {
        setAttendees(prev =>
          prev.map(a => (a.id === attendee.id ? attendee : a))
        );
      }
      return success;
    } catch (error) {
      console.error('Error during check-in:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        attendees,
        addAttendee,
        updateAttendee,
        checkIn,
        payments,
        getPaymentsByAttendee,
        addPayment,
        refreshData,
        loading,
        selectedEventId,
        setSelectedEventId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
