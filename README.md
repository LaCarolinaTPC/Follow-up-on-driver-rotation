# MTC La Carolina — Seguimiento de Conductores

Plataforma de gestion y seguimiento a la rotacion del personal de conduccion de Metropolitana de Transportes La Carolina S.A.S.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel
- **Icons**: Lucide React

## Estructura del Proyecto

```
src/
├── app/
│   ├── login/                          # Pagina de login
│   ├── dashboard/
│   │   ├── layout.tsx                  # Layout con sidebar
│   │   ├── conductores/               # Buscador de conductores
│   │   │   └── [cedula]/              # Perfil individual
│   │   ├── rendimiento/               # Dashboard de rendimiento (9 tabs)
│   │   └── datos/                     # Carga de archivos Excel
│   ├── api/
│   │   ├── conductor/[cedula]/        # API perfil conductor
│   │   ├── conductores/search/        # API busqueda
│   │   └── rendimiento/               # API metricas de rendimiento
│   └── auth/signout/                  # Logout endpoint
├── components/
│   ├── layout/                        # Sidebar, Header, LogoutButton
│   └── ui/                            # Badge, KpiCard, Section, EmptyState
├── lib/
│   ├── supabase/                      # Client helpers (browser, server, admin)
│   └── utils/                         # Formateo, constantes, parser Excel
├── types/                             # TypeScript interfaces
└── middleware.ts                      # Proteccion de rutas

supabase/
├── migrations/001_create_tables.sql   # Schema completo (6 tablas + vista)
└── seed/                              # Scripts de carga de Excel
```

## Base de Datos

| Tabla | Descripcion | Registros |
|---|---|---|
| `conductores` | Datos personales (activos + retirados) | ~1,154 |
| `cierres_diarios` | Rendimiento diario (timbradas, viajes) | ~7,963 |
| `viajes_perdidos` | Viajes no realizados (ausencias, accidentes) | ~4,512 |
| `ausentismo` | Incapacidades medicas | ~249 |
| `familia` | Nucleo familiar | ~252 |
| `data_uploads` | Registro de cargas de datos | variable |

**Vista**: `conductores_con_grupo` — calcula automaticamente el grupo de antiguedad (0-3m, 3-6m, 6-12m, 1+a) a partir de la fecha de ingreso.

## Funcionalidades

### Conductores
- Busqueda por nombre o cedula con autocompletado
- Perfil completo: KPIs, analisis por quincena, rendimiento operativo dia a dia, vueltas perdidas, historial de accidentes, ausentismo, nucleo familiar
- Layout de 2 columnas: datos operativos a la izquierda, informacion personal a la derecha

### Rendimiento
- **Resumen**: KPIs globales, distribucion por grupo de antiguedad, graficos de VP y timbradas
- **Detalle por grupo**: Top 10 productividad, top VP, tabla filtrable
- **Accidentalidad**: Conductores con accidentes, distribucion por grupo
- **Tabla completa**: Todos los conductores con busqueda y filtros (grupo, VP)
- **Quincenas**: Comparativo de timbradas y VP por quincena
- **Evolucion**: Analisis de mejora/retroceso entre quincenas

### Autenticacion
- Login con email/password via Supabase Auth
- Middleware de proteccion de rutas (`/dashboard/*`)
- Logout con limpieza de sesion server-side

## Setup Local

### Prerequisitos
- Node.js 18+
- Cuenta de Supabase con proyecto creado

### Instalacion

```bash
git clone https://github.com/LaCarolinaTPC/Follow-up-on-driver-rotation.git
cd Follow-up-on-driver-rotation
npm install
```

### Variables de Entorno

Crear `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Base de Datos

1. Ejecutar `supabase/migrations/001_create_tables.sql` en el SQL Editor de Supabase
2. Crear un usuario en Supabase > Authentication > Users > Add user

### Carga de Datos

Colocar los archivos Excel en la carpeta raiz del proyecto (no se incluyen en el repo) y ejecutar:

```bash
npm run seed
```

Archivos esperados:
- `drive-download-.../vstConductoresactivos.xlsx` — Base de conductores activos
- `drive-download-.../vstConductoresretirados.xlsx` — Base de conductores retirados
- `Operativo/CIERRE DEFINITIVO CONDUCTOR *.xlsx` — Cierres diarios (1 por dia)
- `drive-download-.../Feb_2026.xlsx` — Viajes perdidos febrero
- `drive-download-.../Mar_2026.xlsx` — Viajes perdidos marzo
- `MATRIZ DE AUSENTISMO *.xlsx` — Incapacidades
- `drive-download-.../Hijos y Conyugues *.xlsx` — Nucleo familiar

### Desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

## Fuentes de Datos

Los datos provienen de archivos Excel exportados del sistema operativo de la empresa y subidos a Google Drive. Cada archivo tiene fechas de corte especificas:

| Archivo | Frecuencia | Headers |
|---|---|---|
| Conductores activos/retirados | Cuando entra/sale conductor | Fila 5 |
| Cierre definitivo conductor | Diario (~3 dias de atraso) | Fila 6 |
| Viajes perdidos | Mensual | Fila 5 |
| Matriz de ausentismo | Periodico (con fecha de corte en nombre) | Fila 2 |
| Hijos y conyugues | Estatico | Fila 1 |

**Clave de cruce**: `cedula` (Identificacion) entre la mayoria de tablas. Los cierres diarios usan `cod_conductor` que se cruza con `conductores.codigo`.

## Empresa

**Metropolitana de Transportes La Carolina S.A.S.**
Barranquilla, Colombia | 30+ anos de operacion | ISO 39001 | Integracion SITP
