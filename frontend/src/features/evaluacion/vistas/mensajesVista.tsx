import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  getListarMensajesEstudianteApiV1EvaluacionEstudiantesEstudianteIdMensajesGetQueryKey,
  useConfirmarLecturaMensajeApiV1EvaluacionMensajesMensajeIdLeerPost,
  useListarMensajesEstudianteApiV1EvaluacionEstudiantesEstudianteIdMensajesGet,
  useResponderMensajeApiV1EvaluacionMensajesMensajeIdRespuestasPost,
} from "../../../api/generated/evaluacion/evaluacion";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { useEsMovil } from "../../../shared/ganchos/useEsMovil";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import {
  META_TIPO_MENSAJE,
  PESTANAS_MENSAJES,
  filtrarMensajesPorPestana,
  validarRespuestaHilo,
  type PestanaMensajes,
} from "../utilidades/filtrosMensajes";

interface MensajesVistaProps {
  usuario: UsuarioSesionOut;
}

/** Bandeja de mensajes docentes (/mensajes) con lectura e hilos de respuesta acotados (RF25). */
export function MensajesVista({ usuario }: MensajesVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const esMovil = useEsMovil();
  const queryClient = useQueryClient();
  const [pestana, setPestana] = useState<PestanaMensajes>("todos");
  const [mensajeSeleccionadoId, setMensajeSeleccionadoId] = useState<string | null>(null);
  const [mostrarDetalleMovil, setMostrarDetalleMovil] = useState(false);
  const [borradorRespuesta, setBorradorRespuesta] = useState("");
  const [errorRespuesta, setErrorRespuesta] = useState<string | null>(null);
  const [errorLectura, setErrorLectura] = useState<string | null>(null);

  const consulta =
    useListarMensajesEstudianteApiV1EvaluacionEstudiantesEstudianteIdMensajesGet(
      estudianteId,
      {
        query: {
          enabled: Boolean(estudianteId),
        },
      },
    );

  const mutLectura = useConfirmarLecturaMensajeApiV1EvaluacionMensajesMensajeIdLeerPost();
  const mutRespuesta =
    useResponderMensajeApiV1EvaluacionMensajesMensajeIdRespuestasPost();

  if (!estudianteId) {
    return (
      <EstadoVacio
        titulo="Vista disponible solo para estudiantes"
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para revisar mensajes."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const mensajesFiltrados = datos ? filtrarMensajesPorPestana(datos.mensajes, pestana) : [];
  const mensajeActivo =
    mensajesFiltrados.find((m) => m.id === mensajeSeleccionadoId) ?? mensajesFiltrados[0];

  const queryKey =
    getListarMensajesEstudianteApiV1EvaluacionEstudiantesEstudianteIdMensajesGetQueryKey(
      estudianteId,
    );

  async function manejarConfirmarLectura(mensajeId: string) {
    setErrorLectura(null);
    try {
      const resp = await mutLectura.mutateAsync({ mensajeId });
      if (resp.status !== 200) {
        setErrorLectura("No se pudo confirmar la lectura del mensaje.");
        return;
      }
      queryClient.setQueryData(queryKey, (actual: typeof consulta.data) => {
        if (!actual || actual.status !== 200) return actual;
        let descuento = 0;
        const mensajesActualizados = actual.data.mensajes.map((m) => {
          if (m.id !== mensajeId) return m;
          if (m.no_leido) descuento = 1;
          return { ...m, no_leido: false, lectura_confirmada: true };
        });
        return {
          ...actual,
          data: {
            ...actual.data,
            sin_leer: Math.max(0, actual.data.sin_leer - descuento),
            mensajes: mensajesActualizados,
          },
        };
      });
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      setErrorLectura("No se pudo confirmar la lectura del mensaje.");
    }
  }

  async function manejarEnviarRespuesta(evento: FormEvent) {
    evento.preventDefault();
    if (!mensajeActivo) return;

    const validacion = validarRespuestaHilo(borradorRespuesta);
    if (validacion) {
      setErrorRespuesta(validacion);
      return;
    }

    setErrorRespuesta(null);
    try {
      const resp = await mutRespuesta.mutateAsync({
        mensajeId: mensajeActivo.id,
        data: { contenido: borradorRespuesta.trim() },
      });
      if (resp.status !== 200) {
        setErrorRespuesta("No se pudo enviar tu respuesta. Inténtalo nuevamente.");
        return;
      }
      const nuevaRespuesta = resp.data;
      queryClient.setQueryData(queryKey, (actual: typeof consulta.data) => {
        if (!actual || actual.status !== 200) return actual;
        return {
          ...actual,
          data: {
            ...actual.data,
            mensajes: actual.data.mensajes.map((m) =>
              m.id === mensajeActivo.id
                ? { ...m, respuestas: [...m.respuestas, nuevaRespuesta] }
                : m,
            ),
          },
        };
      });
      setBorradorRespuesta("");
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      setErrorRespuesta("No se pudo enviar tu respuesta. Inténtalo nuevamente.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Mensajes"
        subtitulo="Tareas, recordatorios y observaciones de tus docentes."
        acciones={
          datos ? (
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {datos.sin_leer}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Sin leer</div>
            </div>
          ) : null
        }
      />

      <div
        role="tablist"
        aria-label="Filtrar mensajes por categoría"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-card)",
          paddingBottom: 12,
        }}
      >
        {PESTANAS_MENSAJES.map((tab) => {
          const activa = pestana === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => {
                setPestana(tab.id);
                setMostrarDetalleMovil(false);
              }}
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
                cursor: "pointer",
              }}
            >
              {tab.etiqueta}
            </button>
          );
        })}
      </div>

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando mensajes..."
          descripcion="Estamos consultando tu bandeja de mensajes docentes."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tus mensajes"
          descripcion="Ocurrió un problema al consultar tu bandeja. Inténtalo nuevamente."
          accion={
            <Boton variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          }
        />
      ) : mensajesFiltrados.length === 0 ? (
        <EstadoVacio
          titulo="No hay mensajes en esta categoría"
          descripcion="Cuando tus docentes publiquen nuevos avisos o tareas aparecerán aquí."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {!esMovil || !mostrarDetalleMovil ? (
            <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
              {mensajesFiltrados.map((m) => {
                const seleccionado = mensajeActivo?.id === m.id;
                const meta = META_TIPO_MENSAJE[m.tipo];
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={seleccionado}
                    onClick={() => {
                      setMensajeSeleccionadoId(m.id);
                      setMostrarDetalleMovil(true);
                      setErrorRespuesta(null);
                      setErrorLectura(null);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      border: "none",
                      borderBottom: "1px solid var(--border-card)",
                      borderLeft: seleccionado
                        ? "3px solid var(--color-primary)"
                        : "3px solid transparent",
                      backgroundColor: m.no_leido ? "var(--bg-subtle)" : "var(--bg-surface)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <AvatarIniciales nombre={m.remitente} size={38} inverted />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>{m.remitente}</span>
                        <span>{m.fecha}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: m.no_leido ? 700 : 500,
                          color: "var(--text-main)",
                        }}
                      >
                        {m.asunto}
                      </div>
                      <span
                        style={{
                          alignSelf: "flex-start",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: meta.bg,
                          color: meta.fg,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {meta.etiqueta}
                      </span>
                    </div>
                  </button>
                );
              })}
            </Tarjeta>
          ) : null}

          {mensajeActivo && (!esMovil || mostrarDetalleMovil) ? (
            <Tarjeta style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {esMovil && mostrarDetalleMovil ? (
                <button
                  type="button"
                  onClick={() => setMostrarDetalleMovil(false)}
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
                  ← Volver a mensajes
                </button>
              ) : null}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: META_TIPO_MENSAJE[mensajeActivo.tipo].bg,
                    color: META_TIPO_MENSAJE[mensajeActivo.tipo].fg,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {META_TIPO_MENSAJE[mensajeActivo.tipo].etiqueta}
                </span>

                {mensajeActivo.lectura_confirmada ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--status-success-fg)" }}>
                    Lectura confirmada
                  </span>
                ) : (
                  <Boton
                    variant="outline"
                    size="sm"
                    disabled={mutLectura.isPending}
                    onClick={() => void manejarConfirmarLectura(mensajeActivo.id)}
                  >
                    {mutLectura.isPending ? "Confirmando..." : "Confirmar lectura"}
                  </Boton>
                )}
              </div>

              {errorLectura ? (
                <div role="alert" style={{ fontSize: 13, color: "var(--status-danger)" }}>
                  {errorLectura}
                </div>
              ) : null}

              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, margin: "0 0 6px" }}>
                  {mensajeActivo.asunto}
                </h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {mensajeActivo.remitente} · {mensajeActivo.curso} · {mensajeActivo.fecha_larga} · Para: {mensajeActivo.destinatarios}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {mensajeActivo.cuerpo}
              </p>

              {mensajeActivo.actividad_id ? (
                <div>
                  <Link
                    to="/trabajos"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 36,
                      padding: "0 14px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--color-primary)",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    Ver en Trabajos
                  </Link>
                </div>
              ) : null}

              <section style={{ borderTop: "1px solid var(--border-card)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, margin: 0 }}>
                  Respuestas en este hilo ({mensajeActivo.respuestas.length})
                </h3>

                {mensajeActivo.respuestas.map((resp) => (
                  <div
                    key={resp.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                      <strong>
                        {resp.autor} · {resp.rol_autor}
                      </strong>
                      <span>{resp.fecha}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14 }}>{resp.contenido}</p>
                  </div>
                ))}

                <form onSubmit={(e) => void manejarEnviarRespuesta(e)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
                    Responder en el hilo
                    <textarea
                      rows={3}
                      value={borradorRespuesta}
                      onChange={(e) => setBorradorRespuesta(e.target.value)}
                      placeholder="Escribe tu consulta para el docente (máximo 2000 caracteres)"
                      style={{
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-input)",
                        padding: 10,
                        fontFamily: "inherit",
                        fontSize: 14,
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-main)",
                      }}
                    />
                  </label>
                  {errorRespuesta ? (
                    <div role="alert" style={{ fontSize: 13, color: "var(--status-danger)" }}>
                      {errorRespuesta}
                    </div>
                  ) : null}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Solo texto en hilo con tu docente; no se adjuntan archivos.
                    </span>
                    <Boton type="submit" variant="primary" disabled={mutRespuesta.isPending}>
                      {mutRespuesta.isPending ? "Enviando..." : "Enviar respuesta"}
                    </Boton>
                  </div>
                </form>
              </section>
            </Tarjeta>
          ) : null}
        </div>
      )}
    </div>
  );
}
