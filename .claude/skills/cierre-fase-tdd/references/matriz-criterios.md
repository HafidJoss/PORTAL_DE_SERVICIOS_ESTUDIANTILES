# Matriz de criterios técnicos, TDD y arquitectura

Referencia de consulta bajo demanda para la skill `cierre-fase-tdd`. Resume qué verificar por capa según la fase del proyecto.

---

## 1. Criterios TDD por capa ([tdd.md](../../../docs/06-estandares/tdd.md))

| Ámbito / Archivo | Tipo de prueba obligatoria | Qué debe comprobar | Anti-patrones prohibidos |
|---|---|---|---|
| `backend/app/modules/<mod>/reglas.py` | `test_unitario_*.py` | Funciones puras: escala `AD/A/B/C`, medianas, conclusiones, promoción (`PRO/PER/RR`), máquinas de estado | Importar FastAPI, SQLAlchemy, reloj del sistema o E/S |
| `backend/app/modules/<mod>/service.py` | `test_unitario_*.py` | Casos de uso con repositorio y services falsos, errores de dominio y llamada a auditoría (`RF18`) | Hacer `commit()`, lanzar `HTTPException`, conectar BD real |
| `backend/app/modules/<mod>/repository.py` | `test_integracion_*.py` | Consultas reales, restricciones, índices, bloqueo optimista (`version`) con PostgreSQL 16+ (`testcontainers`) | Sustituir PostgreSQL por SQLite en memoria |
| `backend/app/modules/<mod>/router.py` | `test_integracion_*.py` | Status HTTP, formato RFC 9457 (`ProblemDetail`), autenticación JWT/`__session`, RBAC (7 roles) y pertenencia (`DA05`) | Lógica de negocio en endpoints o devolver modelos ORM |
| `frontend/src/features/<mod>/utilidades/*.ts` | `testUnitario*.test.ts` | Filtros, validaciones, calendarios, cálculos de resumen sin DOM ni red | Acoplarse a componentes React o mutar almacenamiento global sin limpiar |
| `frontend/src/shared/componentes/*.tsx` y `api/clienteHttp.ts` | `testComponente*.test.ts(x)` | Comportamiento accesible UI, RFC 9457, `credentials: "include"`, `X-CSRF-Token` y manejo `401` | Probar detalles internos de implementación o snapshots frágiles |
| `frontend/src/features/<mod>/vistas/*Vista.tsx` | `testIntegracion*.test.tsx` | Estados: carga, datos reales, lista vacía, error con reintento, permisos por rol, responsive `< 1024 px` | Llamar a red real; simular siempre con MSW y limpiar caché |
| `frontend/src/app/aplicacion.tsx` | `testE2e*.test.tsx` | Rutas protegidas, redirección a `/ingresar`, cierre de sesión limpiando caché y recorrido multi-módulo | Duplicar lógica de negocio de features dentro de `app/` |

---

## 2. Arquitectura, SOLID y restricciones (`ADR-001` a `ADR-009`)

- **Fronteras modulares (`ADR-008`)**:
  - En backend, un módulo **solo** llama al `service` de otro (niveles inferiores, sin ciclos). Nunca importa `repository.py` ni `models.py` ajenos.
  - Cierre de trimestre (`ADR-009`): `evaluacion` orquesta, llama a `institucion` y encola por `core/` después del `commit`, sin importar `reportes`.
  - En frontend, cada feature depende únicamente de `api/generated/`, `shared/`, `app/` y sus propios archivos; la única excepción aprobada entre features es `seguimiento -> evaluacion` (`tarjetaActividad`, `filtrosActividades`).
- **Seguridad y privacidad (`ADR-002`, `ADR-004`, `ADR-005`, Ley N.º 29733)**:
  - Cero datos reales de estudiantes/apoderados en código, fixtures o pruebas.
  - Descargas de libretas/actas mediante URL firmada temporal (TTL 15 min), nunca exponiendo almacenamiento público ni subida directa de archivos no autorizada (`RC08`).
  - En backend real (Fase 2+): bitácora append-only en misma transacción para eventos `RF18`, `version_sesion` en usuarios y protección CSRF.
- **UI y experiencia (`RC01`, `RC08`, `AC07`)**:
  - Uso exclusivo de tokens semánticos de `tokens.css` en modo claro y oscuro (sin colores hardcodeados fuera de la escala de contraste WCAG AA).
  - Respeto estricto a `RC08`: sin subida de archivos de trabajos/justificaciones/fotos de perfil, sin chat en tiempo real ni pagos.

---

## 3. Criterio de clasificación en el diagnóstico

Al clasificar cada requisito o módulo en el informe final, usa exactamente tres cubetas para evitar falsos positivos:

1. **Contemplado y verificado**: comportamiento implementado **y** respaldado por al menos una prueba en verde trazada a su spec (`Spec:`).
2. **Punto suelto (deuda de la fase actual)**:
   - Lógica implementada sin prueba o escenario `Spec` sin test.
   - Archivo/carpeta fuera de [nomenclatura.md](../../../docs/06-estandares/nomenclatura.md).
   - Stub marcado como real sin advertencia, error lint/compilación o salto `.skip`/`xfail`.
3. **Faltante / diferido (fuera del alcance de la fase actual)**:
   - Capacidad contractual en stub declarada explícitamente para una fase posterior (ej. PostgreSQL real o roles `Docente`/`Apoderado` en Fase 1).
   - Requisitos marcados como `Pospuesto` en [03-Requisitos-funcionales.md](../../../docs/01-analisis-de-sistema/03-Requisitos-funcionales.md) (`RF02`, `RF09`–`RF13`, `RF17`).
