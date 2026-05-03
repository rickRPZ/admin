import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
};

// Health check endpoint
app.get("/make-server-20ba56b2/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ROUTES =============

app.post("/make-server-20ba56b2/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true,
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Error creating user: ' + error.message }, 500);
  }
});

// ============= ATTENDEE ROUTES =============

app.get("/make-server-20ba56b2/attendees", requireAuth, async (c) => {
  try {
    const attendees = await kv.getByPrefix('attendee:');
    return c.json({ attendees });
  } catch (error) {
    console.log('Error fetching attendees:', error);
    return c.json({ error: 'Error fetching attendees: ' + error.message }, 500);
  }
});

app.post("/make-server-20ba56b2/attendees", requireAuth, async (c) => {
  try {
    const attendeeData = await c.req.json();
    const id = crypto.randomUUID();
    const qrCode = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get event name
    const events = await kv.get('events') || [];
    const event = events.find((e: any) => e.id === attendeeData.eventId);

    const attendee = {
      ...attendeeData,
      id,
      qrCode,
      eventName: event?.name || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`attendee:${id}`, attendee);
    return c.json({ attendee });
  } catch (error) {
    console.log('Error creating attendee:', error);
    return c.json({ error: 'Error creating attendee: ' + error.message }, 500);
  }
});

app.put("/make-server-20ba56b2/attendees/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`attendee:${id}`);
    if (!existing) {
      return c.json({ error: 'Attendee not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`attendee:${id}`, updated);

    return c.json({ attendee: updated });
  } catch (error) {
    console.log('Error updating attendee:', error);
    return c.json({ error: 'Error updating attendee: ' + error.message }, 500);
  }
});

app.post("/make-server-20ba56b2/checkin", requireAuth, async (c) => {
  try {
    const { qrCode } = await c.req.json();

    const attendees = await kv.getByPrefix('attendee:');
    const attendee = attendees.find((a: any) => a.qrCode === qrCode);

    if (!attendee) {
      return c.json({ success: false, message: 'QR code not found' }, 404);
    }

    if (attendee.checkedIn) {
      return c.json({ success: false, message: 'Already checked in', attendee }, 400);
    }

    const updated = {
      ...attendee,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    };

    await kv.set(`attendee:${attendee.id}`, updated);
    return c.json({ success: true, attendee: updated });
  } catch (error) {
    console.log('Error during check-in:', error);
    return c.json({ error: 'Error during check-in: ' + error.message }, 500);
  }
});

// ============= SALES ROUTES =============

app.get("/make-server-20ba56b2/sales", requireAuth, async (c) => {
  try {
    const sales = await kv.getByPrefix('sale:');
    return c.json({ sales });
  } catch (error) {
    console.log('Error fetching sales:', error);
    return c.json({ error: 'Error fetching sales: ' + error.message }, 500);
  }
});

app.post("/make-server-20ba56b2/sales", requireAuth, async (c) => {
  try {
    const saleData = await c.req.json();
    const id = crypto.randomUUID();

    const sale = {
      ...saleData,
      id,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`sale:${id}`, sale);
    return c.json({ sale });
  } catch (error) {
    console.log('Error creating sale:', error);
    return c.json({ error: 'Error creating sale: ' + error.message }, 500);
  }
});

// ============= PRODUCTS ROUTES =============

app.get("/make-server-20ba56b2/products", requireAuth, async (c) => {
  try {
    let products = await kv.get('products');

    if (!products) {
      products = [
        { id: '1', name: 'Playera Evento 2026', price: 250, stock: 50, category: 'playeras' },
        { id: '2', name: 'Libro "Nueva Generación"', price: 180, stock: 30, category: 'libros' },
        { id: '3', name: 'Gorra Oficial', price: 150, stock: 40, category: 'gorras' },
        { id: '4', name: 'Pulsera LED', price: 80, stock: 100, category: 'accesorios' },
      ];
      await kv.set('products', products);
    }

    return c.json({ products });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Error fetching products: ' + error.message }, 500);
  }
});

// ============= WORKSHOPS ROUTES =============

app.get("/make-server-20ba56b2/workshops", requireAuth, async (c) => {
  try {
    let workshops = await kv.get('workshops');

    if (!workshops) {
      workshops = [
        'Adoración Profética',
        'Liderazgo Juvenil',
        'Evangelismo Digital',
        'Oración Intercesora',
        'Producción Musical',
        'Medios Audiovisuales',
      ];
      await kv.set('workshops', workshops);
    }

    return c.json({ workshops });
  } catch (error) {
    console.log('Error fetching workshops:', error);
    return c.json({ error: 'Error fetching workshops: ' + error.message }, 500);
  }
});

// ============= EVENTS ROUTES =============

app.get("/make-server-20ba56b2/events", requireAuth, async (c) => {
  try {
    let events = await kv.get('events');

    if (!events) {
      events = [
        {
          id: 'adoradores-2026',
          name: 'Adoradores 2026',
          date: '2026-05-01',
          active: true,
        },
      ];
      await kv.set('events', events);
    }

    return c.json({ events });
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ error: 'Error fetching events: ' + error.message }, 500);
  }
});

// ============= STORAGE ROUTES =============

app.post("/make-server-20ba56b2/upload-payment-evidence", requireAuth, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create bucket if it doesn't exist
    const bucketName = 'make-20ba56b2-payment-evidence';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const attendeeId = formData.get('attendeeId') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${attendeeId}-${Date.now()}.${fileExt}`;
    const filePath = `evidence/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: 'Error uploading file: ' + uploadError.message }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000);

    return c.json({
      filePath,
      signedUrl: signedUrlData?.signedUrl,
    });
  } catch (error) {
    console.log('Error uploading payment evidence:', error);
    return c.json({ error: 'Error uploading payment evidence: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);