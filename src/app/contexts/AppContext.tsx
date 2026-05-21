import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { attendeesAPI, salesAPI, productsAPI, workshopsAPI, eventsAPI } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Attendee {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  eventId: string;
  eventName?: string;
  ticketType: 'general' | 'descuento mayo' | 'descuento junio';
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

interface AppContextType {
  attendees: Attendee[];
  addAttendee: (attendee: Omit<Attendee, 'id' | 'qrCode' | 'createdAt'>) => Promise<Attendee>;
  updateAttendee: (id: string, updates: Partial<Attendee>) => Promise<void>;
  checkIn: (qrCode: string) => Promise<boolean>;
  products: Product[];
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => Promise<void>;
  workshops: string[];
  events: Event[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [attendeesData] = await Promise.all([
        attendeesAPI.getAll(),
      ]);

      setAttendees(attendeesData.attendees || []);
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
        refreshData,
        loading,
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
