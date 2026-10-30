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
| 1 | [01-Actores](docs/01-analisis-de-sistema/01-Actores.md) | ¿Quién usa el sistema? |
| 2 | [02-Historias-de-usuario](docs/01-analisis-de-sistema/02-Historias-de-usuario.md) | ¿Qué necesita cada actor? |
| 3 | [03-Requisitos-funcionales](docs/01-analisis-de-sistema/03-Requisitos-funcionales.md) | ¿Qué debe hacer el sistema y con qué prioridad? |
| 4 | [04-Atributos-de-calidad](docs/01-analisis-de-sistema/04-Atributos-de-calidad.md) | ¿Qué tan bien debe hacerlo? (con medidas) |
| 5 | [05-Restricciones](docs/01-analisis-de-sistema/05-Restricciones.md) | ¿Qué límites tiene el diseño y quién los impone? |
| 6 | [06-Driver-arquitectonico](docs/01-analisis-de-sistema/06-Driver-arquitectonico.md) | ¿Qué condiciona más a la arquitectura? |
| 7 | [07-Decisiones-arquitectonicas](docs/01-analisis-de-sistema/07-Decisiones-arquitectonicas.md) | ¿Qué se decidió, con qué alternativas y consecuencias? |
| 8 | [estilo-arquitectonico](docs/02-arquitectura-software/estilo-arquitectonico.md) | Vista **en capas**: despliegue, escalabilidad y disponibilidad |
| 9 | [arquitectura-inicial](docs/02-arquitectura-software/arquitectura-inicial.md) | Vista **modular**: módulos, dependencias y flujos críticos en pico |
| 10 | [enfoque-arquitectonico](docs/02-arquitectura-software/enfoque-arquitectonico.md) | Organización **en capas estricta** de cada módulo: router, service y repository |
| 11 | [01-diseno-interno-de-modulos](docs/03-diseno-de-software/01-diseno-interno-de-modulos.md) | ¿Cómo se organiza el código dentro de un módulo? |
| 12 | [02-patrones-de-diseno](docs/03-diseno-de-software/02-patrones-de-diseno.md) | ¿Qué patrones de diseño se aplican y dónde? |
| 13 | [03-principios-de-diseno](docs/03-diseno-de-software/03-principios-de-diseno.md) | ¿Cómo se aplican los principios SOLID? |
| 14 | [01-nivel1-contexto](docs/04-modelo-c4/01-nivel1-contexto.md) | C4: ¿quién usa el sistema y con qué se relaciona? |
| 15 | [02-nivel2-contenedores](docs/04-modelo-c4/02-nivel2-contenedores.md) | C4: ¿de qué piezas ejecutables se compone? |
| 16 | [03-nivel3-componentes](docs/04-modelo-c4/03-nivel3-componentes.md) | C4: ¿cómo se divide el backend por dentro? |
| 17 | [04-nivel4-codigo](docs/04-modelo-c4/04-nivel4-codigo.md) | C4: ¿qué clases forman un módulo? |
| 18 | [skills-y-comandos](docs/05-guias/skills-y-comandos.md) | Guía en español de las skills y comandos de OpenSpec |
