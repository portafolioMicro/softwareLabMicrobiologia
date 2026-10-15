# Software del Laboratorio de Microbiología

Sistema web del Laboratorio de Servicios Microbiológicos de la Universidad Libre, Seccional Pereira. Incluye el sitio público del laboratorio y un panel interno para gestionar clientes, el catálogo de normas y análisis, y (en desarrollo) el registro de muestras y resultados.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4 |
| Backend | NestJS, TypeScript, Prisma 6 |
| Base de datos | PostgreSQL |
| Autenticación | JWT guardado en cookie httpOnly, roles Administrador / Analista / Tecnico |

> Se usa Prisma 6 a propósito. Prisma 7 cambió la forma de configurar el cliente y las migraciones; no se debe actualizar sin migrar el código.

## Estructura

```
proyectoGrado-lab/
  frontend/   Sitio público (/) y panel interno (/panel)
  backend/    API REST (puerto 3001)
    prisma/   schema.prisma, migraciones, seeds y datos de normativa
  docs/       Notas para el manual técnico y el manual de usuario
```

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior
- Git

## Instalación

### 1. Clonar

```bash
git clone https://github.com/portafolioMicro/softwareLabMicrobiologia.git
cd softwareLabMicrobiologia
```

### 2. Base de datos

Crea una base vacía en PostgreSQL:

```sql
CREATE DATABASE laboratorio_microbiologia;
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env        # en Windows PowerShell: Copy-Item .env.example .env
```

Edita `.env` con tu usuario y contraseña de PostgreSQL y un `JWT_SECRET` propio. Luego:

```bash
npx prisma migrate dev      # crea las tablas
npx prisma db seed          # usuario administrador, categorías y análisis base
npx ts-node prisma/seed-normativa.ts   # normas de la Resolución 1407 desde el Excel
npm run start:dev           # http://localhost:3001
```

### 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env.local  # en Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                 # http://localhost:3000
```

## Uso en desarrollo

- Sitio público: http://localhost:3000
- Panel interno: http://localhost:3000/login
- Usuario de prueba: `admin@unilibre.edu.co` / `Admin123!`

Esta cuenta existe solo para desarrollo. En un despliegue real se debe cambiar la contraseña o eliminarla.

## Módulos del panel

| Módulo | Estado |
|---|---|
| Autenticación y roles | Listo |
| Clientes | Listo |
| Catálogo (categorías, normas, análisis) | Listo |
| Sets de muestra y muestras | Pendiente |
| Resultados | Pendiente |
| Informes en PDF | Pendiente |
| Gestión de usuarios | Pendiente |

## Roles

- **Administrador:** acceso total, incluida la modificación del catálogo y la eliminación de registros.
- **Analista** y **Tecnico:** consultan el catálogo y trabajan con clientes y muestras según los permisos de cada módulo.

## Seguridad

- Los archivos `.env` y `.env.local` no se suben al repositorio.
- La validación real de permisos se hace en el backend; el frontend solo oculta opciones.
- Las contraseñas se guardan con bcrypt.

## Documentación

Las notas para los manuales de la universidad están en la carpeta `docs/`.