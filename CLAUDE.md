# Portal de Servicios Estudiantiles

- Todo el contenido y los mensajes, en español.
- El contexto y las reglas del proyecto para OpenSpec viven en `openspec/config.yaml`. No editar `.claude/skills/` ni `.claude/commands/opsx/`: los regenera `openspec update`.
- Documentación en `docs/`: `01-analisis-de-sistema/` (requisitos y ADR), `02-arquitectura-software/`, `03-diseno-de-software/`, `04-modelo-c4/` y `05-guias/`. Se mejoran los documentos existentes; no se crean documentos de análisis nuevos sin que se pida.
- Flujo de trabajo: `/opsx:explore` → `/opsx:propose` → revisar → `/opsx:apply` (TDD) → `/opsx:archive`. `/opsx:verify` se agrega al activar el perfil ampliado de OpenSpec.
- TDD: el código se escribe siguiendo `docs/06-estandares/tdd.md`, también fuera de los comandos `/opsx:*`.
- Git: se trabaja siempre en `dev`; `main` solo recibe lo que sube a staging. **Nunca hacer commit, push ni merge a menos que se pida explícitamente.** El detalle está en `docs/06-estandares/git-y-github.md`. Cuando se pida, usar Conventional Commits en español (`docs(alcance): infinitivo + resumen`, asunto de hasta 72 caracteres, cuerpo a 72, un cambio lógico por commit).
- Los `.md` usan CRLF (`core.autocrlf=true`): normalizar tras editar y revisar `git diff --cached --check`.
