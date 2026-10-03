# Propuesta de Arquitectura en Capas Inicial: Portal de Servicios Estudiantiles

A continuación se presenta la propuesta de arquitectura organizada en capas según los módulos, actores y flujos identificados en el análisis del sistema escolar:

---

## 1. Organización de Capas y Responsabilidades

| Capa | Pregunta que responde | Responsabilidades y Módulos |
| :--- | :--- | :--- |
| **Presentación** | ¿Cómo interactúa la comunidad escolar? | • **Interfaz Web Responsiva (Frontend):** Vistas para Alumnos, Docentes, Secretaría, Administradores y Vista Familiar Multi-Hijo para Apoderados.<br>• **Ventanilla Virtual Pública:** Formulario de admisión, traslados y consulta de estado por ticket.<br>• **API Gateway / Proxy Inverso:** Nginx gestionando terminación SSL/TLS (HTTPS) y balanceo perimetral. |
| **Servicios y Lógica de Negocio** | ¿Qué hace el sistema escolar? | Módulos encargados de orquestar las reglas del negocio educativo:<br>• **Seguridad y RBAC:** Autenticación JWT, verificación de roles y aislamiento de accesos.<br>• **Gestión Académica:** Catálogo escolar, asignación docente y máquina de estados de periodos lectivos.<br>• **Evaluación y Calificaciones:** Cuadrícula de captura masiva, motor de cálculo CNEB (AD, A, B, C y vigesimal) y validación previa de cierre.<br>• **Ventanilla Virtual y Dictamen:** Recepción de solicitudes, emisión de tickets únicos, bandeja de secretaría y generación de pre-matrículas.<br>• **Auditoría:** Registro de trazabilidad para cambios de notas y estados. |
| **Persistencia de Datos e Integridad** | ¿Dónde se almacena la información estructurada? | • **Base de Datos Relacional (PostgreSQL v15+):** Almacenamiento seguro del modelo escolar, tablas de auditoría, constraints de clave foránea y transacciones ACID.<br>• **Extensión pgcrypto:** Cifrado y hashing seguro de credenciales. |
| **Almacenamiento Documental y Workers** | ¿Dónde se custodian los probatorios y compilan reportes? | • **Object Storage Seguro (MinIO / S3):** Custodia de expedientes probatorios (DNI, partidas, certificados) con UUIDs y URLs prefirmadas (TTL 15 min).<br>• **Motor de Tareas en Background (Redis + Worker):** Procesamiento asíncrono para la compilación de libretas de notas oficiales en PDF y actas en Excel compatibles con SIAGIE. |

---

## 2. Diagrama Estructural de la Arquitectura en Capas

```mermaid
graph TD
    %% Clientes
    subgraph Actores ["👥 Comunidad Educativa (Clientes Web y Móviles)"]
        A_Est["Estudiante"]
        A_Pad["Apoderado (Vista Multi-Hijo)"]
        A_Doc["Docente"]
        A_Sec["Secretaría Académica"]
        A_Adm["Administrador"]
    end

    %% Capa de Presentación
    subgraph CapaPres ["1. CAPA DE PRESENTACIÓN (Frontend Web & Nginx)"]
        Nginx["Proxy Inverso Nginx (HTTPS / SSL/TLS)"]
        UI_Web["Interfaz Web Responsiva (HTML5 / JS / CSS)<br/>• Portal de Admisión Pública<br/>• Panel Docente de Notas<br/>• Tablero de Dictamen de Secretaría<br/>• Vista Familiar Multi-Hijo"]
    end

    %% Capa de Negocio
    subgraph CapaNegocio ["2. CAPA DE SERVICIOS Y LÓGICA DE NEGOCIO (Backend API REST)"]
        AuthModule["Seguridad & RBAC (JWT Token Validation)"]
        AcademicModule["Gestión Académica & Periodos Lectivos"]
        EvaluationModule["Evaluación & Motor de Cálculo CNEB (AD, A, B, C)"]
        AdmissionModule["Ventanilla Virtual, Admisión & Dictamen de Expedientes"]
        AuditModule["Módulo de Trazabilidad & Auditoría"]
    end

    %% Capa de Persistencia y Almacenamiento
    subgraph CapaDatos ["3. CAPA DE PERSISTENCIA Y ALMACENAMIENTO SEGURO"]
        DB[("🗄️ PostgreSQL v15+ LTS<br/>• Transacciones ACID<br/>• Triggers de Auditoría<br/>• Extensión pgcrypto")]
        Storage["📦 Object Storage (MinIO / AWS S3)<br/>• Expedientes PDF/Imágenes<br/>• Nombres UUID ofuscados<br/>• URLs prefirmadas (TTL 15 min)"]
    end

    %% Capa de Generación Asíncrona
    subgraph CapaAsync ["4. MOTOR DE GENERACIÓN ASÍNCRONA (Background)"]
        Queue["Cola de Tareas (Redis)"]
        Worker["Worker de Renderizado (Headless Chromium / WeasyPrint)<br/>• Libretas de Notas en PDF<br/>• Actas y Sábanas en Excel (.xlsx)"]
    end

    %% Relaciones
    Actores -->|Peticiones HTTPS| Nginx
    Nginx --> UI_Web
    UI_Web -->|Llamadas Asíncronas REST| AuthModule
    AuthModule --> AcademicModule
    AuthModule --> EvaluationModule
    AuthModule --> AdmissionModule
    AuthModule --> AuditModule

    AcademicModule --> DB
    EvaluationModule --> DB
    AdmissionModule --> DB
    AuditModule --> DB

    AdmissionModule -->|Carga de Probatorios <= 5MB| Storage
    EvaluationModule -->|Encolar reporte| Queue
    AdmissionModule -->|Encolar ticket| Queue
    Queue --> Worker
    Worker --> Storage
    Worker -->|Descarga final| Actores
```

---

## 3. Descripción de Componentes e Integraciones

* **Capa de Presentación:** Atiende a los cinco roles mediante vistas altamente responsivas y desacopladas del servidor central a través de Nginx como terminador SSL/TLS y proxy inverso.
* **Capa de Lógica de Negocio:** Expone una **API RESTful** segura. Encapsula las reglas del Ministerio de Educación (escala CNEB, ponderaciones, periodos lectivos y bloqueo de notas extemporáneas), el control RBAC y la emisión automática de tickets de expedientes.
* **Capa de Persistencia de Datos:** Gestiona la integridad referencial y las transacciones escolares en PostgreSQL. Dispone de triggers de base de datos para garantizar auditoría inalterable de cada calificación ingresada o modificada.
* **Almacenamiento Documental Seguro:** Aísla los documentos sensibles de menores de edad en MinIO / AWS S3 bajo cifrado AES-256, restringiendo el acceso únicamente mediante URLs prefirmadas de corta duración (TTL 15 minutos).
* **Integración y Compatibilidad SIAGIE:** Al estar fuera de alcance una conexión API directa por disposición ministerial, el sistema provee una exportación de sábanas y actas en Excel (.xlsx) estructuradas idénticamente al formato oficial para la carga o transcripción manual en secretaría.
