---
name: cierre-fase-tdd
description: >-
  Audita el estado técnico, arquitectónico y de pruebas TDD de una fase del
  Portal de Servicios Estudiantiles, diagnostica qué está contemplado vs.
  faltante, corrige puntos sueltos con TDD estricto y genera el acta oficial de
  cierre en docs/07-fases/. Activar cuando el usuario pida cerrar o terminar una
  fase, hacer un recorrido completo de verificación con TDD o diagnosticar el
  avance del código.
---

# Cierre y Diagnóstico TDD por Fase (`cierre-fase-tdd`)

Procedimiento oficial del proyecto **Portal de Servicios Estudiantiles** para auditar el estado real del código frente a `openspec/specs/`, aplicar el estándar [tdd.md](../../../docs/06-estandares/tdd.md) y cerrar cada fase con evidencia reproducible.

## Modos explícitos de operación

Determina al inicio qué modo pidió el usuario (si no queda claro, pregunta antes de editar archivos):

- **Modo A · Diagnóstico (`solo lectura`)**: ejecuta pasos 1 a 4 y entrega el informe de *Contemplado / Puntos sueltos / Faltante*, sin modificar código ni documentos.
- **Modo B · Cierre completo**: ejecuta pasos 1 a 4, confirma con el usuario el alcance de los puntos sueltos detectados, aplica el paso 5 (remediación con TDD + verificación recomendada en vivo) y completa el paso 6 (cierre documental).

---

## Reglas no negociables

1. **Contexto del proyecto**: lee [openspec/config.yaml](../../../openspec/config.yaml) y [AGENTS.md](../../../AGENTS.md). Todo el contenido y los mensajes van en español; se trabaja siempre en `dev` y **nunca** se ejecuta `commit`, `push` ni `merge` sin petición explícita.
2. **Disciplina TDD ([tdd.md](../../../docs/06-estandares/tdd.md))**: nunca modifiques una prueba para hacerla pasar ni agregues `.skip`, `.todo`, `xfail` o `eslint-disable`. Si una prueba contradice la especificación, corrige primero la spec con `/opsx:update` previa confirmación.
3. **Arquitectura y estándares**: respeta fronteras `ADR-008` / `ADR-009` ([arquitectura-inicial.md](../../../docs/02-arquitectura-software/arquitectura-inicial.md)), capas estrictas ([enfoque-arquitectonico.md](../../../docs/02-arquitectura-software/enfoque-arquitectonico.md)) y [nomenclatura.md](../../../docs/06-estandares/nomenclatura.md) (`camelCase` total en `frontend/src/` fuera de `api/generated/`, `snake_case` PEP 8 en `backend/`).
4. **Criterio de veracidad**: solo reporta como aprobadas las pruebas, compilaciones o validaciones ejecutadas **después de la última edición** observando su salida real completa.

---

## Flujo paso a paso

### Paso 1 · Inventario de fase y estado OpenSpec / Git

1. Comprueba rama actual y estado del árbol de trabajo:
   `git branch --show-current` y `git status --short` (advierte si se está en `main`).
2. Revisa cambios activos vs. archivados y especificaciones vigentes:
   `openspec list --json` y `openspec list --specs`.
3. Ubica la fase objetivo respecto al catálogo oficial ([03-Requisitos-funcionales.md](../../../docs/01-analisis-de-sistema/03-Requisitos-funcionales.md), [07-Decisiones-arquitectonicas.md](../../../docs/01-analisis-de-sistema/07-Decisiones-arquitectonicas.md) y actas previas en [docs/07-fases/README.md](../../../docs/07-fases/README.md)).

### Paso 2 · Auditoría estática automatizada

Ejecuta el script determinista de solo lectura:

```powershell
python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --formato markdown
```

Para revisar los criterios detallados por capa, principios SOLID, seguridad (`ADR-004`/`ADR-005`) y distinción entre *stub*, *implementación real* y *faltante*, lee [matriz-criterios.md](./references/matriz-criterios.md).

### Paso 3 · Ejecución de puertas de calidad reales

Ejecuta y registra resultados exactos de:

1. **Backend (`backend/`)**:
   - `python -m pytest -q`
   - Si están configurados en `backend/pyproject.toml`: `ruff check .` y `lint-imports`.
   - Comprobar que `python export_openapi.py` mantiene `backend/openapi.json` sincronizado sin regresiones de rutas.
2. **Frontend (`frontend/`)**:
   - `npm run lint` (`eslint .`)
   - `npm run build` (`tsc -b && vite build`)
   - `npm test -- --run` (`vitest`)
3. **OpenSpec**:
   - `openspec validate --specs --strict`

### Paso 4 · Emitir Diagnóstico de Estado

Presenta al usuario el diagnóstico estructurado siguiendo el bloque correspondiente de [plantilla-fase-cierre.md](./resources/plantilla-fase-cierre.md), separando explícitamente:

1. **Contemplado y verificado**: módulos, rutas, endpoints, specs y pruebas en verde.
2. **Puntos sueltos / deuda corregible en esta fase**: escenarios sin prueba, falta de `testUnitario*`, cabeceras `Spec:` faltantes, errores de lint/nomenclatura/CRLF o violaciones de frontera.
3. **Faltante o diferido a fases siguientes**: requisitos *Pospuesto* (`RC08`), capacidades de otros roles o persistencia/infraestructura planificada para otra fase.

- Si estás en **Modo A · Diagnóstico**, detente aquí y sugiere los comandos o pasos siguientes (`/opsx:propose`, `/opsx:apply` o activar el Modo B).

### Paso 5 · Remediación con TDD estricto y verificación en vivo (**Modo B**)

1. **Pausa de confirmación**: antes de tocar código o specs, presenta la lista concreta de puntos sueltos detectados y confirma cuáles corregir en este cierre (si alguno cambia comportamiento especificado, usa `/opsx:update`).
2. **Ciclo Rojo → Verde → Refactor** (un punto a la vez):
   - **Rojo**: escribe primero la prueba que reproduce el vacío o escenario faltante y observa su fallo esperado.
   - **Verde**: escribe el código mínimo cumpliendo `ADR-008`, SOLID y [nomenclatura.md](../../../docs/06-estandares/nomenclatura.md). Si cambia `openapi.json`, regenera Orval (`npm run api:generate`).
   - **Refactor**: limpia nombres/duplicación manteniendo todas las pruebas en verde.
3. **Verificación recomendada en vivo (UI/HTTP)**: si la fase incluyó cambios de interfaz web o endpoints nuevos, levanta localmente backend (`uvicorn`) + frontend (`vite`) y valida las rutas críticas con el subagente `browser` (o consulta HTTP local si Chrome DevTools no está disponible en el host, registrándolo en el acta sin bloquear el cierre).
4. **Re-verificación final**: vuelve a ejecutar el Paso 2 (`auditar_estado_fase.py --estricto`) y todas las puertas del Paso 3 después de la última edición.

### Paso 6 · Cierre documental obligatorio (**Modo B**)

1. Asegúrate de archivar cualquier cambio OpenSpec concluido de la fase mediante `/opsx:archive` (y que no queden cambios terminados abiertos en `openspec/changes/`).
2. Redacta o actualiza `docs/07-fases/fase-NN-<nombre>.md` usando la plantilla [plantilla-fase-cierre.md](./resources/plantilla-fase-cierre.md) y actualiza la tabla índice en [docs/07-fases/README.md](../../../docs/07-fases/README.md).
3. Normaliza fin de línea **CRLF** (`\r\n`) en todos los `.md` editados, revisa `git status --short` y entrega el resumen final con enlaces verificables (sin `commit` ni `push` salvo orden explícita).
