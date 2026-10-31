# Patrones de diseño

## Objetivo

Documentar los patrones de diseño aplicados en el backend del Portal de Servicios Estudiantiles, indicando dónde se usan, qué problema resuelven y con qué tecnología se implementan, para que todos los módulos se programen de forma uniforme.

## Contexto

- **Estilo:** N-Tier sobre Google Cloud, con un backend monolito modular en Python 3.12+ y FastAPI (ADR-001).
- **Enfoque interno:** arquitectura en capas estricta por módulo: router → service → repository, con infraestructura en `core/` (ADR-008).
- **Base:** diagrama de componentes (C4 nivel 3) y [enfoque-arquitectonico.md](../02-arquitectura-software/enfoque-arquitectonico.md).

## Patrones aplicados

| Patrón | Dónde se usa | Problema que resuelve | Se implementa con | Archivos en el código |
|---|---|---|---|---|
| Repository | Todos los módulos → PostgreSQL | El negocio no debe conocer SQL ni SQLAlchemy | SQLAlchemy | `repository.py`, `models.py` |
| Unit of Work | Cada petición HTTP | Varias escrituras (nota y auditoría, cierre del trimestre y estado) deben confirmarse o revertirse juntas | Sesión de SQLAlchemy por petición en `core/database` | `core/database.py` |
| Strategy | `evaluacion` → reglas de conclusión y promoción por nivel y grado | Primaria y secundaria exigen condiciones distintas, y también cada grado, sin llenar el código de `if` | Funciones intercambiables en `reglas.py` | `modules/evaluacion/reglas.py` |
| State (máquina de estados) | `institucion` (trimestre) | Impedir transiciones inválidas, como editar notas con el trimestre Cerrado | Tabla de transiciones permitidas en `reglas.py` | `modules/institucion/reglas.py` |
| Facade | Comunicación entre módulos | Un módulo no debe conocer el repositorio ni las tablas de otro | El `service` de cada módulo es su única puerta de entrada | `service.py` de cada módulo |
| Dependency Injection | Presentación → negocio → acceso a datos | Crear y conectar dependencias sin acoplar las capas; facilita las pruebas | `Depends` de FastAPI | `dependencies.py` |
| Adapter | `core/` → servicios de Google Cloud y librerías | Los módulos no deben conocer el SDK de Cloud Storage, Cloud Tasks, WeasyPrint u openpyxl | Funciones de `core/` que traducen al SDK | `core/storage.py`, `core/pdf.py` |
| Optimistic Lock | `evaluacion` → notas | Dos ediciones simultáneas del mismo resultado o nivel no deben pisarse | Columna `version` en el modelo | `modules/evaluacion/models.py`, `repository.py` |
| DTO | Entrada y salida de la API | No exponer modelos SQLAlchemy y generar el cliente TypeScript | Esquemas Pydantic (`NotaCreate`, `NotaOut`) y Orval | `schemas.py` |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Repository | El service dice `guardar(nota)`; el repositorio escribe la consulta. |
| Unit of Work | Todo lo que se escribe en una petición se confirma con un solo commit al final, o se revierte entero. |
| Strategy | El service pide «qué conclusión exige este nivel» o «cumple la promoción de este grado» y se elige la regla sin cambiar el service. |
| State | Cada estado sabe a cuáles puede pasar: Aperturado → En Evaluación → Cierre Preliminar → Cerrado. |
| Facade | `seguimiento` compone la vista llamando a los services de `evaluacion` y `asistencia`, sin tocar sus tablas. |
| Dependency Injection | FastAPI entrega a cada endpoint el usuario, la sesión y el service ya construidos. |
| Adapter | El módulo dice «genera un PDF» o «firma esta URL» y `core/` lo traduce a WeasyPrint o a Cloud Storage. |
| Optimistic Lock | Si la `version` cambió desde que el docente leyó la nota, la escritura se rechaza y se le pide recargar. |
| DTO | El cliente recibe `NotaOut`, nunca el modelo interno de la base de datos. |

## Beneficio

- Cambiar el almacenamiento, la cola o el motor de PDF/Excel solo afecta a `core/`.
- Las reglas del MINEDU (conclusiones, promoción, estados) se prueban como funciones puras, sin base de datos.
- Las escrituras de un caso de uso, incluida la auditoría, son atómicas (ADR-005).

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| Decorator (caché) | Lecturas de la vista de seguimiento → Redis (Memorystore) | Si la latencia del pico supera el umbral de AC01 (ADR-006) |
| Observer (eventos) | Cierre del trimestre → generación de libretas | Si los efectos entre módulos crecen y conviene desacoplarlos de la llamada directa |
