# Portal de Servicios Estudiantiles

- Todo el contenido y los mensajes, en español.
- El contexto y las reglas del proyecto para OpenSpec viven en `openspec/config.yaml`. No editar a mano las skills/comandos generados por OpenSpec (los regenera `openspec update`).
- Documentación en `docs/`: `01-analisis-de-sistema/` (requisitos y ADR), `02-arquitectura-software/`, `03-diseno-de-software/`, `04-modelo-c4/`, `05-guias/`, `06-estandares/` y `07-fases/` (actas de cierre por fase). Se mejoran los documentos existentes; no se crean documentos de análisis nuevos sin que se pida.
- Flujo de trabajo: `/opsx:explore` → `/opsx:propose` → revisar → `/opsx:apply` (TDD) → `/opsx:archive`. `/opsx:verify` se agrega al activar el perfil ampliado de OpenSpec.
- Cierre obligatorio de fase: **siempre que se termine una fase**, tras archivar sus cambios OpenSpec y pasar pruebas, lint y compilación, documentar el cierre en `docs/07-fases/fase-NN-<nombre>.md` y actualizar `docs/07-fases/README.md`.
- TDD y nomenclatura: el código se escribe siguiendo `docs/06-estandares/tdd.md` (también fuera de `/opsx:*`) y `docs/06-estandares/nomenclatura.md` (`camelCase` estricto en archivos/carpetas del frontend con `testSetup/` y `pruebas/test<Tipo><Contexto>.test.ts(x)`; `snake_case` en backend con `tests/<modulo>/test_<tipo>_<contexto>.py`).
- Git: se trabaja siempre en `dev`; `main` solo recibe lo que sube a staging. **Nunca hacer commit, push ni merge a menos que se pida explícitamente.** El detalle está en `docs/06-estandares/git-y-github.md`. Cuando se pida, usar Conventional Commits en español (`docs(alcance): infinitivo + resumen`, asunto de hasta 72 caracteres, cuerpo a 72, un cambio lógico por commit).
- Los `.md` usan CRLF (`core.autocrlf=true`): normalizar tras editar y revisar `git diff --cached --check`.
