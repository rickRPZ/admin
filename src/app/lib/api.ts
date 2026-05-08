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
  create: async (data: any, evidenceFile?: File) => {
    let paymentEvidence = data.paymentEvidence;

    // Upload evidence file if provided
    if (evidenceFile) {
      const formData = new FormData();
      formData.append('file', evidenceFile);
      formData.append('attendeeId', 'temp-' + Date.now());

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }

      const response = await fetch(`${API_BASE}/upload-payment-evidence`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading evidence file');
      }

      const { signedUrl } = await response.json();
      paymentEvidence = signedUrl;
    }

    return fetchAPI('/attendees', {
      method: 'POST',
      body: JSON.stringify({ ...data, paymentEvidence }),
    });
  },
  update: (id: string, data: any) => fetchAPI(`/attendees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
