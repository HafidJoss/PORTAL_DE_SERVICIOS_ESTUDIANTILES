# Principios de diseño (SOLID)

## Objetivo

Documentar cómo se aplican los principios SOLID en el backend del Portal de Servicios Estudiantiles, organizado en capas estrictas, para que cada módulo se programe de forma uniforme y las reglas del colegio no dependan de HTTP ni de la base de datos.

## Contexto

- **Estilo:** monolito modular en Python 3.12+ con FastAPI sobre Cloud Run (ADR-001).
- **Enfoque interno:** capas estrictas por módulo (presentación, negocio, acceso a datos) e infraestructura en `core/` (ADR-008).
- **Módulo de referencia:** `evaluacion`, porque reúne validación, estado del periodo, concurrencia y auditoría.

## SOLID en el módulo `evaluacion`

| Principio | Dónde se aplica (capa) | Cómo se cumple en el portal | Archivos |
|---|---|---|---|
| **S** · Responsabilidad única | Todas las capas | El router recibe la petición, el service coordina el registro de la nota, `reglas.py` decide si el periodo lo permite y el repositorio guarda en PostgreSQL | `router.py`, `service.py`, `reglas.py`, `repository.py` |
| **O** · Abierto/cerrado | Negocio | Una nueva condición de promoción por nivel o grado se agrega como otra estrategia en `reglas.py`; el service no se modifica | `reglas.py` |
| **L** · Sustitución de Liskov | Negocio | Todas las estrategias de promoción reciben y devuelven lo mismo; el service funciona igual con cualquiera | `reglas.py` |
| **I** · Segregación de interfaces | Presentación | Cada operación tiene su propio esquema (`NotaCreate` para entrar, `NotaOut` para salir) y cada dependencia hace una sola verificación (token, rol, pertenencia) | `schemas.py`, `dependencies.py` |
| **D** · Inversión de dependencias | Negocio e infraestructura | El service recibe el repositorio y los services de otros módulos por `Depends`, y el negocio no importa FastAPI ni el SDK de Google Cloud | `service.py`, `dependencies.py`, `core/` |

> **Alcance de la inversión de dependencias:** ADR-008 descartó la Clean Architecture completa con puertos y adaptadores por exceso de ceremonia para un solo desarrollador. Por eso no hay interfaces formales: la independencia se logra con inyección por `Depends`, con `core/` como única puerta a la infraestructura y con import-linter en el CI.

## Qué pasaría sin SOLID en el portal

| Situación real | Sin SOLID | Con SOLID |
|---|---|---|
| Cambia una condición de promoción de un grado (RF28) | Hay que buscar la regla en routers y consultas | Se cambia una estrategia en `reglas.py` |
| Se cambia Cloud Storage o el motor de PDF | Se modifican los módulos que generan o guardan archivos | Solo cambia `core/` |
| Se quiere probar el registro de notas | Se necesita la base de datos y un servidor HTTP | `reglas.py` se prueba solo y el service con un repositorio falso |
| Un endpoint nuevo modifica notas | Puede olvidar la auditoría | El service centraliza la auditoría y una prueba lo verifica |

## Relación con la arquitectura en capas y los patrones

| Principio | Lo cumple en el proyecto |
|---|---|
| Responsabilidad única | La separación router → service → repository |
| Abierto/cerrado y Liskov | El patrón Strategy para las reglas de promoción y conclusión |
| Segregación de interfaces | Los DTO de Pydantic y las dependencias pequeñas de FastAPI |
| Inversión de dependencias | Dependency Injection con `Depends` y el patrón Adapter en `core/` |

Ver también [02-patrones-de-diseno.md](02-patrones-de-diseno.md) y [01-diseno-interno-de-modulos.md](01-diseno-interno-de-modulos.md).
