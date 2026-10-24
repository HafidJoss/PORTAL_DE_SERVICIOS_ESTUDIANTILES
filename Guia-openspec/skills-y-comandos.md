# Guía en español de las skills y comandos de OpenSpec

Esta guía explica qué hace cada skill y cada comando `/opsx:*` instalados en `.claude/`. Sirve para **entenderlos**, no los reemplaza: los archivos originales están en inglés, son los que Claude ejecuta y `openspec update` los regenera, así que no se editan. Describe OpenSpec 1.15.0 con el perfil `core` (6 flujos). Los flujos del perfil ampliado (`new`, `continue`, `ff`, `verify`, `bulk-archive` y `onboard`) no están instalados todavía y esta guía no los cubre.

---

## 1. La idea en un minuto

OpenSpec organiza el trabajo en una carpeta `openspec/`:

| Ruta | Qué contiene |
| :--- | :--- |
| `openspec/specs/<capacidad>/spec.md` | Lo que el sistema hace hoy (la "verdad vigente"). Una capacidad por carpeta; en este proyecto, una capacidad es un módulo. |
| `openspec/changes/<cambio>/` | Un cambio en curso con cuatro artefactos: `proposal.md` (qué y por qué), `specs/<capacidad>/spec.md` (el *delta*: lo que se agrega, modifica o elimina), `design.md` (cómo) y `tasks.md` (los pasos). |
| `openspec/changes/archive/` | Cambios terminados, con la fecha en el nombre (`AAAA-MM-DD-<cambio>`). |
| `openspec/config.yaml` | El contexto y las reglas del proyecto que las skills leen antes de trabajar. |

El ciclo de un cambio:

```
 explore --> propose --> [ revisas tú ] --> apply --> archive
 (pensar)    (planear)   (apruebas el plan) (código)   (cerrar)
                 ^                              |
                 +--------- update <------------+   si el plan cambia
 sync: pasa el delta a openspec/specs sin archivar el cambio
```

La regla de oro de SDD (desarrollo guiado por especificaciones): **primero se acuerda el plan por escrito, después se escribe código.** Solo `apply` escribe código.

---

## 2. Comando o skill: qué diferencia hay

Cada flujo existe en dos formas con el mismo contenido:

- **Comando** (`/opsx:propose`, etc., en `.claude/commands/opsx/`): lo invocas tú escribiéndolo.
- **Skill** (`openspec-propose`, etc., en `.claude/skills/`): Claude la activa solo cuando entiende tu intención (por ejemplo, si dices "openspec apply").

Cuatro de los seis comandos son idénticos a sus skills (`propose`, `update`, `apply` y `sync`). `explore` y `archive` difieren solo en los ejemplos: el comando `explore` no trae los ejemplos de conversación y el comando `archive` trae más ejemplos de salida. Todos pueden ejecutar comandos `openspec ...` sin pedirte permiso (`allowed-tools: Bash(openspec:*)`).

| Comando | Skill | Para qué | ¿Escribe archivos? | ¿Toca código? |
| :--- | :--- | :--- | :--- | :--- |
| `/opsx:explore` | `openspec-explore` | Pensar y aclarar ideas | Solo artefactos de un cambio, y solo si lo confirmas | No |
| `/opsx:propose <nombre>` | `openspec-propose` | Crear un cambio con todo su plan | Sí, los artefactos de planificación | No |
| `/opsx:update` | `openspec-update-change` | Revisar y reconciliar el plan de un cambio | Sí, artefactos existentes, con tu confirmación | No |
| `/opsx:apply` | `openspec-apply-change` | Implementar las tareas | Sí, código y casillas de `tasks.md` | **Sí (el único)** |
| `/opsx:sync` | `openspec-sync-specs` | Pasar el delta a las specs vigentes | Sí, `openspec/specs/` | No |
| `/opsx:archive` | `openspec-archive-change` | Cerrar un cambio terminado | Sí, mueve el cambio y puede sincronizar specs | No |

---

## 3. Lo que tienen en común las seis

Todas empiezan con el mismo bloque de reglas:

- **Store (repositorio OpenSpec independiente).** Si nombras uno, la skill lo descubre con `openspec store list --json` y agrega `--store <id>` a sus comandos. **No aplica a este proyecto**: sin store, actúan sobre la carpeta `openspec/` más cercana.
- **Comprobación del proyecto.** Antes de escribir, ejecutan `openspec list --json` y miran `root`. Si es `null`, no hay `openspec/` en este lugar. Entonces: si la skill se activó sola, responde normal sin hablar de OpenSpec; si lo pediste explícitamente, te pregunta qué hacer (`openspec init`, usar un store o seguir sin OpenSpec). Nunca crean `openspec/` por su cuenta.
- **Qué cambio usar.** Usan el nombre que des; si no, lo infieren de la conversación; si solo hay un cambio activo, ese; si hay varios, te los listan y preguntan. Siempre anuncian `Using change: <nombre>` y cómo cambiarlo (por ejemplo `/opsx:apply otro-cambio`).
- **Contexto y reglas del proyecto.** Leen `openspec/config.yaml` (ver sección 5). El contexto y las reglas son restricciones para Claude: **no se copian** dentro de los archivos que se generan.
- **Son contratos de prompt, no controles automáticos.** Nada obliga técnicamente a una skill a obedecer el contexto o las guías; por eso el TDD también debe respaldarse con el CI y con tu revisión.
- **Pausa ante la duda.** Si algo es ambiguo, preguntan en vez de adivinar.

---

## 4. Cada flujo en detalle

### 4.1. `/opsx:explore` — pensar antes de decidir

**Para qué sirve:** ser un compañero de pensamiento. Investiga el código y los documentos, compara opciones, dibuja diagramas y señala riesgos. No es un flujo con pasos fijos: es una *postura*.

**Cuándo usarlo:** antes de proponer un cambio, o a mitad de uno cuando algo resulta más difícil de lo esperado. Ejemplo: `/opsx:explore ¿cómo modelamos el vínculo N:M entre apoderados y estudiantes?`

**Cómo se comporta:**
- Es curioso, no prescriptivo: hace **una pregunta a la vez**, explica por qué la hace y ofrece una recomendación fundamentada cuando hay evidencia. No te pregunta lo que puede averiguar leyendo el repositorio.
- Dibuja diagramas **solo en ASCII**, porque los símbolos Unicode se desalinean entre terminales.
- Al empezar revisa qué hay: `openspec list --json` (cambios en curso) y `openspec list --specs` (capacidades ya especificadas); lee con `openspec show <spec> --type spec` las que sean relevantes y luego `openspec/config.yaml`.
- **Sin cambio activo:** piensa libremente. Si tú le pides capturar la exploración como cambio, ejecuta `openspec new change "<nombre>"` (nunca crea la carpeta a mano) y crea solo los artefactos que pediste, en orden de dependencia. Luego se detiene y te indica `/opsx:propose` o `/opsx:apply`.
- **Con un cambio activo:** lee sus artefactos, los menciona en la conversación y ofrece guardar lo decidido donde corresponde:

| Hallazgo | Dónde se guarda |
| :--- | :--- |
| Requisito nuevo o cambiado | `specs/<capacidad>/spec.md` |
| Decisión de diseño | `design.md` |
| Cambio de alcance | `proposal.md` |
| Trabajo nuevo | `tasks.md` |

**Qué no hace:** nunca implementa ni edita código. Tampoco crea ni edita esquemas, plantillas o `openspec/config.yaml` (eso cuenta como un cambio, no como pensar). Antes de su primera escritura nombra los archivos, te hace una pregunta de sí o no y espera tu confirmación **en un mensaje aparte**; responder preguntas de diseño nunca cuenta como permiso. Si pides que lo implemente, te dirige a `/opsx:propose`.

---

### 4.2. `/opsx:propose <nombre>` — crear el plan completo

**Para qué sirve:** crea un cambio y genera de una sola vez los cuatro artefactos: `proposal.md`, el delta en `specs/<capacidad>/spec.md`, `design.md` y `tasks.md`.

**Cuándo usarlo:** cuando ya sabes qué quieres construir o corregir. Ejemplo: `/opsx:propose institucion-estados-periodo`. Si no das nombre, te pregunta qué quieres hacer y deriva uno en kebab-case.

**Paso a paso:**
1. **Entiende la petición.** Si hay ambigüedad que cambiaría el alcance, el comportamiento observable o los criterios de aceptación, te pregunta antes de crear nada; los detalles menores los asume y los anota en los artefactos.
2. **Carga el contexto del proyecto.** `openspec context --json` da la raíz; lee `config.yaml`. El `context` (hasta 51,200 bytes) se aplica antes de explorar el código; si el archivo está dañado o es demasiado grande, se ignora en silencio.
3. **Elige el esquema de trabajo.** Por defecto `spec-driven`; otro solo si lo pides.
4. **Crea el cambio:** `openspec new change "<nombre>"` (genera la carpeta con `.openspec.yaml`).
5. **Obtiene el orden de construcción:** `openspec status --change "<nombre>" --json`.
6. **Redacta cada artefacto** cuando está `ready`, en orden de dependencia: pide `openspec instructions <artefacto> --change "<nombre>" --json` (que devuelve `context`, `rules` de ese artefacto, `template`, `instruction` y `dependencies`), relee las dependencias desde el disco, **inspecciona el proyecto en solo lectura** (código, pruebas, configuración y documentos fuera de `openspec/`) y escribe el archivo con la plantilla. Repite hasta tener todos. `design.md` es condicional y puede omitirse si su instrucción lo marca como opcional; `specs` solo se omite si el cambio declara `skip_specs`.
7. **Muestra el estado final** y resume qué creó.

**Qué no hace:** **planifica y se detiene.** Aunque le pidas "construye X", solo crea el plan; para implementar debes pedirlo en un mensaje nuevo (`/opsx:apply`). Si ya existe un cambio con ese nombre, te pregunta si continuarlo o crear otro.

---

### 4.3. `/opsx:update` — mantener el plan coherente

**Para qué sirve:** revisa los artefactos **ya existentes** de un cambio y los deja consistentes entre sí. No confundir con el comando de terminal `openspec update`, que solo regenera las skills.

**Cuándo usarlo:** cuando una decisión cambió el diseño, cuando editaste un artefacto a mano y los demás quedaron desfasados, o cuando un ADR cambió y el plan debe reflejarlo. También cuando una prueba te obliga a corregir la spec antes de seguir (la guía de `apply` lo indica).

**Paso a paso:**
1. Elige el cambio (si hay varios, te muestra los 3 o 4 modificados más recientemente y recomienda el más reciente).
2. Lee su estado con `openspec status --change "<nombre>" --json`.
3. Entiende qué pides: una edición concreta ("el diseño ahora usa X") o una revisión general de coherencia.
4. Lee todos los artefactos, **redacta la edición en la conversación (no en archivos)** y la compara con los demás en cualquier dirección: un cambio en `tasks.md` puede obligar a corregir `proposal.md`.
5. Te muestra cada revisión propuesta y su motivo, y **solo escribe lo que confirmes**, artefacto por artefacto. Lo que rechaces no se toca.
6. Te indica el siguiente paso: `/opsx:apply` si el cambio ya estaba implementado (el código puede haber quedado desfasado) o `/opsx:archive` si todo está hecho.

**Qué no hace:** nunca edita código ni crea artefactos que faltan (para eso te indica cómo hacerlo con `openspec instructions`). Si lo que pides cambia la *intención* del cambio en vez de refinarla, te sugiere crear uno nuevo.

---

### 4.4. `/opsx:apply [nombre]` — implementar las tareas

**Para qué sirve:** recorre `tasks.md` y las implementa una por una. Es el **único flujo que escribe código**.

**Cuándo usarlo:** cuando revisaste y aprobaste el plan creado por `propose`. También sirve para continuar una implementación interrumpida.

**Paso a paso:**
1. Elige y anuncia el cambio.
2. Consulta su estado (`openspec status ... --json`).
3. Pide `openspec instructions apply --change "<nombre>" --json`. Esto devuelve la lista de archivos de contexto, el progreso, las tareas (con archivo y línea de cada casilla), una instrucción según el estado, el `context` del proyecto (obligatorio) y la `operationGuidance` (consejo opcional de `config.yaml`). Según el estado:
   - `blocked`: faltan artefactos; se detiene y te sugiere completarlos.
   - `all_done`: no hay nada pendiente; te sugiere revisar o verificar antes de archivar.
   - cualquier otro: implementa.
4. Lee todos los archivos de contexto (proposal, specs, design y tasks).
5. Muestra el progreso (`N/M tareas completas`).
6. **Bucle por tarea:** anuncia la tarea → hace los cambios mínimos y enfocados → comprueba que la casilla sigue coincidiendo con su texto → la marca (`- [ ]` pasa a `- [x]`) en su archivo y línea → vuelve a pedir las instrucciones para confirmar que el progreso cambió → sigue con la siguiente.
7. Al terminar o pausar, muestra el resumen.

**Cuándo se detiene y te pregunta:** si una tarea no está clara; si la implementación revela un problema de diseño (sugiere actualizar los artefactos); si una tarea necesita trabajo más allá de lo que dicen la spec y las tareas (**no absorbe el alcance extra en silencio, ni reduce, pospone o acepta excepciones al comportamiento especificado**); ante un error o bloqueo; o si la interrumpes.

**Reglas importantes:** solo marca una tarea como hecha cuando su comportamiento especificado está **totalmente** implementado, no a medias ni diferido. El contexto y la guía del proyecto no cuentan como prueba de que una tarea terminó. En este proyecto la guía de `apply` le pide, además, trabajar en TDD (prueba que falla, código mínimo, refactor).

---

### 4.5. `/opsx:sync [nombre]` — actualizar las specs sin archivar

**Para qué sirve:** fusiona los delta specs del cambio en las specs vigentes de `openspec/specs/`, **sin archivar** el cambio. Es una fusión inteligente hecha por Claude (por ejemplo, agrega un escenario a un requisito sin copiar el requisito entero), y es idempotente: ejecutarla dos veces da el mismo resultado.

**Cuándo usarlo:** cuando otro cambio necesita ver ya las specs actualizadas, o cuando quieres revisar cómo quedarían antes de archivar. `archive` la ejecuta por ti si se lo aceptas.

**Paso a paso:**
1. Elige el cambio (te muestra los que tienen delta specs).
2. Resuelve su contexto (`openspec status ... --json`).
3. Busca los delta specs. Si no hay ninguno, informa y termina.
4. Una sola vez pide las reglas de `specs` (`openspec instructions specs ...`) para respetarlas al escribir. Si esa consulta falla, **no escribe nada**.
5. Para cada delta lee el delta y la spec vigente, y aplica los cambios:

| Sección del delta | Qué hace en la spec vigente |
| :--- | :--- |
| `## ADDED Requirements` | Agrega el requisito (si ya existía, lo actualiza) |
| `## MODIFIED Requirements` | Cambia el requisito o sus escenarios y conserva lo que el delta no menciona |
| `## REMOVED Requirements` | Elimina el bloque; solo retira la capacidad entera (borra su `spec.md`) si se cumplen condiciones estrictas, entre ellas `retire_capabilities: true` en `.openspec.yaml` |
| `## RENAMED Requirements` | Renombra de `FROM` a `TO` |

6. Si la capacidad **no existe todavía**, solo se aplican los ADDED (se crea la spec con ellos); un MODIFIED o RENAMED sobre algo inexistente se bloquea, porque no hay nada que modificar.
7. Ejecuta `openspec validate --specs` y resume qué se agregó, modificó, eliminó o renombró. Si la validación falla, no declara éxito.

**Formato resultante:** una spec vigente nunca contiene encabezados de delta; todo queda bajo `## Requirements` con `# <capacidad> Specification` y `## Purpose` al inicio.

---

### 4.6. `/opsx:archive [nombre]` — cerrar un cambio terminado

**Para qué sirve:** da por terminado un cambio: (opcionalmente) sincroniza sus specs y mueve su carpeta a `openspec/changes/archive/AAAA-MM-DD-<nombre>/`.

**Cuándo usarlo:** cuando la implementación está completa y revisada.

**Paso a paso:**
1. Elige el cambio (solo activos) y carga, si existe, la guía de archivado. Esa consulta es opcional y **nunca bloquea** el archivado.
2. **Artefactos:** si alguno no está `done` ni `skipped`, te advierte y pide confirmar.
3. **Tareas:** cuenta tareas totales y completas con `openspec list --json` (solo las casillas `x` o `X` cuentan como completas). Si hay pendientes, te advierte y pide confirmar.
4. **Specs:** compara cada delta con su spec vigente y te ofrece, según el caso:
   - hay cambios por aplicar: "Sync now (recomendado)" o "Archive without syncing";
   - ya está sincronizado: "Archive now", "Sync anyway" o "Cancel";
   - algo está bloqueado (por ejemplo un MODIFIED sobre una capacidad inexistente): solo "Archive without syncing" o "Cancel".

   Si eliges sincronizar, ejecuta la skill `sync` **en el momento, no en segundo plano**, verifica la estructura de lo escrito y vuelve a comparar. Si algo no coincide, **no archiva** y no mueve nada.
5. **Archiva:** crea la carpeta `archive` si hace falta y mueve el cambio con el prefijo de fecha (no repite la fecha si el nombre ya la trae; si el destino ya existe, falla).
6. Muestra el resumen: cambio, esquema, ubicación del archivo, si se sincronizaron las specs y las advertencias.

**Reglas importantes:** las advertencias informan y piden confirmación, pero no impiden archivar. Nunca archiva mientras una sincronización sigue en curso.

---

## 5. Qué toma cada flujo de `openspec/config.yaml`

| Sección de `config.yaml` | Quién la usa | Cuándo |
| :--- | :--- | :--- |
| `context` | Todos los flujos | Como restricción de fondo (stack, arquitectura, dominio, trazabilidad). Nunca se copia a los archivos. |
| `rules.proposal`, `rules.specs`, `rules.design`, `rules.tasks` | `propose`, `update`, y `explore` cuando captura artefactos | Solo al redactar ese artefacto. `sync` y `archive` aplican `rules.specs` únicamente al contenido de las specs vigentes que escriben. |
| `operations.apply.guidance` | `apply` | Consejos opcionales (en este proyecto, el TDD). Los ignora, explicando por qué, si chocan con la instrucción del flujo. |
| `operations.archive.guidance` | `archive` | Consejos opcionales antes de archivar. |

---

## 6. Flujo típico en este proyecto

```
/opsx:explore  ->  ¿qué decisiones faltan? (por ejemplo, RF07)
/opsx:propose bootstrap-backend  ->  proposal, specs, design y tasks
(tú revisas el plan)  ->  /opsx:update si hay que corregirlo
/opsx:apply  ->  implementa tarea por tarea, prueba primero
/opsx:archive  ->  sincroniza las specs y cierra el cambio
```

Comandos de terminal útiles para seguir lo que pasa: `openspec list` (cambios en curso), `openspec status --change <nombre>` (qué artefactos faltan), `openspec show <nombre>` (leer un cambio o una spec), `openspec validate --all --strict` (comprobar el formato) y `openspec view` (panel interactivo).

---

## 7. Glosario

| Término | Significado |
| :--- | :--- |
| Cambio (*change*) | Una unidad de trabajo con su plan en `openspec/changes/<nombre>/`. |
| Artefacto | Cada archivo del plan: `proposal.md`, `specs/.../spec.md`, `design.md`, `tasks.md`. |
| Capacidad (*capability*) | Un área de comportamiento con su spec en `openspec/specs/<capacidad>/`. Aquí, un módulo. |
| Delta spec | La spec dentro de un cambio: solo lo que se agrega (`ADDED`), modifica (`MODIFIED`), elimina (`REMOVED`) o renombra (`RENAMED`). |
| Spec vigente (principal) | La spec en `openspec/specs/`, ya fusionada; describe lo que el sistema hace hoy. |
| Esquema (*schema*) | La receta de artefactos y su orden; aquí `spec-driven`. |
| `.openspec.yaml` | Metadatos del cambio; puede traer `skip_specs` (omite las specs) o `retire_capabilities` (permite retirar una capacidad). |
| `planningHome` / `changeRoot` | Rutas que la CLI informa para saber dónde viven la planificación y el cambio; las skills las usan en vez de suponer rutas. |
| Store | Repositorio OpenSpec independiente y registrado en el equipo. No se usa en este proyecto. |
| Skill / comando | Dos formas de invocar el mismo flujo: Claude la activa sola / tú la escribes. |

---

## 8. Advertencias

- Esta guía **resume y traduce**; ante cualquier duda manda el texto original de cada skill en `.claude/skills/` y `.claude/commands/opsx/`.
- Si actualizas OpenSpec (`npm install -g @fission-ai/openspec@latest` y `openspec update`), las skills pueden cambiar. Conviene revisar esta guía cuando cambie la versión.
- Cuando actives el perfil ampliado, habrá que agregar aquí los flujos nuevos.
