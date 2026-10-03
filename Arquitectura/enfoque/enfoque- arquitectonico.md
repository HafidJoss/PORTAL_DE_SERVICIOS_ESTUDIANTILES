# Enfoque Arquitectónico del Sistema: Clean Architecture (Arquitectura Limpia)

## 1. Información General

| Elemento | Descripción aplicada al Portal de Servicios Estudiantiles |
| :--- | :--- |
| **Patrón / Enfoque Arquitectónico** | Clean Architecture (Arquitectura Limpia) |
| **Objetivo Principal** | Separar las responsabilidades del negocio educativo y controlar que las dependencias internas apunten siempre hacia el Dominio escolar. |
| **¿Qué problema resuelve?** | Evita el acoplamiento rígido entre las interfaces visuales web, las reglas pedagógicas del CNEB (escalas AD, A, B, C, promedios, cierre de actas) y las tecnologías externas (PostgreSQL, APIs REST, almacenamiento MinIO/S3, colas Redis). |
| **Capas Definidas** | Presentación, Aplicación, Dominio e Infraestructura. |
| **Beneficios** | • Facilita el mantenimiento y la realización de pruebas unitarias sobre las reglas de evaluación.<br>• Permite cambiar tecnologías externas (como migrar de MinIO local a AWS S3) sin tocar el núcleo de negocio.<br>• Mejora la organización y modularidad, asegurando el cumplimiento del horizonte de entrega de 3 meses. |

---

## 2. Definición de Capas y Responsabilidades

En Clean Architecture, el código se organiza en círculos concéntricos. **La regla de oro de la dependencia establece que las dependencias deben apuntar únicamente hacia adentro**, garantizando que el Dominio no dependa de ningún framework ni librería de infraestructura.

### 2.1. Capa de Dominio (`src/app/domain`)
Es el núcleo central de la aplicación y contiene la lógica pura e invariable del negocio escolar:
* **Entidades (Models):** Objetos de negocio con validaciones intrínsecas (ej. `Estudiante`, `Apoderado`, `ExpedienteAdmision`, `CalificacionCompetencia`, `PeriodoLectivo`, `CursoSeccion`).
* **Contratos / Puertos (Interfaces):** Define lo que el dominio requiere del exterior sin conocer su implementación técnica (ej. `RepositorioEstudiantes`, `RepositorioExpedientes`, `RepositorioCalificaciones`, `ServicioAlmacenamientoDocumental`, `ServicioNotificacion`).

### 2.2. Capa de Aplicación (`src/app/application`)
Contiene los casos de uso específicos del Portal Escolar de la I.E. Emblemática Mariscal Cáceres. Coordina el flujo de datos desde y hacia el dominio:
* **Casos de Uso (Use Cases):** Encapsulan las operaciones del sistema (ej. `RegistrarPreinscripcionUseCase`, `DictaminarExpedienteUseCase`, `RegistrarNotasPorCompetenciaUseCase`, `CerrarPeriodoLectivoUseCase`, `ConsultarVistaFamiliarUseCase`, `GenerarLibretaNotasUseCase`).

### 2.3. Capa de Presentación / Adaptadores (`src/app/presentation`)
Contiene los controladores de la API REST, interceptores y componentes con los que interactúan los usuarios:
* **Controladores REST y DTOs:** `AdmisionController`, `CalificacionesController`, `PeriodosController`, `EstudiantesController`.
* **Middlewares y Vistas:** Validación de esquemas, middleware de autorización RBAC (tokens JWT) y controladores de vistas responsivas.

### 2.4. Capa de Infraestructura (`src/app/infrastructure`)
Contiene las implementaciones técnicas concretas y las comunicaciones con el exterior:
* **Repositorios e Implementaciones de Persistencia:** `RepositorioEstudiantesPostgres`, `RepositorioCalificacionesPostgres`.
* **Adaptadores de Servicios Externos:** `ServicioAlmacenamientoMinIO`, `PublicadorColasRedis`, `GeneradorReportesWorker`.
* **Configuraciones Técnicas:** Conexión a la base de datos PostgreSQL con transacciones ACID y triggers de auditoría.

---

## 3. Diagrama de Enfoque Arquitectónico (Mermaid)

```mermaid
graph TD
    %% Actor
    Usuario[👥 Usuario: Estudiante / Apoderado / Docente / Secretaría / Admin]

    %% Aplicación en Clean Architecture
    subgraph CleanArchApp ["🏫 APLICATIVO DEL PORTAL ESTUDIANTIL (Clean Architecture)"]
        
        %% CAPA 1: PRESENTACIÓN
        subgraph CapaPres ["1. CAPA DE PRESENTACIÓN (UI / Controllers / DTOs)"]
            Controllers["Controladores REST & Endpoints<br/>(AdmisionController, NotasController, EstudiantesController)"]
            Middlewares["Middleware RBAC & Guardias JWT"]
        end

        %% CAPA 2: APLICACIÓN
        subgraph CapaApp ["2. CAPA DE APLICACIÓN (Casos de Uso)"]
            UC["Casos de Uso:<br/>• RegistrarPreinscripcionUseCase<br/>• DictaminarExpedienteUseCase<br/>• RegistrarNotasPorCompetenciaUseCase<br/>• ConsultarVistaFamiliarUseCase<br/>• GenerarLibretaNotasUseCase"]
        end

        %% CAPA 3: DOMINIO
        subgraph CapaDom ["3. CAPA DE DOMINIO (Reglas del Negocio Escolar)"]
            Entidades["Entidades / Modelos:<br/>Estudiante, Apoderado, Expediente, CalificacionCompetencia, PeriodoLectivo"]
            Puertos["Puertos / Contratos (Interfaces):<br/>RepositorioEstudiantes, RepositorioCalificaciones, ServicioAlmacenamiento"]
        end

        %% CAPA 4: INFRAESTRUCTURA
        subgraph CapaInfra ["4. CAPA DE INFRAESTRUCTURA (Implementaciones Concretas)"]
            PostgresImpl["Implementaciones PostgreSQL<br/>(pgcrypto, triggers de auditoría, pool de conexiones)"]
            StorageImpl["Adaptador Storage MinIO / S3<br/>(URLs prefirmadas TTL 15 min, UUIDs)"]
            QueueImpl["Publicador de Tareas Redis<br/>(Encolamiento asíncrono de libretas y actas)"]
        end

        %% Inyección de Dependencias
        Container["Contenedor de Inyección de Dependencias (IoC Container)"]
    end

    %% Componentes Externos
    PG[("🗄️ PostgreSQL Transaccional")]
    Bucket["📦 Object Storage MinIO/S3"]
    Redis["⚡ Cola Redis + Workers"]

    %% Flujos y Regla de la Dependencia hacia Adentro
    Usuario --> Middlewares
    Middlewares --> Controllers
    Controllers --> UC
    UC --> Entidades
    UC --> Puertos

    %% Inversión de Control
    PostgresImpl -.->|Implementa| Puertos
    StorageImpl -.->|Implementa| Puertos
    QueueImpl -.->|Implementa| Puertos
    Container -.->|Inyecta Dependencias| UC

    %% Comunicación Externa
    PostgresImpl --> PG
    StorageImpl --> Bucket
    QueueImpl --> Redis

    %% Estilos
    style CleanArchApp fill:#fafafa,stroke:#333,stroke-width:2px
    style CapaPres fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    style CapaApp fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    style CapaDom fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    style CapaInfra fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
```
