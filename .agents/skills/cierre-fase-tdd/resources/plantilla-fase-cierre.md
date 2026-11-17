# Fase NN · <Título descriptivo de la fase>

> **Estado:** Completada · **Rama de trabajo:** `dev` · **Fecha de cierre:** AAAA-MM-DD

---

## 1. Resumen ejecutivo y alcance

<Descripción breve de qué capacidad o hito del Portal de Servicios Estudiantiles quedó construido y verificado en esta fase.>

### En alcance
- <Módulos, capas, flujos de rol y contratos entregados.>

### Fuera de alcance en esta fase
- <Componentes diferidos a fases posteriores y exclusiones explícitas de `RC08` o `Pospuesto`.>

---

## 2. Diagnóstico de estado TDD y cobertura de fase

| Categoría | Estado | Detalle observado |
|---|---|---|
| **Contemplado y verificado** | Verde | <Módulos, rutas, endpoints, specs y escenarios respaldados por pruebas en verde.> |
| **Puntos sueltos corregidos con TDD** | Resuelto | <Lista breve de vacíos detectados en auditoría y cerrados con ciclo Rojo → Verde → Refactor (o "Ninguno").> |
| **Faltante / Diferido a siguiente fase** | Planificado | <Capacidad stub heredada, infraestructura pendiente de fase posterior o RF diferidos.> |

---

## 3. Arquitectura, módulos y contratos implementados

| Área / Módulo (`ADR-008`) | Archivos principales | Responsabilidad |
|---|---|---|
| `backend/...` | `<archivos>` | `<responsabilidad>` |
| `frontend/src/...` | `<archivos>` | `<responsabilidad>` |

### Comprobación de fronteras (`ADR-008`) y estándares
- Dependencias entre módulos: <sin ciclos ni cruces indebidos>.
- Cumplimiento de [nomenclatura.md](../06-estandares/nomenclatura.md) y [tdd.md](../06-estandares/tdd.md): <0 desviaciones reportadas por `auditar_estado_fase.py`>.

---

## 4. Trazabilidad y especificaciones consolidadas (`OpenSpec`)

| Spec consolidada | Cambio(s) archivado(s) | Requirements | IDs trazados (`RF`, `HU`, `AC`, `RC`, `ADR`) |
|---|---|---|---|
| `openspec/specs/<modulo>/spec.md` | `<AAAA-MM-DD-nombre>` | `<N>` | `<IDs>` |

---

## 5. Evidencia de verificación al cierre

| Verificación | Comando | Resultado observado |
|---|---|---|
| Auditoría automática | `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto` | `<resultado>` |
| Backend (`pytest` / `ruff` / `lint-imports`) | `cd backend && python -m pytest -q` | `<N passed>` |
| Lint frontend | `cd frontend && npm run lint` | `<0 errores>` |
| Compilación frontend | `cd frontend && npm run build` | `<exitoso / tamaño>` |
| Pruebas frontend | `cd frontend && npm test -- --run` | `<N archivos, M pruebas aprobadas>` |
| Validación OpenSpec | `openspec validate --specs --strict` | `<N/N specs válidos>` |
| Verificación en vivo (UI / HTTP) | `<subagente browser o smoke HTTP>` | `<resultado o nota si DevTools no disponible>` |

---

## 6. Limitaciones conocidas y entrada a la siguiente fase

1. <Limitación o condición de entorno heredada.>
2. **Siguiente fase recomendada (Fase NN+1 · <nombre>)**: <objetivo inmediato y cambios OpenSpec sugeridos>.
