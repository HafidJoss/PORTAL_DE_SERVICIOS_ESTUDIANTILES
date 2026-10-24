# Portal de Servicios Estudiantiles

- Todo el contenido y los mensajes, en español.
- El contexto y las reglas del proyecto para OpenSpec viven en `openspec/config.yaml`. No editar `.claude/skills/` ni `.claude/commands/opsx/`: los regenera `openspec update`.
- Documentación: `Analisis-de-sistema/` (requisitos y ADR) y `Arquitectura-software/`. Se mejoran los documentos existentes; no se crean documentos de análisis nuevos sin que se pida.
- Flujo de trabajo: `/opsx:explore` → `/opsx:propose` → revisar → `/opsx:apply` (TDD) → `/opsx:verify` → `/opsx:archive`.
- Git: una rama por tarea desde `main`; commits locales con Conventional Commits en español (`docs(alcance): infinitivo + resumen`, asunto de hasta 72 caracteres, cuerpo a 72, un cambio lógico por commit). Nunca hacer push salvo que se pida.
- Los `.md` usan CRLF (`core.autocrlf=true`): normalizar tras editar y revisar `git diff --cached --check`.
