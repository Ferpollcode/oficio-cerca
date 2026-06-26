# OficioCerca

App Next.js recomendada para un marketplace de oficios en Mendoza, mejorado con:

- Web app para cliente.
- Panel para trabajador.
- Login y roles preparado para Supabase.
- Base de datos inicial documentada en el panel admin.
- Solicitudes de servicio.
- Permiso de ubicacion antes de compartir tracking.
- Seguimiento en vivo con Google Maps si se configura API key.
- Historial de pedidos.
- Administracion.
- PWA instalable en Android e iOS.

## Ejecutar

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Configurar servicios reales

Copiar `.env.example` a `.env.local` y completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Sin esas variables la app funciona en modo demo.

## Supabase

En la pantalla `admin` hay un bloque SQL inicial para crear:

- `profiles`
- `workers`
- `service_requests`
- `worker_locations`

Para produccion faltaria agregar RLS policies, auth por telefono/email y funciones realtime.

## Android e iOS

La app ya incluye `manifest.json` y `sw.js`, por lo que puede instalarse como PWA desde el navegador.

Para GPS en segundo plano real y notificaciones nativas conviene agregar Capacitor o crear una app Expo/React Native consumiendo el mismo backend de Supabase.
