# Documentación de Cierre por Fases

Esta carpeta conserva el registro oficial del cierre técnico y funcional de cada fase del **Portal de Servicios Estudiantiles** (I.E. Emblemática Mariscal Cáceres).

## Regla de flujo de trabajo

Siempre que concluya una fase del proyecto (tras ejecutar `/opsx:archive` y verificar pruebas, lint y compilación), activa la skill **`cierre-fase-tdd`** (en **Modo Cierre completo** o **Modo Diagnóstico** previo) para auditar el cumplimiento TDD/arquitectónico y documentar el cierre en:

1. El documento de la fase: `docs/07-fases/fase-NN-<nombre>.md`.
2. La tabla índice en este archivo (`docs/07-fases/README.md`).

### Contenido mínimo de cada documento de cierre (`fase-NN-<nombre>.md`)

- **Resumen y alcance**: objetivo de la fase y qué quedó explícitamente fuera de alcance.
- **Componentes, rutas y contratos**: inventario de módulos frontend/backend y endpoints involucrados.
- **Trazabilidad cubierta**: IDs atendidos (`HU`, `RF`, `AC`, `RC`, `ADR`) y especificaciones archivadas en `openspec/specs/`.
- **Evidencia de verificación**: comandos ejecutados y resultados de pruebas (`vitest`, `pytest`, `eslint`, compilación y recorrido integral).
- **Limitaciones conocidas y entrada a la siguiente fase**: condiciones heredadas y próximos pasos recomendados.

---

## Índice de fases

| Fase | Documento | Estado | Resumen |
|---|---|---|---|
| Fase 1 | [fase-01-estudiante-v2-frontend.md](fase-01-estudiante-v2-frontend.md) | Completada | Frontend completo del rol Estudiante v2 + API contractual stub OpenAPI |
