import { Link, useParams, useSearchParams } from "react-router-dom";

import { useListarActividadesEstudianteApiV1EvaluacionEstudiantesEstudianteIdActividadesGet } from "../../../api/generated/evaluacion/evaluacion";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { useObtenerDetalleCursoApiV1SeguimientoEstudiantesEstudianteIdCursosAsignaturaIdGet } from "../../../api/generated/seguimiento/seguimiento";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import { TarjetaActividad } from "../../evaluacion/componentes/tarjetaActividad";
import { filtrarActividadesPorPestana } from "../../evaluacion/utilidades/filtrosActividades";
import { obtenerInicialesTexto } from "../utilidades/filtrosSeguimiento";

interface CursoDetalleVistaProps {
  usuario: UsuarioSesionOut;
}

type PestanaCurso = "novedades" | "trabajos" | "calificaciones" | "personas";

const PESTANAS_CURSO: ReadonlyArray<{ id: PestanaCurso; etiqueta: string }> = [
  { id: "novedades", etiqueta: "Novedades" },
  { id: "trabajos", etiqueta: "Trabajos" },
  { id: "calificaciones", etiqueta: "Calificaciones" },
  { id: "personas", etiqueta: "Personas" },
];

function normalizarPestana(valor: string | null): PestanaCurso {
  if (valor === "trabajos" || valor === "calificaciones" || valor === "personas") {
    return valor;
  }
  return "novedades";
}

/** Detalle de curso (/cursos/:asignaturaId) con 4 pestañas: Novedades, Trabajos, Calificaciones y Personas. */
export function CursoDetalleVista({ usuario }: CursoDetalleVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const { asignaturaId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pestanaActiva = normalizarPestana(searchParams.get("tab"));

  const consultaCurso =
    useObtenerDetalleCursoApiV1SeguimientoEstudiantesEstudianteIdCursosAsignaturaIdGet(
      estudianteId,
      asignaturaId,
      {
        query: {
          enabled: Boolean(estudianteId && asignaturaId),
        },
      },
    );

  const consultaActividades =
    useListarActividadesEstudianteApiV1EvaluacionEstudiantesEstudianteIdActividadesGet(
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
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para ver el curso."
      />
    );
  }

  function cambiarPestana(nueva: PestanaCurso) {
    setSearchParams({ tab: nueva });
  }

  if (consultaCurso.isLoading) {
    return (
      <EstadoVacio
        titulo="Cargando curso..."
        descripcion="Estamos obteniendo la información de la asignatura."
      />
    );
  }

  const detalle =
    consultaCurso.data?.status === 200 ? consultaCurso.data.data : undefined;

  if (consultaCurso.isError || !detalle) {
    return (
      <EstadoVacio
        titulo="No pudimos cargar este curso"
        descripcion="Verifica que la asignatura corresponda a tu sección actual o vuelve al listado."
        accion={
          <Link
            to="/cursos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Volver a Mis cursos
          </Link>
        }
      />
    );
  }

  const actividadesDelCurso =
    consultaActividades.data?.status === 200
      ? consultaActividades.data.data.actividades.filter(
          (a) => a.curso.toLowerCase() === detalle.nombre.toLowerCase(),
        )
      : [];
  const pendientesCurso = filtrarActividadesPorPestana(actividadesDelCurso, "pendientes");
  const entregadosCurso = filtrarActividadesPorPestana(actividadesDelCurso, "entregados");

  const docentes = detalle.equipo.filter((p) => p.grupo === "docente");
  const equipoSeccion = detalle.equipo.filter((p) => p.grupo === "equipo_seccion");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid var(--border-card)",
          paddingBottom: 10,
          overflowX: "auto",
        }}
      >
        <Link
          to="/cursos"
          aria-label="Volver a Mis cursos"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-main)",
            marginRight: 8,
            whiteSpace: "nowrap",
          }}
        >
          ← Mis cursos
        </Link>

        <div role="tablist" aria-label="Secciones del curso" style={{ display: "flex", gap: 6 }}>
          {PESTANAS_CURSO.map((tab) => {
            const activa = pestanaActiva === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => cambiarPestana(tab.id)}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: activa ? "none" : "1px solid var(--border-input)",
                  backgroundColor: activa ? "var(--color-primary)" : "var(--bg-surface)",
                  color: activa ? "#FFFFFF" : "var(--text-main)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {tab.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      <BannerPortada
        titulo={detalle.nombre}
        subtitulo={`${usuario.grado_seccion ?? ""} · ${detalle.horario} · ${detalle.horas_semanales} h semanales`}
        acciones={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AvatarIniciales
              nombre={detalle.docente}
              iniciales={obtenerInicialesTexto(detalle.docente)}
              size={34}
              inverted
            />
            <div style={{ fontSize: 13, lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600 }}>{detalle.docente}</div>
              <div style={{ color: "#CBD5E1", fontSize: 12 }}>{detalle.rol_docente}</div>
            </div>
          </div>
        }
      />

      {pestanaActiva === "novedades" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Tarjeta>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, margin: 0 }}>
                  Próximas entregas
                </h2>
                <button
                  type="button"
                  onClick={() => cambiarPestana("trabajos")}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--color-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Ver todo
                </button>
              </div>
              {pendientesCurso.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                  ¡Excelente! No tienes trabajos por entregar en este curso.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pendientesCurso.map((act) => (
                    <div key={act.id} style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{act.titulo}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Entrega: {act.fecha_entrega ?? act.asignada}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tarjeta>

            <Tarjeta>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>
                Mi nivel actual
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detalle.competencias.map((comp) => (
                  <div
                    key={comp.nombre}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-main)" }}>{comp.nombre}</span>
                    <InsigniaNivel nivel={comp.trimestres[comp.trimestres.length - 1] ?? "—"} />
                  </div>
                ))}
              </div>
            </Tarjeta>
          </aside>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {detalle.stream.length === 0 ? (
              <EstadoVacio
                titulo="Sin publicaciones recientes"
                descripcion="Las novedades de este curso aparecerán aquí."
              />
            ) : (
              detalle.stream.map((item, idx) => (
                <Tarjeta key={`${item.titulo}-${idx}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                        {item.subtitulo} · {item.fecha}
                      </div>
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                        {item.titulo}
                      </div>
                    </div>
                    {item.nivel ? <InsigniaNivel nivel={item.nivel} /> : null}
                  </div>
                  {item.cuerpo ? (
                    <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {item.cuerpo}
                    </p>
                  ) : null}
                </Tarjeta>
              ))
            )}
          </div>
        </div>
      ) : pestanaActiva === "trabajos" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, margin: 0 }}>
              Pendientes ({pendientesCurso.length})
            </h2>
            {pendientesCurso.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                No tienes trabajos pendientes en este curso.
              </p>
            ) : (
              pendientesCurso.map((act) => <TarjetaActividad key={act.id} actividad={act} />)
            )}
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, margin: 0 }}>
              Completados ({entregadosCurso.length})
            </h2>
            {entregadosCurso.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                Aún no hay entregas o sesiones registradas.
              </p>
            ) : (
              entregadosCurso.map((act) => <TarjetaActividad key={act.id} actividad={act} />)
            )}
          </section>

          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            Las entregas se realizan en clase; el portal no recibe archivos.
          </p>
        </div>
      ) : pestanaActiva === "calificaciones" ? (
        <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(3, 52px)",
              gap: 10,
              padding: "12px 20px",
              backgroundColor: "var(--bg-subtle)",
              fontFamily: "var(--font-button)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            <span>Competencia</span>
            <span style={{ textAlign: "center" }}>I</span>
            <span style={{ textAlign: "center" }}>II</span>
            <span style={{ textAlign: "center" }}>III*</span>
          </div>

          {detalle.competencias.map((comp) => (
            <div
              key={comp.nombre}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(3, 52px)",
                gap: 10,
                alignItems: "center",
                padding: "14px 20px",
                borderTop: "1px solid var(--border-card)",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-main)" }}>{comp.nombre}</span>
              {[0, 1, 2].map((idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
                  <InsigniaNivel nivel={comp.trimestres[idx] ?? "—"} preliminar={idx === 2} />
                </div>
              ))}
            </div>
          ))}

          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--border-card)",
              backgroundColor: "var(--bg-subtle)",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <span>* III Trimestre en evaluación: último calificativo publicado.</span>
            <Link to="/calificaciones" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Ver conclusiones
            </Link>
          </div>
        </Tarjeta>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
          <Tarjeta>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, margin: "0 0 12px" }}>
              Docente
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docentes.map((persona) => (
                <div key={persona.nombre} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AvatarIniciales
                    nombre={persona.nombre}
                    iniciales={obtenerInicialesTexto(persona.nombre)}
                    size={38}
                    inverted
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{persona.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{persona.rol}</div>
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>

          <Tarjeta>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, margin: "0 0 12px" }}>
              Equipo de sección
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {equipoSeccion.map((persona) => (
                <div key={persona.nombre} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AvatarIniciales
                    nombre={persona.nombre}
                    iniciales={obtenerInicialesTexto(persona.nombre)}
                    size={38}
                    inverted
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{persona.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{persona.rol}</div>
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>

          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            Los docentes te escriben desde el portal; la comunicación es en un solo sentido.
          </p>
        </div>
      )}
    </div>
  );
}
