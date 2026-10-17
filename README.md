# Portal de Servicios Estudiantiles (MVP)
## Institución (caso de estudio)
I.E. Emblemática Mariscal Cáceres - Ayacucho, como referencia institucional y operativa
## Universidad
Universidad Nacional de San Cristóbal de Huamanga E.P. Ingeniería de Sistemas
## Nombres
Apaza Sulca Hafid Joseph
## Código
27210123
## Fecha
2026-10-03
## Descripción
Propuesta técnica y de arquitectura de software para el Portal de Servicios Estudiantiles (MVP), orientada a modernizar y centralizar los procesos de vida académica (calificaciones, asistencia y asignación docente) y ventanilla virtual (admisión, traslados y mesa de partes digital, entendida como la recepción en línea de los documentos de admisión y traslado).
## Curso
Arquitectura de Software
## Mapa de lectura
El sistema debe atender picos de consulta de unos 1,000 usuarios simultáneos (AC01). Su arquitectura combina tres ideas, una por documento: **en capas** (estilo), **modular** (arquitectura inicial) y **en capas estricta** (enfoque). Orden recomendado:

| # | Documento | Qué responde |
| :--- | :--- | :--- |
| 1 | [01-Actores](Analisis-de-sistema/01-Actores.md) | ¿Quién usa el sistema? |
| 2 | [02-Historias-de-usuario](Analisis-de-sistema/02-Historias-de-usuario.md) | ¿Qué necesita cada actor? |
| 3 | [03-Requisitos-funcionales](Analisis-de-sistema/03-Requisitos-funcionales.md) | ¿Qué debe hacer el sistema y con qué prioridad? |
| 4 | [04-Atributos-de-calidad](Analisis-de-sistema/04-Atributos-de-calidad.md) | ¿Qué tan bien debe hacerlo? (con medidas) |
| 5 | [05-Restricciones](Analisis-de-sistema/05-Restricciones.md) | ¿Qué límites tiene el diseño y quién los impone? |
| 6 | [06-Driver-arquitectonico](Analisis-de-sistema/06-Driver-arquitectonico.md) | ¿Qué condiciona más a la arquitectura? |
| 7 | [07-Decisiones-arquitectonicas](Analisis-de-sistema/07-Decisiones-arquitectonicas.md) | ¿Qué se decidió, con qué alternativas y consecuencias? |
| 8 | [estilo-arquitectonico](Arquitectura-software/estilo-arquitectonico.md) | Vista **en capas**: despliegue, escalabilidad y disponibilidad |
| 9 | [arquitectura-inicial](Arquitectura-software/arquitectura-inicial.md) | Vista **modular**: módulos, dependencias y flujos críticos en pico |
| 10 | [enfoque-arquitectonico](Arquitectura-software/enfoque-arquitectonico.md) | Organización **en capas estricta** de cada módulo: router, service y repository |
