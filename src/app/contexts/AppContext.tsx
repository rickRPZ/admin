import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { attendeesAPI, salesAPI, productsAPI, workshopsAPI, eventsAPI } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Attendee {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  eventId: string;
  eventName?: string;
  ticketType: 'general' | 'vip' | 'estudiante';
  workshops: string[];
  paymentStatus: 'pagado' | 'pendiente';
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
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
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  timestamp: string;
}

interface AppContextType {
  attendees: Attendee[];
  addAttendee: (attendee: Omit<Attendee, 'id' | 'qrCode' | 'createdAt'>, evidenceFile?: File) => Promise<Attendee>;
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
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [attendeesData, salesData, productsData, workshopsData, eventsData] = await Promise.all([
        attendeesAPI.getAll(),
        salesAPI.getAll(),
        productsAPI.getAll(),
        workshopsAPI.getAll(),
        eventsAPI.getAll(),
      ]);

      setAttendees(attendeesData.attendees || []);
      setSales(salesData.sales || []);
      setProducts(productsData.products || []);
      setWorkshops(workshopsData.workshops || []);
      setEvents(eventsData.events || []);
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

  const addAttendee = async (attendeeData: Omit<Attendee, 'id' | 'qrCode' | 'createdAt'>, evidenceFile?: File) => {
    try {
      const { attendee } = await attendeesAPI.create(attendeeData, evidenceFile);
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

  const addSale = async (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    try {
      const { sale } = await salesAPI.create(saleData);
      setSales(prev => [...prev, sale]);
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        attendees,
        addAttendee,
        updateAttendee,
        checkIn,
        products,
        sales,
        addSale,
        workshops,
        events,
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
