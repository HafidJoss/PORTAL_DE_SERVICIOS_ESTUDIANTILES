import { Bell, ClipboardList, Mail, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  useEnviarMensajeDocenteApiV1EvaluacionDocentesDocenteIdMensajesPost,
  useListarMensajesDocenteApiV1EvaluacionDocentesDocenteIdMensajesGet,
} from "../../../api/generated/evaluacion/evaluacion";
import type {
  MensajeEnviadoDocenteOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";
import {
  describirAlcanceDestinatario,
  validarFormularioMensajeDocente,
} from "../utilidades/filtrosMensajesDocente";

export function MensajesDocenteVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const [tipo, setTipo] = useState<"Tarea" | "Recordatorio">("Tarea");
  const [seccionId, setSeccionId] = useState("");
  const [estudianteIdx, setEstudianteIdx] = useState<string>("");
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [enviados, setEnviados] = useState<MensajeEnviadoDocenteOut[]>([]);
  const [errorForm, setErrorForm] = useState("");
  const [avisoOk, setAvisoOk] = useState("");

  const docenteId = resolverDocenteId(usuario);
  const consulta = useListarMensajesDocenteApiV1EvaluacionDocentesDocenteIdMensajesGet(docenteId, {
    query: { enabled: Boolean(docenteId) },
  });
  const mutEnviar = useEnviarMensajeDocenteApiV1EvaluacionDocentesDocenteIdMensajesPost();

  const datos = consulta.data?.status === 200 ? consulta.data.data : null;

  useEffect(() => {
    if (!datos) return;
    setEnviados(datos.enviados);
    setSeccionId((prev) => prev || datos.secciones[0]?.seccion_id || "");
  }, [datos]);

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
          Cargando mensajería docente...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || !datos) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar Mensajes"
        descripcion="Ocurrió un problema al consultar las secciones y mensajes enviados."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const seccionActiva =
    datos.secciones.find((s) => s.seccion_id === seccionId) ?? datos.secciones[0];
  const estSeleccionado =
    estudianteIdx !== ""
      ? seccionActiva?.estudiantes.find((e) => String(e.indice) === estudianteIdx)?.nombre
      : undefined;

  async function manejarEnviar(evento: FormEvent) {
    evento.preventDefault();
    if (!seccionActiva) return;

    const validacion = validarFormularioMensajeDocente({ asunto, cuerpo });
    if (!validacion.valido) {
      setErrorForm(validacion.error);
      setAvisoOk("");
      return;
    }

    setErrorForm("");
    const resp = await mutEnviar.mutateAsync({
      docenteId,
      data: {
        tipo,
        seccion_id: seccionActiva.seccion_id,
        estudiante_idx: estudianteIdx === "" ? null : Number(estudianteIdx),
        asunto: asunto.trim(),
        cuerpo: cuerpo.trim(),
      },
    });

    if (resp.status === 201) {
      setEnviados((prev) => [resp.data, ...prev]);
      setAsunto("");
      setCuerpo("");
      setAvisoOk(`Mensaje enviado a ${resp.data.destinatario}.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <BannerPortada
        titulo="Mensajes"
        subtitulo="Envía tareas o recordatorios a una sección o a un estudiante y su apoderado, sin archivos adjuntos."
        acciones={
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22 }}>
              {enviados.length}
            </div>
            <div style={{ fontSize: 12, color: "#CBD5E1" }}>Enviados</div>
          </div>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
        <Tarjeta style={{ flex: "1 1 380px", minWidth: 0 }}>
          <form
            onSubmit={(e) => void manejarEnviar(e)}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <h2 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
              Nuevo mensaje
            </h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["Tarea", "Recordatorio"] as const).map((opcion) => {
                const activa = tipo === opcion;
                return (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setTipo(opcion)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: "var(--radius-pill)",
                      border: `1px solid ${activa ? "var(--color-primary)" : "var(--border-subtle)"}`,
                      backgroundColor: activa
                        ? "var(--color-primary-light)"
                        : "var(--bg-surface)",
                      color: activa ? "var(--color-primary)" : "var(--text-secondary)",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Sección</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {datos.secciones.map((sec) => {
                  const activa = sec.seccion_id === seccionActiva?.seccion_id;
                  return (
                    <button
                      key={sec.seccion_id}
                      type="button"
                      onClick={() => {
                        setSeccionId(sec.seccion_id);
                        setEstudianteIdx("");
                      }}
                      style={{
                        height: 34,
                        padding: "0 14px",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${activa ? "var(--color-primary)" : "var(--border-subtle)"}`,
                        backgroundColor: activa
                          ? "var(--color-primary-light)"
                          : "var(--bg-surface)",
                        color: activa ? "var(--color-primary)" : "var(--text-main)",
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {sec.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              <span>Destinatario</span>
              <select
                value={estudianteIdx}
                onChange={(e) => setEstudianteIdx(e.target.value)}
                style={{
                  height: 38,
                  padding: "0 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              >
                <option value="">Toda la sección (estudiantes y apoderados)</option>
                {(seccionActiva?.estudiantes ?? []).map((est) => (
                  <option key={est.indice} value={est.indice}>
                    {est.nombre} y su apoderado
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              <span>Asunto</span>
              <input
                type="text"
                placeholder="Ej. Recuerden traer su compás"
                value={asunto}
                onChange={(e) => {
                  setAsunto(e.target.value);
                  setErrorForm("");
                }}
                style={{
                  height: 38,
                  padding: "0 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              <span>Mensaje</span>
              <textarea
                rows={4}
                placeholder="Escribe indicaciones claras (sin archivos adjuntos)..."
                value={cuerpo}
                onChange={(e) => {
                  setCuerpo(e.target.value);
                  setErrorForm("");
                }}
                style={{
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              />
            </label>

            {errorForm ? (
              <div role="alert" style={{ color: "var(--status-danger)", fontSize: 13 }}>
                {errorForm}
              </div>
            ) : null}

            {avisoOk ? (
              <div
                role="status"
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--status-success-bg)",
                  color: "var(--status-success-fg)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {avisoOk}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {seccionActiva
                  ? describirAlcanceDestinatario(
                      seccionActiva.nombre,
                      seccionActiva.estudiantes_total,
                      estSeleccionado,
                    )
                  : ""}
              </span>
              <Boton type="submit" disabled={mutEnviar.isPending}>
                <Send size={15} /> Enviar
              </Boton>
            </div>
          </form>
        </Tarjeta>

        <Tarjeta style={{ flex: "1 1 360px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Mail size={17} color="var(--color-primary)" />
            <h2 style={{ margin: 0, fontSize: 16, fontFamily: "var(--font-heading)" }}>
              Enviados ({enviados.length})
            </h2>
          </div>

          {enviados.map((msg) => {
            const Icon = msg.tipo === "Recordatorio" ? Bell : ClipboardList;
            return (
              <div
                key={msg.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Para: {msg.destinatario}</span>
                    <span>{msg.fecha}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{msg.asunto}</div>
                  {msg.cuerpo ? (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                      {msg.cuerpo}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Tarjeta>
      </div>
    </div>
  );
}
