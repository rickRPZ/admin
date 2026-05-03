# 🎫 Sistema de Eventos - PWA

Aplicación web profesional para gestión completa de eventos presenciales, optimizada para móviles y tablets.

![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)

---

## 📱 Características Principales

### ✅ Gestión de Registros
- Registro rápido de asistentes
- Generación automática de boletos digitales con QR único
- Tipos de boleto: General, VIP, Estudiante
- Selección de talleres (hasta 3 por asistente)
- Gestión de pagos y métodos de pago
- Búsqueda y edición de registros

### ⚡ Check-in Rápido
- Escaneo de códigos QR
- Búsqueda manual por nombre/email
- Asignación de talleres al momento del check-in
- Validación de duplicados
- Registro de hora de entrada

### 💳 Sistema de Pagos
- Procesamiento de pagos pendientes
- Múltiples métodos: Efectivo, Tarjeta, Transferencia
- Interfaz tipo checkout profesional
- Confirmación visual de transacciones

### 🛍️ Punto de Venta
- Venta de mercancía oficial
- Carrito de compras intuitivo
- Control de inventario
- Múltiples métodos de pago
- Confirmación de ventas

### 📊 Reportes y Análisis
- Dashboard con KPIs en tiempo real
- Gráficas de talleres más populares
- Análisis de métodos de pago
- Productos más vendidos
- Resumen financiero completo

### 👥 Gestión de Usuarios
- 3 roles: Administrador, Operador de Registros, Operador de Caja
- Permisos granulares por rol
- Activación/desactivación de usuarios
- Historial de actividad

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - UI Library
- **React Router 7** - Navigation
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling
- **Recharts** - Data Visualization
- **QRCode.react** - QR Generation
- **Lucide React** - Icons
- **PWA Support** - Offline capabilities

### Backend
- **Supabase** - BaaS Platform
- **PostgreSQL** - Database
- **Edge Functions (Deno)** - Serverless API
- **Hono** - Web Framework
- **Supabase Auth** - Authentication

### Características PWA
- ✅ Instalable en dispositivos móviles
- ✅ Funciona offline (parcial)
- ✅ Navegación tipo app nativa
- ✅ Optimizado para touch
- ✅ Responsive design

---

## 🚀 Inicio Rápido

### 1. Prerrequisitos

Esta aplicación requiere:
- Conexión a Supabase (ya configurada)
- Navegador moderno (Chrome, Safari, Edge)

### 2. Desplegar Backend

Desde la interfaz de Figma Make:
1. Ir a **Settings** ⚙️
2. Sección **Supabase**
3. Click en **"Deploy edge function"**
4. Esperar confirmación

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa.

### 3. Crear Primer Usuario

1. Abrir la aplicación
2. Click en "¿Primera vez? Crear usuario administrador"
3. Completar formulario
4. Iniciar sesión

---

## 📖 Guía de Uso

### Roles del Sistema

#### 👑 Administrador
- **Acceso**: Todas las secciones
- **Permisos**: 
  - Crear/editar/eliminar registros
  - Realizar check-ins
  - Procesar pagos
  - Vender mercancía
  - Ver reportes completos
  - Gestionar usuarios del sistema

#### 📝 Operador de Registros
- **Acceso**: Dashboard, Registros, Check-in
- **Permisos**:
  - Crear y editar registros
  - Realizar check-in de asistentes
  - Asignar talleres

#### 💰 Operador de Caja
- **Acceso**: Dashboard, Pagos, Mercancía
- **Permisos**:
  - Procesar pagos pendientes
  - Vender productos
  - Ver transacciones

---

## 🎯 Flujo de Trabajo del Evento

### Pre-Evento
1. **Registros**: Capturar asistentes anticipadamente
2. **Pagos**: Procesar pagos anticipados
3. **Configuración**: Crear usuarios operadores

### Día del Evento
1. **Check-in**: Registrar entrada con QR o búsqueda manual
2. **Talleres**: Asignar talleres disponibles en el momento
3. **Pagos**: Cobrar a personas con saldo pendiente
4. **Mercancía**: Vender productos oficiales

### Post-Evento
1. **Reportes**: Analizar asistencia y ventas
2. **Financiero**: Revisar ingresos totales
3. **Análisis**: Ver talleres y productos más populares

---

## 🎨 Pantallas Principales

### 1️⃣ Login
- Autenticación con email/password
- Opción de Google OAuth
- Creación de primer usuario

### 2️⃣ Dashboard
- 6 KPIs visuales
- Taller más popular
- Tasas de check-in y pago
- Actualización en tiempo real

### 3️⃣ Registros
- Formulario completo de registro
- Lista de asistentes con búsqueda
- Generación de boleto digital
- Edición de registros

### 4️⃣ Boleto Digital
- Diseño profesional
- QR grande y legible
- Información del asistente
- Estado de pago
- Talleres registrados

### 5️⃣ Check-in
- Escáner QR (entrada manual)
- Búsqueda manual
- Selección de talleres con cupos
- Validación de duplicados
- Confirmación visual

### 6️⃣ Pagos
- Lista de pagos pendientes
- Formulario de cobro
- Múltiples métodos de pago
- Confirmación de transacción

### 7️⃣ Mercancía
- Catálogo de productos
- Carrito de compra
- Control de stock
- Checkout rápido

### 8️⃣ Reportes
- Gráficas de barras (talleres)
- Gráfica de pie (métodos de pago)
- Top productos vendidos
- Resumen financiero

### 9️⃣ Configuración
- Perfil de usuario actual
- Gestión de usuarios (admin)
- Permisos por rol
- Cerrar sesión

---

## 🔐 Seguridad

- ✅ Autenticación requerida en todas las rutas
- ✅ Tokens JWT manejados por Supabase
- ✅ Service Role Key protegida en backend
- ✅ Validación de roles en cada operación
- ✅ CORS configurado correctamente
- ⚠️ No diseñado para PII sensible

---

## 📊 Base de Datos

### Tabla: `kv_store_20ba56b2`

Estructura clave-valor para flexibilidad:

```
attendee:{uuid}     → Objeto Attendee
sale:{uuid}         → Objeto Sale
products            → Array de productos
workshops           → Array de talleres
```

### Modelos de Datos

**Attendee:**
```typescript
{
  id: string
  fullName: string
  email: string
  phone: string
  church: string
  ticketType: 'general' | 'vip' | 'estudiante'
  workshops: string[]
  paymentStatus: 'pagado' | 'pendiente'
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia'
  qrCode: string
  checkedIn: boolean
  checkedInAt?: string
  notes?: string
  createdAt: string
}
```

**Sale:**
```typescript
{
  id: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia'
  timestamp: string
}
```

---

## 🛠️ API Endpoints

Todas las rutas requieren autenticación con Bearer token.

### Attendees
- `GET /attendees` - Listar todos
- `POST /attendees` - Crear nuevo
- `PUT /attendees/:id` - Actualizar
- `POST /checkin` - Realizar check-in

### Sales
- `GET /sales` - Listar ventas
- `POST /sales` - Registrar venta

### Products
- `GET /products` - Obtener catálogo

### Workshops
- `GET /workshops` - Listar talleres

### Auth
- `POST /auth/signup` - Crear usuario (admin)

---

## 📱 PWA - Instalación

### Android
1. Abrir en Chrome
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Confirmar instalación

### iOS
1. Abrir en Safari
2. Compartir (⬆️) → "Agregar a pantalla de inicio"
3. Confirmar

### Desktop
1. Chrome/Edge: Ícono (➕) en barra de direcciones
2. O Menú → "Instalar Sistema de Eventos"

---

## 🎨 Personalización

### Productos (Backend)
Editar `supabase/functions/server/index.tsx`:

```typescript
const products = [
  { id: '1', name: 'Tu Producto', price: 100, stock: 50, category: 'playeras' },
  // ...
];
```

### Talleres (Backend)
Editar `supabase/functions/server/index.tsx`:

```typescript
const workshops = [
  'Tu Taller 1',
  'Tu Taller 2',
  // ...
];
```

### Colores (Frontend)
Tailwind CSS v4 usa tokens en `src/styles/theme.css`.

---

## 🐛 Troubleshooting

### Error: Backend no responde
→ Desplegar edge function desde Settings

### Check-in no funciona
→ Verificar conexión a internet y backend desplegado

### No puedo crear usuarios
→ Solo admins pueden crear usuarios desde Configuración

### QR no genera
→ Verificar que el registro se haya creado correctamente

---

## 📈 Métricas del Sistema

El Dashboard muestra en tiempo real:
- Total de registrados
- Check-ins completados
- Ingresos totales
- Pagos pendientes
- Productos vendidos
- Ventas del día

---

## 🚦 Roadmap Futuro

- [ ] Exportar reportes a Excel/PDF
- [ ] Notificaciones push para operadores
- [ ] Integración con pasarelas de pago reales
- [ ] Sistema de badges digitales
- [ ] Modo offline completo con sincronización
- [ ] App nativa (React Native)
- [ ] Impresión de badges físicos
- [ ] Estadísticas avanzadas con BI

---

## 📄 Licencia

Este proyecto es de uso interno. No distribuir sin autorización.

---

## 🙋 Soporte

Para problemas técnicos:
1. Revisar consola del navegador (F12)
2. Verificar logs en Supabase Dashboard
3. Consultar [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎉 Créditos

Desarrollado con React + Supabase + Tailwind CSS  
Diseñado para eventos presenciales profesionales

---

**¡Listo para tu próximo evento! 🎊**
