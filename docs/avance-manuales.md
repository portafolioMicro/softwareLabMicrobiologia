# Avance de los manuales

Se va llenando mientras se desarrolla, para no hacerlo todo al final.

## Manual técnico

### Arquitectura
- Monolito modular: backend NestJS (API REST) + frontend Next.js que la consume.
- Base de datos PostgreSQL con Prisma (modelo en `backend/prisma/schema.prisma`).
- Sesión con JWT en cookie httpOnly (8 horas). El frontend protege `/panel` con `proxy.ts` y valida la sesión en el servidor; el backend valida el token y el rol en cada petición.

### Modelo de datos
Tablas: usuario, cliente, set_muestra, muestra, analisis, categoria_matriz, norma, norma_analisis, muestra_analisis_resultado. (Agregar el diagrama ER del documento DAS.)

### Endpoints construidos
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET/POST/PATCH/DELETE /clientes` (eliminar: solo Administrador)
- `/catalogo/categorias`, `/catalogo/normas`, `/catalogo/analisis`, `/catalogo/normas/:id/analisis`, `/catalogo/norma-analisis/:id` (crear, editar y eliminar: solo Administrador)

### Decisiones técnicas a justificar
- Prisma 6 en lugar de 7 (estabilidad y documentación disponible).
- Cookie httpOnly en lugar de localStorage (protección contra XSS).
- Mensaje de error genérico en el login (no revela si falló el correo o la contraseña).
- Catálogo cargado desde el Excel de la Resolución 1407 con un script repetible (`prisma/seed-normativa.ts`).

### Instalación y despliegue
Ver `README.md`. (Falta documentar el despliegue en producción.)

## Manual de usuario

Una sección por pantalla: para qué sirve, quién puede usarla, pasos y captura.

- [x] Iniciar y cerrar sesión (captura pendiente)
- [x] Clientes: buscar, crear, editar, eliminar (captura pendiente)
- [x] Catálogo: categorías, normas, análisis y análisis de cada norma (captura pendiente)
- [ ] Sets de muestra y muestras
- [ ] Resultados
- [ ] Informes
- [ ] Gestión de usuarios

## Pendientes por confirmar con el laboratorio
- Años y nombres correctos de varios métodos (NTC 4458, ISO 15213).
- Significado de las letras M y m, y de "Remitir".
- Norma del agua potable y criterios de ambientes, manipuladores y superficies.
- Formato de recepción de muestras, formato de informe y cómo codifican los sets.