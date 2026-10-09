# Restricciones

Condiciones técnicas, normativas y de plazo que acotan el diseño del sistema.

| ID | Restricción | Descripción |
| :--- | :--- | :--- |
| **RC01** | **Aplicación web multiplataforma** | El sistema debe desarrollarse como una aplicación web responsiva accesible mediante navegadores web modernos de escritorio (Chrome, Firefox, Edge, Safari) y smartphones móviles (resolución mínima 360x640). |
| **RC02** | **Control de versiones** | El código fuente del proyecto debe gestionarse obligatoriamente utilizando Git y mantenerse alojado en un repositorio institucional compartido. |
| **RC03** | **API RESTful desacoplada** | La comunicación entre la capa de presentación (Frontend) y los servicios del backend debe realizarse de forma asíncrona mediante una API REST protegida por HTTPS/TLS obligatorio. |
| **RC04** | **Base de Datos Relacional ACID** | La persistencia de datos debe utilizar PostgreSQL v15+ LTS, garantizando restricciones de integridad referencial, transacciones atómicas y uso de la extensión `pgcrypto` para hashing y cifrado. |
| **RC05** | **Almacenamiento de Archivos con URLs Temporales** | Los documentos probatorios adjuntos no deben guardarse directamente en el servidor web ni de manera pública; deben custodiarse en un almacenamiento compatible con AWS S3 / MinIO con acceso exclusivo mediante URLs prefirmadas de corta duración (TTL 15 min). |
| **RC06** | **Compatibilidad Formato SIAGIE sin API directa** | El MVP no incluye conexiones automatizadas directas vía APIs con SIAGIE; la interoperabilidad reglamentaria se restringe a la exportación de plantillas y sábanas de notas consolidadas en formato Excel (.xlsx) estructuradas según la normativa ministerial. |
| **RC07** | **Límites de Carga Documental** | La mesa de partes virtual debe validar tipos MIME estrictos (PDF o imágenes legibles) y restringir el tamaño máximo por archivo a 5 MB para preservar rendimiento y almacenamiento. |
| **RC08** | **Horizonte Temporal MVP (3 meses)** | El proyecto está delimitado a un ciclo estricto de desarrollo de 12 semanas (3 meses), excluyendo pasarelas de pago virtuales, control biométrico de asistencia, entornos LMS y chat en tiempo real. |
