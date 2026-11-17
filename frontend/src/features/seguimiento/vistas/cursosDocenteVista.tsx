import { Flag, NotebookPen, Table2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useListarSeccionesDocenteApiV1SeguimientoDocentesDocenteIdCursosGet } from "../../../api/generated/seguimiento/seguimiento";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";

export function CursosDocenteVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const navigate = useNavigate();
  const docenteId = resolverDocenteId(usuario);

  const consulta = useListarSeccionesDocenteApiV1SeguimientoDocentesDocenteIdCursosGet(
    docenteId,
    { query: { enabled: !!docenteId } },
  );

  if (!docenteId) {
    return (
      <EstadoVacio
        titulo="Vista exclusiva del perfil docente"
        descripcion="Tu sesión actual no tiene un perfil docente asignado."
      />
    );
  }

  if (consulta.isLoading) {
    return (
      <Tarjeta>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Cargando secciones asignadas...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <EstadoVacio
        titulo="No se pudieron cargar tus secciones"
        descripcion="Ocurrió un problema al consultar los cursos y secciones asignadas."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const datos = consulta.data.data;

  return (
    <>
      <BannerPortada
        titulo="Mis cursos"
        subtitulo={`${datos.asignatura_nombre} · ${datos.nivel_educativo} · Año escolar ${datos.anio_escolar}`}
        acciones={
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22 }}>
                {datos.secciones.length}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Secciones</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22 }}>
                {datos.total_estudiantes}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Estudiantes</div>
            </div>
          </div>
        }
      />

      {datos.secciones.length === 0 ? (
        <EstadoVacio
          titulo="Sin secciones asignadas"
          descripcion="Aún no tienes secciones vinculadas en el año escolar vigente."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 20,
          }}
        >
          {datos.secciones.map((sec) => (
            <Tarjeta
              key={sec.seccion_id}
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                type="button"
                onClick={() => navigate(`/cursos/${sec.seccion_id}`)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 112,
                  padding: "18px 20px 28px",
                  border: "none",
                  backgroundColor: "var(--color-secondary-slate)",
                  color: "#FFFFFF",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>
                  {datos.asignatura_nombre} · {sec.nombre}
                </span>
                <span style={{ fontSize: 13, color: "#CBD5E1" }}>{sec.horario}</span>
                <span style={{ fontSize: 13, color: "#E2E8F0", marginTop: "auto" }}>
                  {sec.aula} · {sec.estudiantes_total} estudiantes
                </span>
              </button>

              <span
                style={{
                  alignSelf: "flex-end",
                  margin: "-26px 18px 0 0",
                  position: "relative",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  border: "3px solid var(--bg-surface)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {sec.seccion_id}
              </span>

              <div
                style={{
                  flex: 1,
                  padding: "0 20px 16px",
                  marginTop: -12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
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
                  Notas pendientes
                </span>

                {sec.notas_pendientes.length === 0 ? (
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Todo calificado.
                  </span>
                ) : (
                  sec.notas_pendientes.map((p) => (
                    <div key={p.sesion_id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--text-main)" }}>{p.titulo}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            borderRadius: "var(--radius-pill)",
                            backgroundColor: "var(--bg-subtle)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p.porcentaje}%`,
                              height: "100%",
                              backgroundColor: "var(--color-secondary-slate)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {p.registrados}/{p.total}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: "auto" }}>
                  Cierre: {sec.competencias_confirmadas}/{sec.competencias_total} competencias confirmadas
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 6,
                  padding: "8px 14px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                {[
                  { label: "Clases", tab: "clases", Icon: NotebookPen },
                  { label: "Registro auxiliar", tab: "reg", Icon: Table2 },
                  { label: "Cierre de trimestre", tab: "cierre", Icon: Flag },
                  { label: "Estudiantes", tab: "est", Icon: Users },
                ].map(({ label, tab, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={`${label} · ${sec.nombre}`}
                    title={label}
                    onClick={() => navigate(`/cursos/${sec.seccion_id}?tab=${tab}`)}
                    style={{
                      width: 36,
                      height: 36,
                      border: "none",
                      borderRadius: "50%",
                      backgroundColor: "transparent",
                      color: "var(--text-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={17} />
                  </button>
                ))}
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </>
  );
}
