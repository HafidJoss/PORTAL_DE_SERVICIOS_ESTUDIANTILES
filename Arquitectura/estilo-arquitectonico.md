# Estilo Arquitectónico del Sistema: Portal de Servicios Estudiantiles (MVP)

## 1. Descripción General
En este documento se define el estilo arquitectónico seleccionado para el proyecto Portal de Servicios Estudiantiles de la I.E. Emblemática Mariscal Cáceres. Se optó por una arquitectura **N-Tier (Multicapa) Desacoplada y Distribuida** con servicios de soporte especializados:

- **Organización lógica:** Basada en capas independientes (Presentación Web, Lógica de Negocio/APIs REST, Persistencia Transaccional, Almacenamiento Seguro de Objetos y Procesamiento en Background).
- **Unidad de despliegue del núcleo:** Un servicio de backend en Node.js v18+ LTS (o Python FastAPI) alojado tras un proxy inverso Nginx con HTTPS/TLS obligatorio, simplificando la infraestructura y asegurando un despliegue viable en el horizonte estipulado de 3 meses (12 semanas).
- **Aislamiento de cargas pesadas:** Desacoplamiento de la compilación de documentos mediante cola Redis y worker dedicado, evitando caídas o degradación de rendimiento durante el cierre masivo de bimestres.

---

## 2. Diagrama de Arquitectura (Mermaid)

```mermaid
graph TD
    %% Usuarios
    subgraph Usuarios ["👥 Clientes Institucionales (Navegadores Web / Móviles)"]
        Users["Alumnos | Apoderados (Vista Multi-Hijo) | Docentes | Secretaría | Directivos"]
    end

    %% Borde de Red / Proxy
    subgraph DMZ ["Capa de Borde Perimetral"]
        Nginx["Proxy Inverso Nginx<br/>(Terminación SSL/TLS HTTPS | Puerto 443)"]
    end

    %% Servidor de Aplicaciones
    subgraph ServidorApp ["🖥️ SERVIDOR DE APLICACIONES WEB (Backend REST API)"]
        subgraph CapaPres ["1. Capa de Controladores y Rutas"]
            Routes["Rutas REST:<br/>/auth | /estudiantes | /admision | /notas | /reportes"]
        end

        subgraph CapaSeguridad ["2. Capa de Seguridad Perimetral"]
            RBAC["Middleware RBAC & Validación de Tokens JWT"]
        end

        subgraph CapaLogica ["3. Capa de Lógica del Negocio Escolar"]
            Services["Servicios de Negocio:<br/>• Servicio de Admisión y Expedientes<br/>• Servicio de Calificaciones CNEB (AD, A, B, C)<br/>• Servicio de Gestión de Periodos y Catálogo"]
        end

        Routes --> RBAC
        RBAC --> CapaLogica
    end

    %% Servicios de Soporte e Infraestructura
    subgraph InfraDatos ["🗄️ SERVIDOR DE BASE DE DATOS TRANSACCIONAL"]
        Postgres[("PostgreSQL v15+ LTS<br/>• Extensión pgcrypto<br/>• Triggers de Auditoría<br/>• Transacciones ACID")]
    end

    subgraph InfraStorage ["📦 REPOSITORIO DE ALMACENAMIENTO SEGURO (STORAGE)"]
        Minio["MinIO / AWS S3 Compliant<br/>• Nombres UUID ofuscados<br/>• URLs prefirmadas temporales (TTL 15 min)<br/>• Cifrado en reposo AES-256"]
    end

    subgraph InfraWorkers ["⚡ MOTOR DE GENERACIÓN DOCUMENTAL (ASÍNCRONO)"]
        RedisQueue["Cola de Mensajes Redis"]
        DocWorker["Worker Headless Chromium / WeasyPrint<br/>• Libretas de Notas PDF<br/>• Plantillas Excel compatibles con SIAGIE"]
        RedisQueue --> DocWorker
    end

    %% Flujos de Red
    Users -->|HTTPS / REST| Nginx
    Nginx --> Routes
    CapaLogica --> Postgres
    CapaLogica -->|Subida validada de probatorios <= 5MB| Minio
    CapaLogica -->|Encolar trabajo de libreta/acta| RedisQueue
    DocWorker -->|Lee registros consolidados| Postgres
    DocWorker -->|Guarda comprobante o entrega binario| Minio

    %% Estilos
    style ServidorApp fill:#f8f9fa,stroke:#333,stroke-width:2px
    style CapaPres fill:#e3f2fd,stroke:#1565c0
    style CapaSeguridad fill:#ffebee,stroke:#c62828
    style CapaLogica fill:#e8f5e9,stroke:#2e7d32
    style InfraDatos fill:#fff3e0,stroke:#ef6c00
    style InfraStorage fill:#f3e5f5,stroke:#7b1fa2
    style InfraWorkers fill:#e0f7fa,stroke:#00838f
```
