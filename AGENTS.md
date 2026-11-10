# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **NexTool** (API base `https://t3id9d4k.eu-central.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## Protocolo Obligatorio de Fin de Sesión y Control de Versiones (NexTool — Musa)

Siempre que Musa o el usuario solicite cerrar sesión (mediante **"cerrar sesión"**, **"@final"**, **"@end"**, **"terminar"** o expresiones similares):

1. **Resumen de Trabajo Realizado**:
   El agente debe presentar obligatoriamente un resumen claro y conciso de lo hecho en la sesión:
   > *"¿Hoy has hecho... [resumen de tareas, mejoras o correcciones realizadas en la app/cliente]?*"

2. **Pregunta Obligatoria de Actualización de Versión**:
   Inmediatamente después, el agente debe preguntar expresamente a Musa:
   > *"Después de hacer todo esto, ¿prefieres que actualicemos la versión de la app (ej. nueva versión en `version.json` y sistema de actualización) o mantenemos la versión actual?"*

3. **Acción según la respuesta de Musa**:
   * **Si Musa responde SÍ**: Se incrementa la versión (SemVer patch o minor según el alcance) en `web/clientes/<app>/version.json`, `web/web v1/public/version.json`, portal y base de datos, registrándolo en `docs/SESSION_LATEST_ES.md`.
   * **Si Musa responde NO**: Se dejan registradas las mejoras y se cierra la sesión normalmente manteniendo intacto el número de versión actual.

