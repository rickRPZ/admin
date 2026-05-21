import { projectId, publicAnonKey , API_URL} from '/utils/supabase/info';

let accessToken: string | null = null;

const API_BASE = API_URL;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Attendees API
export const attendeesAPI = {
  getAll: () => fetchAPI('/attendees'),
  create: (data: any) => fetchAPI('/attendees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/attendees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateQrCode: (id: string, qrCode: string) => fetchAPI(`/attendees/${id}/qr-code`, {
    method: 'PUT',
    body: JSON.stringify({ qrCode }),
  }),
  checkIn: (qrCode: string) => fetchAPI('/checkin', {
    method: 'POST',
    body: JSON.stringify({ qrCode }),
  }),
};

// Sales API
export const salesAPI = {
  getAll: () => fetchAPI('/sales'),
  create: (data: any) => fetchAPI('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Products API
export const productsAPI = {
  getAll: () => fetchAPI('/products'),
};

// Workshops API
export const workshopsAPI = {
  getAll: () => fetchAPI('/workshops'),
};

// Events API
export const eventsAPI = {
  getAll: () => fetchAPI('/events'),
};

// Auth API
export const authAPI = {
  signup: (email: string, password: string, name: string, role: string) =>
    fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),
};
