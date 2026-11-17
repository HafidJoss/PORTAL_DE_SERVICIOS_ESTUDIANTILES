import { useState } from "react";
import { Link } from "react-router-dom";

import { useObtenerCalificacionesEstudianteApiV1EvaluacionEstudiantesEstudianteIdCalificacionesGet } from "../../../api/generated/evaluacion/evaluacion";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { useEsMovil } from "../../../shared/ganchos/useEsMovil";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import {
  LEYENDA_NIVELES_LOGRO,
  obtenerMiniNivelesCurso,
  seleccionarCursoCalificaciones,
} from "../utilidades/filtrosCalificaciones";

interface CalificacionesVistaProps {
  usuario: UsuarioSesionOut;
}

/** Vista Calificaciones (/calificaciones) por competencias y escala cualitativa (RVM 094-2020). */
export function CalificacionesVista({ usuario }: CalificacionesVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const esMovil = useEsMovil();
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<string | null>(null);
  const [detalleMovilAbierto, setDetalleMovilAbierto] = useState(false);

  const consulta =
    useObtenerCalificacionesEstudianteApiV1EvaluacionEstudiantesEstudianteIdCalificacionesGet(
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
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para consultar calificaciones."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const cursoActivo = datos
    ? seleccionarCursoCalificaciones(datos.cursos, asignaturaSeleccionada)
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Calificaciones"
        subtitulo={
          datos
            ? `Niveles de logro por competencia · Trimestre ${datos.trimestre_actual} (${datos.estado_trimestre})`
            : "Niveles de logro por competencia"
        }
        acciones={
          <Link
            to="/libreta"
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "#FFFFFF",
              color: "var(--color-primary)",
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Ver libreta
          </Link>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }} aria-label="Leyenda de niveles">
        {LEYENDA_NIVELES_LOGRO.map((item) => (
          <span
            key={item.nivel}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}
          >
            <InsigniaNivel nivel={item.nivel} />
            <span>{item.nombre}</span>
          </span>
        ))}
      </div>

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando calificaciones..."
          descripcion="Estamos consultando tus niveles por competencia."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tus calificaciones"
          descripcion="Ocurrió un problema al consultar tus calificaciones por asignatura."
          accion={
            <Boton variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          }
        />
      ) : !cursoActivo ? (
        <EstadoVacio
          titulo="Aún no hay asignaturas calificadas"
          descripcion="Cuando tus docentes publiquen evaluaciones aparecerán aquí."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {!esMovil || !detalleMovilAbierto ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {datos.cursos.map((curso) => {
                const seleccionado = curso.asignatura_id === cursoActivo.asignatura_id;
                const mini = obtenerMiniNivelesCurso(curso);
                return (
                  <button
                    key={curso.asignatura_id}
                    type="button"
                    aria-pressed={seleccionado}
                    onClick={() => {
                      setAsignaturaSeleccionada(curso.asignatura_id);
                      setDetalleMovilAbierto(true);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: seleccionado
                        ? "2px solid var(--color-primary)"
                        : "1px solid var(--border-card)",
                      backgroundColor: "var(--bg-surface)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                      {curso.nombre}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{curso.docente}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                      {mini.map((nivel, idx) => (
                        <InsigniaNivel key={`${curso.asignatura_id}-${idx}`} nivel={nivel} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {!esMovil || detalleMovilAbierto ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {esMovil && detalleMovilAbierto ? (
                <button
                  type="button"
                  onClick={() => setDetalleMovilAbierto(false)}
                  style={{
                    alignSelf: "flex-start",
                    border: "none",
                    background: "none",
                    color: "var(--color-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Volver a cursos
                </button>
              ) : null}

            <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 20, borderBottom: "1px solid var(--border-card)" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, margin: 0 }}>
                  {cursoActivo.nombre}
                </h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {cursoActivo.docente}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(3, 52px)",
                  gap: 10,
                  padding: "10px 20px",
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

              {cursoActivo.competencias.map((comp) => (
                <div
                  key={comp.nombre}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr repeat(3, 52px)",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 20px",
                    borderTop: "1px solid var(--border-card)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-main)" }}>{comp.nombre}</span>
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
                      <InsigniaNivel
                        nivel={comp.trimestres[idx] ?? "—"}
                        preliminar={idx === 2 && comp.en_evaluacion_t3}
                      />
                    </div>
                  ))}
                </div>
              ))}

              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border-card)",
                  backgroundColor: "var(--bg-subtle)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                * III Trimestre en evaluación: se muestra el último calificativo publicado sugerido por mediana de capacidades. Tu docente confirmará el nivel al cierre.
              </div>
            </Tarjeta>

            {cursoActivo.conclusiones.length > 0 ? (
              <Tarjeta>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 12px" }}>
                  Conclusiones descriptivas
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cursoActivo.conclusiones.map((concl, idx) => (
                    <div
                      key={`${concl.trimestre}-${idx}`}
                      style={{
                        padding: 14,
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-subtle)",
                        border: "1px solid var(--border-card)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <InsigniaNivel nivel={concl.nivel} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {concl.trimestre} · {concl.competencia}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{concl.texto}</p>
                    </div>
                  ))}
                </div>
              </Tarjeta>
            ) : null}

            <Tarjeta>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 12px" }}>
                Calificativos publicados · Trimestre {datos.trimestre_actual}
              </h3>

              {cursoActivo.calificativos_publicados.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                  Aún no hay calificativos publicados en este trimestre.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cursoActivo.calificativos_publicados.map((cal) => (
                    <div
                      key={cal.id}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        paddingBottom: 12,
                        borderBottom: "1px solid var(--border-card)",
                      }}
                    >
                      <InsigniaNivel nivel={cal.nivel} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{cal.titulo}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {cal.tipo === "sesion_clase" ? "Nota del día" : "Trabajo"} · {cal.fecha} · {cal.competencia}
                        </div>
                        {cal.comentario ? (
                          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                            «{cal.comentario}»
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tarjeta>
          </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
