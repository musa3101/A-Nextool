# Ecuaplac Backend & Conector (Chat 2 — Backend Exclusivo)

Este directorio gestiona la conexión real con el servidor y la base de datos de **Ecuaplac** (`https://ecuaplac.com` y Supabase).

## ⚠️ AVISO PARA EL AGENTE DE UI / DISEÑO (CHAT 1)
- **NO MODIFICAR**: `conector.ts`, `config.ts`, ni este archivo.
- La UI simplemente debe importar `ecuaplacConnector` desde `./conector` y consumir sus métodos asíncronos.

---

## 🛠️ Métodos Disponibles en `ecuaplacConnector`:

1. `await ecuaplacConnector.getWorks()`:
   - Devuelve la lista de obras de portada (`ecuaplac_carousel`) desde Supabase en tiempo real (con fallback en caché local).
2. `await ecuaplacConnector.getMoreProjects()`:
   - Devuelve los proyectos de la galería secundaria (`ecuaplac_more_projects`).
3. `await ecuaplacConnector.getAdminProfile()`:
   - Devuelve `{ admin_name, avatar_url, pin_code }` de José Rivadeneira.
4. `await ecuaplacConnector.uploadPhoto(file, folder)`:
   - Sube un archivo WebP al bucket `ecuaplac-media` y devuelve su URL pública en Supabase Storage.
5. `await ecuaplacConnector.saveWork(work)`:
   - Crea o actualiza una obra de portada en Supabase.
6. `await ecuaplacConnector.saveMoreProject(project)`:
   - Crea o actualiza un proyecto en Supabase.
7. `await ecuaplacConnector.deleteItem(type, id)`:
   - Elimina la obra o proyecto de Supabase.
8. `await ecuaplacConnector.updateAdminProfile(name, avatarUrl)`:
   - Actualiza el nombre y avatar de José en Supabase.
9. `await ecuaplacConnector.addAuditLog(action, details)`:
   - Registra el movimiento en `ecuaplac_audit_logs`.
