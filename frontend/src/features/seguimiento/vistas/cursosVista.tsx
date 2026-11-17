import { Link } from "react-router-dom";

import type { UsuarioSesionOut } from "../../../api/generated/model";
import { useListarCursosEstudianteApiV1SeguimientoEstudiantesEstudianteIdCursosGet } from "../../../api/generated/seguimiento/seguimiento";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import { obtenerInicialesTexto } from "../utilidades/filtrosSeguimiento";

interface CursosVistaProps {
  usuario: UsuarioSesionOut;
}

/** Grilla de asignaturas del estudiante (/cursos) con accesos rápidos por curso. */
export function CursosVista({ usuario }: CursosVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);

  const consulta = useListarCursosEstudianteApiV1SeguimientoEstudiantesEstudianteIdCursosGet(
    estudianteId,
    {
      query: {
        enabled: Boolean(estudianteId),
      },
    },
  );

  if (!estudianteId) {
    return (
      <EstadoVacio
        titulo="Vista disponible solo para estudiantes"
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para ver tus cursos."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Mis cursos"
        subtitulo={
          datos
            ? `${datos.grado_seccion} · Año escolar 2026`
            : `${usuario.grado_seccion ?? "Año escolar 2026"}`
        }
        acciones={
          datos ? (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                  {datos.cursos.length}
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Cursos</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                  {datos.total_pendientes}
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Pendientes</div>
              </div>
            </div>
          ) : null
        }
      />

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando cursos..."
          descripcion="Estamos obteniendo tus asignaturas y docentes."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tus cursos"
          descripcion="Ocurrió un problema al consultar tu lista de asignaturas."
          accion={
            <Boton variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          }
        />
      ) : datos.cursos.length === 0 ? (
        <EstadoVacio
          titulo="Aún no tienes cursos asignados"
          descripcion="Cuando Secretaría Académica registre tu nómina verás tus asignaturas aquí."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 20,
          }}
        >
          {datos.cursos.map((curso) => (
            <Tarjeta
              key={curso.asignatura_id}
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: 270,
              }}
            >
              <Link
                to={`/cursos/${curso.asignatura_id}`}
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--color-secondary-slate)",
                  color: "#FFFFFF",
                  padding: "18px 20px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.25,
                  }}
                >
                  {curso.nombre}
                </span>
                <span style={{ fontSize: 13, color: "#CBD5E1" }}>{curso.horario}</span>
                <span style={{ fontSize: 13, color: "#E2E8F0", marginTop: 6 }}>{curso.docente}</span>
              </Link>

              <div style={{ alignSelf: "flex-end", margin: "-24px 18px 0 0" }}>
                <AvatarIniciales
                  nombre={curso.nombre}
                  iniciales={obtenerInicialesTexto(curso.nombre)}
                  size={48}
                  inverted
                />
              </div>

              <div style={{ flex: 1, padding: "4px 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-button)",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Próximas
                </span>
                {curso.pendientes === 0 && !curso.proximo_vencimiento ? (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>
                    ¡Excelente! No tienes entregas pendientes.
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-main)", lineHeight: 1.45 }}>
                    {curso.proximo_vencimiento ?? `${curso.pendientes} pendiente(s)`}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "10px 14px",
                  borderTop: "1px solid var(--border-card)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {curso.mini_niveles.map((nivel, idx) => (
                    <InsigniaNivel key={`${curso.asignatura_id}-nv-${idx}`} nivel={nivel} />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 600 }}>
                  <Link
                    to={`/cursos/${curso.asignatura_id}?tab=trabajos`}
                    style={{ color: "var(--color-primary)" }}
                  >
                    Trabajos del curso
                  </Link>
                  <Link
                    to={`/cursos/${curso.asignatura_id}?tab=calificaciones`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    Calificaciones
                  </Link>
                  <Link
                    to={`/cursos/${curso.asignatura_id}?tab=personas`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    Personas
                  </Link>
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
