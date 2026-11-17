import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, FileEdit, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getObtenerInicioDocenteApiV1SeguimientoDocentesDocenteIdInicioGetQueryKey,
  useMarcarBandejaDocenteLeidaApiV1SeguimientoDocentesDocenteIdBandejaLeerTodoPost,
  useMarcarMensajeBandejaLeidoApiV1SeguimientoDocentesDocenteIdBandejaMensajeIdLeerPost,
  useObtenerInicioDocenteApiV1SeguimientoDocentesDocenteIdInicioGet,
  useResponderMensajeBandejaApiV1SeguimientoDocentesDocenteIdBandejaMensajeIdResponderPost,
} from "../../../api/generated/seguimiento/seguimiento";
import type {
  InicioDocenteOut,
  MensajeBandejaDocenteOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";
import { BandejaDocente } from "../componentes/bandejaDocente";
import { contarSinLeerBandeja } from "../utilidades/filtrosBandejaDocente";

export function InicioDocenteVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const docenteId = resolverDocenteId(usuario);
  const queryKey =
    getObtenerInicioDocenteApiV1SeguimientoDocentesDocenteIdInicioGetQueryKey(docenteId);

  const consulta = useObtenerInicioDocenteApiV1SeguimientoDocentesDocenteIdInicioGet(
    docenteId,
    { query: { enabled: !!docenteId } },
  );
  const marcarUno =
    useMarcarMensajeBandejaLeidoApiV1SeguimientoDocentesDocenteIdBandejaMensajeIdLeerPost();
  const marcarTodo =
    useMarcarBandejaDocenteLeidaApiV1SeguimientoDocentesDocenteIdBandejaLeerTodoPost();
  const responder =
    useResponderMensajeBandejaApiV1SeguimientoDocentesDocenteIdBandejaMensajeIdResponderPost();

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
          Cargando tablero docente...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar tu tablero docente"
        descripcion="Ocurrió un problema al consultar el seguimiento de tus secciones."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const datos = consulta.data.data;
  const primerNombre = usuario.nombres.trim().split(/\s+/)[0] || "Docente";
  const sinLeerActual = contarSinLeerBandeja(datos.mensajes_bandeja);

  function actualizarCacheInicio(mutador: (prev: InicioDocenteOut) => InicioDocenteOut) {
    queryClient.setQueryData(queryKey, (actual: typeof consulta.data) => {
      if (!actual || actual.status !== 200) return actual;
      return { ...actual, data: mutador(actual.data) };
    });
  }

  async function manejarAbrirMensaje(mensaje: MensajeBandejaDocenteOut) {
    await marcarUno.mutateAsync({ docenteId, mensajeId: mensaje.id });
    actualizarCacheInicio((prev) => {
      const mensajes = prev.mensajes_bandeja.map((m) =>
        m.id === mensaje.id ? { ...m, leido: true } : m,
      );
      return {
        ...prev,
        sin_leer: contarSinLeerBandeja(mensajes),
        mensajes_bandeja: mensajes,
      };
    });
  }

  async function manejarMarcarTodo() {
    await marcarTodo.mutateAsync({ docenteId });
    actualizarCacheInicio((prev) => ({
      ...prev,
      sin_leer: 0,
      mensajes_bandeja: prev.mensajes_bandeja.map((m) => ({ ...m, leido: true })),
    }));
  }

  async function manejarResponder(mensaje: MensajeBandejaDocenteOut, texto: string) {
    const resp = await responder.mutateAsync({
      docenteId,
      mensajeId: mensaje.id,
      data: { texto },
    });
    if (resp.status === 200) {
      const nueva = { texto: resp.data.texto, fecha: resp.data.fecha };
      actualizarCacheInicio((prev) => ({
        ...prev,
        mensajes_bandeja: prev.mensajes_bandeja.map((m) =>
          m.id === mensaje.id
            ? { ...m, leido: true, respuestas: [...(m.respuestas ?? []), nueva] }
            : m,
        ),
      }));
    }
  }

  return (
    <>
      <BannerPortada
        titulo={`Buenos días, Prof. ${primerNombre}`}
        subtitulo={`${datos.fecha_etiqueta} · Tienes ${sinLeerActual} mensajes sin leer.`}
        acciones={
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22 }}>
                {sinLeerActual}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Sin leer</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22 }}>
                {datos.por_calificar_total}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Notas pendientes</div>
            </div>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "span 1" }}>
          <BandejaDocente
            mensajes={datos.mensajes_bandeja}
            onAbrirMensaje={(m) => {
              void manejarAbrirMensaje(m);
            }}
            onMarcarTodoLeido={() => {
              void manejarMarcarTodo();
            }}
            onEnviarRespuesta={manejarResponder}
            marcandoTodo={marcarTodo.isPending}
            enviandoRespuesta={responder.isPending}
            onIrSeccion={(secId) => navigate(`/cursos/${secId}`)}
          />
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: 0 }}>
                Clases de hoy
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Jueves</span>
            </div>
            {datos.clases_hoy.map((c) => {
              const esEnCurso = c.estado === "En curso";
              const esSiguiente = c.estado === "Siguiente";
              return (
                <button
                  key={`${c.seccion_id}-${c.hora_inicio}`}
                  type="button"
                  onClick={() => navigate(c.sesion_id ? "/nota-del-dia" : `/cursos/${c.seccion_id}`)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 18px",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-main)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 48, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{c.hora_inicio}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.hora_fin}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.seccion_nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.aula}</div>
                  </div>
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: esEnCurso
                        ? "var(--color-primary)"
                        : esSiguiente
                          ? "var(--status-warning-bg)"
                          : "var(--bg-subtle)",
                      color: esEnCurso
                        ? "#FFFFFF"
                        : esSiguiente
                          ? "var(--status-warning-fg)"
                          : "var(--text-muted)",
                    }}
                  >
                    {c.estado}
                  </span>
                </button>
              );
            })}
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: 0 }}>
                Notas pendientes
              </h3>
            </div>
            {datos.notas_pendientes.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>
                ¡Al día! Todas tus clases tienen notas.
              </div>
            ) : (
              datos.notas_pendientes.map((p) => (
                <button
                  key={p.sesion_id}
                  type="button"
                  onClick={() => navigate(`/cursos/${p.seccion_id}`)}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "10px 18px",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-main)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{p.titulo}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
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
                      {p.seccion_nombre} · {p.registrados}/{p.total}
                    </span>
                  </div>
                </button>
              ))
            )}
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: 0 }}>
                Requiere tu atención
              </h3>
            </div>
            {datos.alertas.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => navigate(`/cursos/${a.seccion_id}`)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 18px",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-main)",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor:
                      a.severidad === "danger"
                        ? "var(--status-danger-bg)"
                        : a.severidad === "warning"
                          ? "var(--status-warning-bg)"
                          : "var(--bg-subtle)",
                    color:
                      a.severidad === "danger"
                        ? "var(--status-danger)"
                        : a.severidad === "warning"
                          ? "var(--status-warning-fg)"
                          : "var(--text-main)",
                  }}
                >
                  {a.severidad === "danger" ? (
                    <AlertTriangle size={15} />
                  ) : a.severidad === "warning" ? (
                    <NotebookPen size={15} />
                  ) : (
                    <FileEdit size={15} />
                  )}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.4 }}>{a.texto}</span>
              </button>
            ))}
          </Tarjeta>

          <Tarjeta>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 15,
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <BookOpen size={16} />
              <span>{datos.trimestre_actual}</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {datos.etapas_trimestre.map((e) => (
                <div key={e.nombre} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      marginTop: 5,
                      flexShrink: 0,
                      backgroundColor:
                        e.estado === "actual"
                          ? "var(--color-primary)"
                          : e.estado === "completada"
                            ? "var(--color-secondary-slate)"
                            : "var(--border-subtle)",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: e.estado === "actual" ? 600 : 400 }}>
                      {e.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{e.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
