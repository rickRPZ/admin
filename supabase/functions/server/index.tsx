import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as aas from "./admin_app_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ============= ADMIN APP STORE ENDPOINTS =============
const FUNCTION_URI = "/admin_api";
const HEALTH_URI = FUNCTION_URI + "/health";
const SIGNUP_URI = FUNCTION_URI + "/auth/signup";
const ATTENDEES_URI = FUNCTION_URI + "/attendees";
const PAYMENTS_URI = FUNCTION_URI + "/payments";

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

// Health check endpoint
app.get(HEALTH_URI, (c) => {
  return c.json({ status: "ok" });
});

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

// ============= AUTH ROUTES =============

app.post(SIGNUP_URI, async (c) => {
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

// Attendees list endpoint
app.get(ATTENDEES_URI, requireAuth, async (c) => {
  try {
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('attendees')
      .select('*');

    if (error) {
      console.log('Fetch attendees error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ attendees: data || [] });
  } catch (error: any) {
    console.log('Attendees fetch exception:', error);
    return c.json({ error: 'Error fetching attendees: ' + error.message }, 500);
  }
});

// Attendees create endpoint: guarda en la tabla `public.attendees`
// y asigna `registryUser` desde el token de sesión.
app.post(ATTENDEES_URI, requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get('user');

    const registryUser = user.email || user.id;

    const record = {
      fullname: body.fullname ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      church: body.church ?? null,
      eventId: body.eventId ?? null,
      ticketType: body.ticketType ?? null,
      paymentStatus: body.paymentStatus ?? null,
      registryUser,
    };

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('attendees')
      .insert([record])
      .select();

    if (error) {
      console.log('Insert attendee error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ attendee: data?.[0] ?? null });
  } catch (error: any) {
    console.log('Attendee create exception:', error);
    return c.json({ error: 'Error creating attendee: ' + error.message }, 500);
  }
});

// Attendees update endpoint: sólo workshops y checkedIn.
app.put(`${ATTENDEES_URI}/:id`, requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const updates: any = {};
    if (body.workshops !== undefined) {
      updates.workshops = typeof body.workshops === 'string'
        ? JSON.parse(body.workshops)
        : body.workshops;
    }
    if (body.checkedIn !== undefined) {
      updates.checkedIn = body.checkedIn;
    }

    if (!Object.keys(updates).length) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('attendees')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.log('Update attendee error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ attendee: data?.[0] ?? null });
  } catch (error: any) {
    console.log('Attendee update exception:', error);
    return c.json({ error: 'Error updating attendee: ' + error.message }, 500);
  }
});

// Attendees qrCode update endpoint.
app.put(`${ATTENDEES_URI}/:id/qrcode`, requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { qrCode } = await c.req.json();

    if (!qrCode) {
      return c.json({ error: 'qrCode is required' }, 400);
    }

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('attendees')
      .update({ qrCode })
      .eq('id', id)
      .select();

    if (error) {
      console.log('Update attendee qrCode error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ attendee: data?.[0] ?? null });
  } catch (error: any) {
    console.log('Attendee qrCode update exception:', error);
    return c.json({ error: 'Error updating attendee qrCode: ' + error.message }, 500);
  }
});

// Payments endpoints
app.get(PAYMENTS_URI, requireAuth, async (c) => {
  try {
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('payments')
      .select('*');

    if (error) {
      console.log('Fetch payments error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ payments: data || [] });
  } catch (error: any) {
    console.log('Payments fetch exception:', error);
    return c.json({ error: 'Error fetching payments: ' + error.message }, 500);
  }
});

app.get(`${PAYMENTS_URI}/attendee/:attendeeId`, requireAuth, async (c) => {
  try {
    const attendeeId = c.req.param('attendeeId');
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('payments')
      .select('*')
      .eq('attendeeId', attendeeId);

    if (error) {
      console.log('Fetch attendee payments error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ payments: data || [] });
  } catch (error: any) {
    console.log('Attendee payments fetch exception:', error);
    return c.json({ error: 'Error fetching payments for attendee: ' + error.message }, 500);
  }
});

app.post(PAYMENTS_URI, requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get('user');
    const registryUser = user.email || user.id;

    const amount = Number(body.amount);
    if (!body.attendeeId || !body.paymentMethod || Number.isNaN(amount)) {
      return c.json({ error: 'attendeeId, paymentMethod and valid amount are required' }, 400);
    }

    const record = {
      attendeeId: body.attendeeId,
      paymentMethod: body.paymentMethod,
      amount,
      registryUser,
    };

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await serviceSupabase
      .from('payments')
      .insert([record])
      .select();

    if (error) {
      console.log('Insert payment error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ payment: data?.[0] ?? null });
  } catch (error: any) {
    console.log('Payment create exception:', error);
    return c.json({ error: 'Error creating payment: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);