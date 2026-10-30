# Estándar de Git y GitHub

> **Proyecto:** Portal de Servicios Estudiantiles · **Alcance:** todo el repositorio
> **Estado:** vigente · **Versión:** 1.0

---

## 1. Propósito

Definir cómo se trabaja con ramas, commits y GitHub para que el historial sea claro y `main` se mantenga estable. Aplica a quien trabaje hoy en el proyecto, a quien se sume al equipo y a los agentes de IA.

---

## 2. Reglas obligatorias

| # | Regla |
|---|---|
| 1 | **No se trabaja en `main`:** no se edita, no se hacen commits directos y no se hace push directo |
| 2 | Todo el trabajo se hace en `dev` |
| 3 | `main` solo recibe cambios desde `dev`, cuando se sube a staging |
| 4 | Antes de empezar a trabajar se actualiza `dev` |
| 5 | Cada commit contiene un solo cambio lógico y sigue el formato de la sección 4 |
| 6 | Nunca se sube un secreto ni un archivo `.env` |
| 7 | Nunca se suben datos reales de estudiantes o apoderados (Ley N.º 29733) |
| 8 | Nunca se usa `git push --force` en `dev` ni en `main` |
| 9 | Nunca se omiten comprobaciones con `--no-verify` |

---

## 3. Ramas

| Rama | Para qué sirve | Quién escribe en ella |
|---|---|---|
| `main` | Rama estable; lo que contiene es lo que sube a staging | Solo se actualiza desde `dev`, por decisión del responsable del proyecto |
| `dev` | Rama de trabajo diario | Todo el equipo |

```text
dev   ──●──●──●──●──●──●──
                  \        \
main  ─────────────●────────●──   (solo cuando se sube a staging)
```

Antes de pasar `dev` a `main`, el código debe cumplir las pruebas de `tdd.md`. La lista completa de requisitos para staging se definirá en su propio estándar.

---

## 4. Commits

### 4.1 Formato

Se usa Conventional Commits, en español:

```text
tipo(alcance): resumen en infinitivo

Cuerpo opcional: qué cambia y por qué.
```

| Parte | Regla |
|---|---|
| `tipo` | Uno de la tabla 4.2 |
| `alcance` | Opcional. Módulo o área afectada: `evaluacion`, `admision`, `adr`, `readme` |
| Resumen | En infinitivo, sin punto final, hasta 72 caracteres |
| Cuerpo | Líneas de hasta 72 caracteres. Explica **qué** y **por qué**, no cómo |
| IDs | Si aplica, citar `RF`, `HU` o `ADR` en el cuerpo |

### 4.2 Tipos

| Tipo | Cuándo se usa | Ejemplo |
|---|---|---|
| `feat` | Funcionalidad nueva | `feat(evaluacion): registrar notas por competencia` |
| `fix` | Corrección de un error | `fix(admision): rechazar ticket inexistente` |
| `test` | Agregar o corregir pruebas | `test(institucion): cubrir transiciones de periodo` |
| `refactor` | Mejorar el código sin cambiar su comportamiento | `refactor(evaluacion): separar reglas de calificación` |
| `docs` | Documentación | `docs(adr): registrar decisión de migraciones` |
| `chore` | Mantenimiento y configuración | `chore: actualizar dependencias` |
| `ci` | Comprobaciones automáticas | `ci: agregar validación de specs` |

### 4.3 Buenas prácticas

| Hacer | Evitar |
|---|---|
| Commits pequeños y frecuentes | Un commit con el trabajo de varios días |
| Un cambio lógico por commit | Mezclar una funcionalidad con un refactor |
| Mensajes que expliquen el cambio | `arreglos`, `cambios`, `update`, `wip` |
| Renombrar archivos en su propio commit | Renombrar y modificar a fondo a la vez |
| Revisar lo que se va a confirmar | `git add .` sin mirar qué entra |

**Ejemplo completo:**

```text
feat(evaluacion): rechazar notas con el periodo cerrado

Un docente podía registrar notas después del cierre. El service
consulta ahora el estado del periodo antes de guardar.

Refs: RF05, RF08
```

---

## 5. Flujo de trabajo diario

```bash
# 1. Ubicarse en dev y actualizarla
git switch dev
git pull --rebase origin dev

# 2. Trabajar y revisar los cambios
git status
git diff

# 3. Preparar solo lo que corresponde a un cambio
git add <archivos>
git diff --cached --check

# 4. Confirmar
git commit

# 5. Antes de subir, traer lo último y volver a probar
git pull --rebase origin dev
git push origin dev
```

Antes de cada push:

- [ ] Estoy en `dev`.
- [ ] Las pruebas pasan.
- [ ] No hay secretos, `.env` ni datos reales en lo que subo.
- [ ] Cada commit sigue el formato de la sección 4.

---

## 6. Trabajo en equipo

| Situación | Qué hacer |
|---|---|
| Se suma una persona | Leer el README, `CLAUDE.md` y `docs/06-estandares/` |
| Antes de empezar una tarea | Avisar qué módulo se va a tocar, para no trabajar lo mismo a la vez |
| Dos personas tocan el mismo módulo | Acordar quién va primero y subir cambios pequeños con frecuencia |
| Cambia un requisito o un ADR | Actualizar el documento en el mismo trabajo y avisar al equipo |
| Cambia el contrato de la API | Regenerar el cliente Orval y avisar a quien trabaje en el frontend |
| Cambia la base de datos | Subir una sola migración a la vez para no crear ramas paralelas de Alembic |

### 6.1 Resolver conflictos

1. Mantener la calma: nada se pierde hasta terminar el proceso.
2. Ejecutar `git status` para ver los archivos en conflicto.
3. Abrir cada archivo y decidir qué queda, sin borrar el trabajo de otra persona. Ante la duda, preguntarle.
4. Ejecutar `git add <archivo>` y `git rebase --continue`.
5. Volver a ejecutar las pruebas antes de subir.
6. Si algo sale mal, `git rebase --abort` deja todo como estaba.

---

## 7. Corregir errores

| Situación | Qué hacer |
|---|---|
| Commit local mal escrito, aún sin subir | `git commit --amend` |
| Commit ya subido con un error | `git revert <hash>`; no se reescribe el historial compartido |
| Archivo preparado por error | `git restore --staged <archivo>` |
| Se subió un secreto | Avisar de inmediato y **cambiar el secreto**; borrarlo del historial no basta, porque ya quedó expuesto |
| Se trabajó en `main` por error | No subir. Avisar y mover el trabajo a `dev` antes de seguir |

---

## 8. Agentes de IA

Claude Code y cualquier otro agente:

- trabajan en local, en `dev`;
- **no hacen commit, push ni merge** salvo pedido explícito;
- no entran a la nube (Google Cloud, Firebase ni despliegues) salvo pedido explícito;
- no tocan `main`.

Aprobar un plan que incluye commits autoriza solo esos commits. Los commits hechos con ayuda de un agente pueden llevar la línea `Co-Authored-By`.

---

## 9. Configuración recomendada en GitHub

Estas opciones se activan en GitHub y **aún no están aplicadas**:

| Opción | Para qué sirve |
|---|---|
| Proteger `main` | Evita push directos y borrados |
| Exigir pull request de `dev` a `main` | Deja registro de cada subida a staging |
| Bloquear el force push en `dev` y `main` | Protege el historial compartido |
| Activar la detección de secretos | Avisa si se sube una clave |

Mientras no estén activas, estas reglas dependen de la disciplina de cada persona.
