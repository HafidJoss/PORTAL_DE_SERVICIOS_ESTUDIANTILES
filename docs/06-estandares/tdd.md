# Estándar de TDD (desarrollo guiado por pruebas)

> **Proyecto:** Portal de Servicios Estudiantiles · **Alcance:** backend y frontend
> **Estado:** vigente desde el inicio de la implementación · **Versión:** 1.0

---

## 1. Propósito

Definir cómo se aplica TDD en el proyecto para que todo comportamiento quede demostrado por una prueba automatizada antes de darse por terminado. Se aplica a las personas y a los agentes de IA que escriban código, usen o no los comandos `/opsx:*`.

| Aspecto | Definición |
|---|---|
| Qué es TDD | Escribir primero una prueba que falla, luego el código mínimo que la hace pasar y después mejorar el diseño |
| Por qué lo usamos | Las reglas del MINEDU, las notas y los datos de menores no admiten errores silenciosos (AC04, AC05) |
| Relación con OpenSpec | La spec dice **qué** debe pasar; la prueba lo demuestra; el código lo cumple |
| Fuente de verdad | Este documento. `openspec/config.yaml` y `CLAUDE.md` lo resumen y remiten aquí |

---

## 2. Reglas obligatorias

| # | Regla |
|---|---|
| 1 | No se escribe código de `reglas.py` ni de `service.py` sin una prueba que falle primero |
| 2 | En `router.py` y `repository.py`, la prueba de integración se escribe en la misma tarea que la implementación |
| 3 | Cada `Scenario` de una spec tiene al menos una prueba que lo referencia |
| 4 | Una tarea solo se marca como hecha con todas las pruebas en verde |
| 5 | No se modifica una prueba para que pase. Si el escenario está mal, primero se corrige la spec con `/opsx:update` |
| 6 | Toda corrección de error empieza con una prueba que lo reproduce |
| 7 | Nunca se eliminan, omiten ni desactivan pruebas (`skip`, `xfail`) sin dejar el motivo y un seguimiento |
| 8 | Las pruebas nunca usan datos reales de estudiantes ni apoderados (Ley N.º 29733) |
| 9 | Las pruebas nunca se conectan a Google Cloud ni a servicios remotos |

---

## 3. El ciclo

| Fase | Qué se hace | Cómo se sabe que terminó |
|---|---|---|
| **1. Rojo** | Escribir una sola prueba del comportamiento siguiente | La prueba falla **por el motivo esperado**, no por un error de importación o de sintaxis |
| **2. Verde** | Escribir el código mínimo que la haga pasar | Esa prueba y todas las anteriores pasan |
| **3. Refactor** | Mejorar nombres y estructura sin cambiar el comportamiento | Las pruebas siguen en verde y no se agregó funcionalidad |

Reglas del ciclo:

- Una prueba a la vez; no se escribe un lote de pruebas por adelantado.
- En verde no se agrega nada que ninguna prueba exija.
- Si una prueba pasa al primer intento, no demuestra nada todavía: hay que comprobar que puede fallar.

---

## 4. De la spec a la prueba

Cada escenario se traduce a una prueba: `GIVEN` prepara los datos, `WHEN` ejecuta la acción y `THEN` verifica el resultado. El nombre de la prueba describe el comportamiento y un comentario enlaza el escenario.

**Ejemplo ilustrativo.** Escenario en `openspec/specs/institucion/spec.md`:

```markdown
### Requirement: Cambio de estado del periodo (RF05, HU09)

#### Scenario: Secretaría no puede saltarse un estado
- GIVEN un periodo en estado Aperturado
- WHEN se intenta pasarlo a Consolidado
- THEN el sistema rechaza el cambio
```

**Rojo:** se escribe la prueba y falla porque la regla no existe.

```python
# backend/tests/institucion/test_reglas.py
# Spec: institucion · Scenario: Secretaría no puede saltarse un estado (RF05, HU09)
from app.modules.institucion import reglas


def test_no_permite_saltar_de_aperturado_a_consolidado():
    assert reglas.transicion_valida("Aperturado", "Consolidado") is False
```

**Verde:** se escribe lo mínimo que la hace pasar.

```python
# backend/app/modules/institucion/reglas.py
ORDEN = ("Aperturado", "En Evaluación", "Cierre Preliminar", "Consolidado")


def transicion_valida(actual: str, nuevo: str) -> bool:
    return ORDEN.index(nuevo) == ORDEN.index(actual) + 1
```

**Refactor:** se mejora el código, por ejemplo con un `Enum` de estados, sin cambiar lo que la prueba verifica.

> La transición secuencial de este ejemplo es un supuesto. Las reglas reales salen de cada spec aprobada.

---

## 5. Pruebas por capa del backend

| Capa | Qué se prueba | Tipo | Base de datos | ¿Prueba primero? |
|---|---|---|---|---|
| `reglas.py` | Funciones puras: estados, validaciones, cálculo CNEB | Unitaria | No | **Siempre** |
| `service.py` | Casos de uso, errores de dominio y llamada a la auditoría, con repositorio y services falsos | Unitaria | No | **Siempre** |
| `repository.py` | Consultas, restricciones, índices y columna `version` | Integración | PostgreSQL real | Misma tarea |
| `router.py` y `dependencies.py` | Códigos de respuesta, formato, token, rol y pertenencia | Integración | PostgreSQL real | Misma tarea |
| `core/` | Comportamiento propio, con los servicios externos simulados | Unitaria | Según el caso | Misma tarea |

Herramientas: **pytest** para todas las pruebas y **testcontainers** para levantar un PostgreSQL 16+ desechable. No se usa SQLite como sustituto, porque no valida privilegios, tipos ni concurrencia.

### 5.1 Estructura de carpetas

```text
backend/tests/
├── conftest.py                  Configuración y datos compartidos
└── <modulo>/
    ├── test_reglas.py           Unitarias de reglas.py
    ├── test_service.py          Unitarias de service.py
    ├── test_repository.py       Integración con PostgreSQL
    └── test_api.py              Integración de los endpoints
```

### 5.2 Convenciones

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivo | `test_<capa>.py` | `test_service.py` |
| Función | `test_<comportamiento_en_español>` | `test_rechaza_nota_con_periodo_cerrado` |
| Estructura | Preparar, actuar, verificar, separados por líneas en blanco | — |
| Alcance | Un comportamiento por prueba | — |
| Trazabilidad | Comentario con la spec y los IDs (`RF`, `HU`) | `# Spec: evaluacion · RF08` |

### 5.3 Dobles de prueba

| Situación | Qué usar |
|---|---|
| `service.py` necesita datos | Repositorio falso en memoria, inyectado por el constructor |
| `service.py` llama a otro módulo | Service falso de ese módulo |
| Cloud Storage, Cloud Tasks, Secret Manager | Sustituto local de la función de `core/`; nunca el servicio real |
| Fecha y hora | Valor fijo inyectado, nunca el reloj real |

No se simula lo que se está probando, y en `test_repository.py` y `test_api.py` no se simula la base de datos.

---

## 6. Casos que siempre deben probarse

| Tema | Qué debe demostrarse | Referencia |
|---|---|---|
| **Permisos** | Sin token, con token inválido y con rol incorrecto la petición se rechaza | ADR-004, AC04 |
| **Pertenencia** | Un apoderado no accede a otro menor; un docente no accede a otra sección | DA05, AC04 |
| **Auditoría** | Toda modificación de notas o cambio de estado de trámite genera registro con fecha, usuario e IP | ADR-005, AC05 |
| **Inalterabilidad** | El rol de la aplicación no puede modificar ni borrar la bitácora | ADR-005 |
| **Transacciones** | Si falla un paso, no queda ningún cambio parcial | ADR-008, AC05 |
| **Concurrencia** | Dos ediciones de la misma nota: la segunda se rechaza por la columna `version` | Enfoque arquitectónico |
| **Estados** | Las transiciones inválidas de periodos y expedientes se rechazan | RF05, RF13 |
| **Errores** | Los errores de dominio salen como Problem Details | Enfoque arquitectónico |
| **Tareas asíncronas** | Ejecutar la misma tarea dos veces da el mismo resultado | ADR-003 |
| **Privacidad** | La consulta pública por ticket no devuelve datos personales | RF10 |

---

## 7. Frontend

La arquitectura no define herramientas de prueba para el frontend. Se **propone** Vitest y React Testing Library, a confirmar al configurar el frontend.

| Qué se prueba | Enfoque |
|---|---|
| Reglas de la interfaz (permisos visibles, formato de notas) | Prueba primero |
| Componentes y pantallas | Desde lo que ve y hace el usuario, no desde detalles internos |
| Llamadas a la API | Se simula la API; el cliente de `api/generated/` no se edita ni se prueba |

---

## 8. Aplicación en el flujo de OpenSpec

| Paso | Qué exige este estándar |
|---|---|
| `/opsx:propose` · specs | Escenarios verificables, con casos de error y de permisos |
| `/opsx:propose` · design | Plan de pruebas por capa |
| `/opsx:propose` · tasks | Prueba antes de cada implementación, de adentro hacia afuera: `reglas.py`, `service.py`, `repository.py`, `router.py`, frontend |
| `/opsx:apply` | Ciclo rojo, verde y refactor en cada tarea |
| `/opsx:archive` | Pruebas e import-linter en verde y `openspec validate --strict` sin errores |

---

## 9. Excepciones

| Caso | Qué se permite | Condición |
|---|---|---|
| Configuración y documentación | No requieren prueba | No contienen lógica |
| Código generado (`api/generated/`, migraciones autogeneradas) | No se prueba directamente | La migración se valida al aplicarla en las pruebas de integración |
| Exploración técnica | Código sin prueba | Es desechable; lo que se conserve se reescribe con TDD |
| Ajustes visuales | Sin prueba automatizada | No cambian comportamiento |

Cualquier otra excepción se explica en el cambio correspondiente.

---

## 10. Cobertura

La cobertura es una señal, no el objetivo: un valor alto no demuestra que las pruebas verifiquen algo útil. Se **proponen** estos mínimos, a confirmar al configurar las herramientas:

| Código | Cobertura mínima propuesta |
|---|---|
| `reglas.py` | 100 % |
| `service.py` | 90 % |
| Backend completo | 80 % |

---

## 11. Lista de verificación

Antes de dar una tarea por terminada:

- [ ] La prueba se escribió primero y se vio fallar por el motivo esperado.
- [ ] Cada escenario de la tarea tiene su prueba, con la referencia a la spec.
- [ ] Se cubrieron los casos de error y de permisos que correspondan.
- [ ] Hay prueba de auditoría si cambian notas o estados de trámite.
- [ ] Todas las pruebas pasan, no solo las nuevas.
- [ ] import-linter no reporta violaciones.
- [ ] No hay pruebas omitidas sin motivo ni datos reales.
- [ ] El código no hace más de lo que exigen las pruebas.

---

## 12. Estado de aplicación

| Control | Estado |
|---|---|
| Reglas en `openspec/config.yaml` | Vigentes; son instrucciones, no controles automáticos |
| pytest y testcontainers | Por configurar en `bootstrap-backend` |
| import-linter y umbral de cobertura | Por configurar en `bootstrap-backend` |
| Comprobación automática en cada push | Pendiente de decidir el CI |
| Herramientas del frontend | Pendientes de confirmar |

Mientras no existan estos controles, el cumplimiento depende de la revisión de cada cambio.
