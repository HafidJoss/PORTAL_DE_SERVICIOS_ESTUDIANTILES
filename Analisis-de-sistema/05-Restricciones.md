# Restricciones

Condiciones técnicas, normativas y de plazo que acotan el diseño del sistema.

| ID | Restricción | Descripción |
| :--- | :--- | :--- |
| **RC01** | **Aplicación web multiplataforma** | El sistema debe desarrollarse como una aplicación web responsiva accesible mediante navegadores web modernos de escritorio (Chrome, Firefox, Edge, Safari) y smartphones móviles (resolución mínima 360x640). |
| **RC02** | **Control de versiones** | El código fuente del proyecto debe gestionarse obligatoriamente utilizando Git y mantenerse alojado en un repositorio institucional compartido. |
| **RC03** | **API RESTful desacoplada** | La comunicación entre la capa de presentación (Frontend) y los servicios del backend debe realizarse mediante una API REST protegida por HTTPS/TLS obligatorio. |
| **RC04** | **Base de Datos Relacional ACID** | La persistencia de datos debe utilizar PostgreSQL 16 o superior (la versión 16 tiene soporte oficial hasta nov-2028), garantizando restricciones de integridad referencial, transacciones atómicas y el uso de la extensión `pgcrypto` para cifrar columnas sensibles. El hash de contraseñas se realiza en la aplicación, no en la base de datos. |
| **RC05** | **Almacenamiento de Archivos con URLs Temporales** | Los documentos probatorios adjuntos no deben guardarse directamente en el servidor web ni de manera pública; deben custodiarse en un almacenamiento compatible con AWS S3 / MinIO con acceso exclusivo mediante URLs prefirmadas de corta duración (TTL 15 min). |
| **RC06** | **Compatibilidad Formato SIAGIE sin API directa** | Por decisión de alcance, el MVP no incluye conexiones automatizadas directas vía APIs con SIAGIE; la interoperabilidad reglamentaria se restringe a la exportación de plantillas y sábanas de notas consolidadas en formato Excel (.xlsx) estructuradas según la normativa ministerial. |
| **RC07** | **Límites de Carga Documental** | La mesa de partes virtual debe validar tipos MIME estrictos (PDF o imágenes legibles) y restringir el tamaño máximo por archivo a 5 MB para preservar rendimiento y almacenamiento. |
| **RC08** | **Horizonte Temporal y Alcance del MVP (12 semanas)** | **Plazo:** ciclo estricto de desarrollo de 12 semanas (≈ 3 meses). **Fuera de alcance:** pasarelas de pago virtuales, control biométrico de asistencia, entornos LMS, chat en tiempo real e integración directa por API con SIAGIE (RC06). |
