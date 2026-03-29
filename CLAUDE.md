# CicloPet

SaaS de retención automática de clientes para forrajerías y pet shops. Mercado Argentina. Dominio: ciclopet.com.ar

## Qué es
Plataforma que avisa automáticamente por WhatsApp a los clientes de una forrajería cuando se les está por terminar el alimento. El cliente confirma su pedido con un click y el forrajero arranca el día con todos los repartos organizados.

## Stack
- Next.js 16 + TypeScript + Tailwind CSS 4
- Supabase (auth + DB)
- Twilio WhatsApp API
- $35 USD/mes por forrajería

## Flujo principal
Forrajero carga clientes → Sistema detecta quién necesita → Forrajero elige a quién mandar → Cliente recibe WhatsApp con link → Cliente confirma pedido (puede modificar kilos, elige pago) → Forrajero ve pedidos del día organizados

## Base de datos
- `negocios` — forrajerías registradas
- `clientes` — clientes con ciclo de compra, dirección, localidad
- `mascotas` — mascotas por cliente con marca y kilos
- `pedidos` — pedidos con token único, estado, método de pago

## Estructura clave
- `app/page.tsx` — Landing page
- `app/(auth)/login` — Login
- `app/(auth)/register` — Registro
- `app/(dashboard)/dashboard` — Panel principal con RecordatoriosPanel + PedidosPanel
- `app/(dashboard)/clientes` — Gestión de clientes y mascotas
- `app/pedido/[token]` — Página pública donde el cliente confirma su pedido
- `app/api/whatsapp/enviar` — Envía WhatsApps a clientes seleccionados
- `app/api/pedidos/confirmar` — Confirma pedido del cliente
- `components/dashboard/RecordatoriosPanel.tsx` — Panel de alertas (core del producto)
- `components/dashboard/PedidosPanel.tsx` — Pedidos del día con estado
- `components/dashboard/ClientesPanel.tsx` — CRUD de clientes y mascotas
- `lib/twilio.ts` — Envío de WhatsApp
- `supabase-schema.sql` — Schema completo

## Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
NEXT_PUBLIC_BASE_URL=https://ciclopet.com.ar
CRON_SECRET=
```

## Estado
MVP completo construido. Pendiente: conectar Supabase, configurar Twilio, subir a Vercel.
