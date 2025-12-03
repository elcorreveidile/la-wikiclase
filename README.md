# 🎓 La Wikiclase

Plataforma integral de cursos de **Español como Lengua Extranjera (ELE)**, Literatura y Metodología Educativa. Hub central que unifica 13 proyectos web con sistema de cursos premium, pagos, autenticación robusta y generación de PDFs.

## Objetivos
- Landing y catálogo de cursos con alto rendimiento y SEO.
- Backend modular para auth, cursos, matrículas y pagos Stripe.
- Generación de certificados, facturas y contenidos en PDF.
- Base escalable y responsiva en móviles.

## Stack propuesto
- **Monorepo**: Turborepo con workspaces (pnpm) para compartir tipos y utilidades.
- **Frontend**: Next.js 14 (App Router) + React, Tailwind CSS y componentes accesibles (shadcn/ui). SSR/SSG para SEO en landing y detalle de curso.
- **Backend**: NestJS con Fastify, Prisma ORM hacia PostgreSQL.
- **Autenticación**: OAuth2/OIDC (p. ej. Auth0/Clerk) con sesiones seguras; soporte a roles (admin, instructor, estudiante). Tokens de acceso y refresh con rotación.
- **Pagos**: Stripe Checkout alojado inicialmente; opción Payment Elements para incrustar. Webhooks para confirmar matrícula y emitir factura.
- **PDF**: Servicio interno con Playwright/Puppeteer renderizando plantillas HTML (certificados, facturas, contenidos). Almacenamiento temporal en S3-compatible.
- **Infra**: Frontend en Vercel; backend en Fly.io/Render con Docker. PostgreSQL administrado (Supabase/RDS). Caché Redis opcional para sesiones y catálogo.
- **Observabilidad**: Logging estructurado (pino), métricas y tracing OpenTelemetry.

## Estructura de carpetas (propuesta)
```
/ (repo raíz)
  apps/
    web/         # Next.js (frontend)
    api/         # NestJS (backend)
  packages/
    ui/          # Design system compartido
    config/      # ESLint/Prettier/tsconfig compartidos
    utils/       # Funciones y tipos compartidos
  infra/
    docker/      # Dockerfiles y compose para dev
    terraform/   # (opcional) IaC para Fly.io/Render
  docs/
    architecture.md
```

## ✅ Estado Actual

- ✅ Turborepo inicializado con pnpm workspaces
- ✅ Next.js 14 configurado con App Router, TypeScript y Tailwind CSS
- ✅ NestJS configurado con Fastify, Prisma y estructura modular
- ✅ Packages compartidos: @lawikiclase/ui, @lawikiclase/config, @lawikiclase/utils
- ✅ Esquema Prisma completo con todos los modelos
- ✅ Seed de base de datos con 13 proyectos web
- ✅ Landing page inicial creada

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Configurar base de datos
cd apps/api
pnpm migrate
pnpm seed

# Ejecutar en modo desarrollo
cd ../..
pnpm dev
```

Visita:
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost:3001
- 📚 API Docs: http://localhost:3001/api/docs

**📖 Consulta la [Guía de Configuración Completa](./docs/SETUP_GUIDE.md)**

## 🎯 Funcionalidades Principales

### Implementadas
- ✅ Arquitectura base de monorepo
- ✅ Sistema de componentes UI compartidos
- ✅ Estructura modular de backend
- ✅ Modelos de datos completos

### En Desarrollo
- 🔜 Autenticación con Clerk
- 🔜 Sistema de cursos y lecciones
- 🔜 Integración de pagos con Stripe
- 🔜 Generación de PDFs (certificados, facturas)
- 🔜 Hub de integración de 13 webs
- 🔜 Chatbot IA en tiempo real
- 🔜 Generación de videos con HeyGen

## 🏗️ Próximos Pasos

1. Integrar Clerk para autenticación segura
2. Crear páginas de catálogo y detalle de cursos
3. Implementar sistema de pagos con Stripe
4. Desarrollar generación de PDFs profesionales
5. Crear sección de proyectos web integrados
6. Implementar chatbot IA con OpenAI
7. Integrar HeyGen para videos de presentación

## 🌐 13 Proyectos Web Integrados

1. **Curso Intensivo de Español** - Curso de un mes
2. **Producción e Interacción Oral** - Curso de tres meses
3. **Literatura hasta el XVIII** - Historia de la literatura española
4. **UGT CLM Granada** - Sindicato
5. **La Wikiclase (antigua)** - Versión anterior
6. **Clases por Zoom - Moodle** - Plataforma LMS actual
7. **BlaBlaEle** - Escuela de idiomas
8. **Clínica Lingüística y Cultural** - Proyecto metodológico
9. **Juan Blas Láinez** - Web personal
10. **Juan Blas Láinez Blog** - Blog personal
11. **CEELEEME** - Recursos ELE
12. **De Tapas por Granada** - Webquest educativa
13. **Olvidos de Granada** - Revista cultural

## 📚 Documentación

- [Guía de Configuración](./docs/SETUP_GUIDE.md) - Instrucciones detalladas de setup
- [Arquitectura](./docs/architecture.md) - Decisiones técnicas y componentes

## 🛠️ Tecnologías

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Clerk, Stripe
**Backend**: NestJS, Fastify, Prisma, PostgreSQL, Puppeteer, Bull, Redis
**Deployment**: Vercel (frontend), Fly.io/Render (backend)
**AI/ML**: OpenAI GPT-4, HeyGen

## 📄 Licencia

Proyecto privado de Javier Benítez Láinez - Todos los derechos reservados
