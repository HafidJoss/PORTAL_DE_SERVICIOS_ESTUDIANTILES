import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList, Inbox } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  InicioApoderadoOut,
  MensajeBandejaApoderadoOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import {
  getObtenerInicioApoderadoApiV1SeguimientoApoderadosApoderadoIdHijosEstudianteIdInicioGetQueryKey,
  useConfirmarLecturaComunicadoApoderadoApiV1SeguimientoApoderadosApoderadoIdComunicadosComunicadoIdConfirmarLecturaPost,
  useObtenerInicioApoderadoApiV1SeguimientoApoderadosApoderadoIdHijosEstudianteIdInicioGet,
} from "../../../api/generated/seguimiento/seguimiento";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  resolverApoderadoId,
  resolverHijoActivo,
} from "../../../shared/utilidades/sesion";
import { BandejaApoderado } from "../componentes/bandejaApoderado";
import { contarNoLeidosApoderado } from "../utilidades/filtrosBandejaApoderado";

interface InicioApoderadoVistaProps {
  usuario: UsuarioSesionOut;
  hijoActivoId?: string | null;
}

/** Tablero inicial del apoderado contextualizado al menor seleccionado (RF01, RF25, DA05). */
export function InicioApoderadoVista({
  usuario,
  hijoActivoId,
}: InicioApoderadoVistaProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const apoderadoId = resolverApoderadoId(usuario);
  const hijoActivo = resolverHijoActivo(usuario, hijoActivoId);
  const estudianteId = hijoActivo?.estudiante_id ?? "";
  const queryKey =
    getObtenerInicioApoderadoApiV1SeguimientoApoderadosApoderadoIdHijosEstudianteIdInicioGetQueryKey(
      apoderadoId,
      estudianteId,
    );

  const consulta =
    useObtenerInicioApoderadoApiV1SeguimientoApoderadosApoderadoIdHijosEstudianteIdInicioGet(
      apoderadoId,
      estudianteId,
      { query: { enabled: !!apoderadoId && !!estudianteId } },
    );

  const confirmarLectura =
    useConfirmarLecturaComunicadoApoderadoApiV1SeguimientoApoderadosApoderadoIdComunicadosComunicadoIdConfirmarLecturaPost();

  if (!apoderadoId || !estudianteId) {
    return (
      <EstadoVacio
        titulo="Sin menores vinculados"
        descripcion="Tu cuenta no tiene estudiantes vinculados activos en el portal."
      />
    );
  }

  if (consulta.isLoading) {
    return (
      <Tarjeta>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Cargando información familiar...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar el tablero familiar"
        descripcion="Ocurrió un problema al consultar los datos del estudiante seleccionado."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const datos = consulta.data.data;
  const sinLeerActual = contarNoLeidosApoderado(datos.mensajes_bandeja);
  const primerNombre = usuario.nombres.trim().split(/\s+/)[0] || "Familia";

  function actualizarCache(mutador: (prev: InicioApoderadoOut) => InicioApoderadoOut) {
    queryClient.setQueryData(queryKey, (actual: typeof consulta.data) => {
      if (!actual || actual.status !== 200) return actual;
      return { ...actual, data: mutador(actual.data) };
    });
  }

  function manejarAbrirMensaje(mensaje: MensajeBandejaApoderadoOut) {
    actualizarCache((prev) => {
      const mensajes = prev.mensajes_bandeja.map((m) =>
        m.id === mensaje.id ? { ...m, leido: true } : m,
      );
      return {
        ...prev,
        sin_leer: contarNoLeidosApoderado(mensajes),
        mensajes_bandeja: mensajes,
      };
    });
  }

  function manejarMarcarTodoLeido() {
    actualizarCache((prev) => ({
      ...prev,
      sin_leer: 0,
      mensajes_bandeja: prev.mensajes_bandeja.map((m) => ({ ...m, leido: true })),
    }));
  }

  async function manejarConfirmarLectura(mensaje: MensajeBandejaApoderadoOut) {
    setConfirmandoId(mensaje.id);
    try {
      await confirmarLectura.mutateAsync({
        apoderadoId,
        comunicadoId: mensaje.id,
      });
      actualizarCache((prev) => {
        const mensajes = prev.mensajes_bandeja.map((m) =>
          m.id === mensaje.id
            ? { ...m, lectura_confirmada: true, leido: true }
            : m,
        );
        return {
          ...prev,
          sin_leer: contarNoLeidosApoderado(mensajes),
          mensajes_bandeja: mensajes,
        };
      });
    } finally {
      setConfirmandoId(null);
    }
  }

  const kpis = [
    {
      etiqueta: "Comunicados sin leer",
      valor: `${sinLeerActual}`,
      Icon: Inbox,
    },
    {
      etiqueta: "Entregas próximas",
      valor: `${datos.pendientes_total}`,
      Icon: ClipboardList,
    },
    {
      etiqueta: "Asistencia del menor",
      valor: datos.asistencia_porcentaje,
      Icon: CalendarCheck,
    },
  ];

  return (
    <>
      <BannerPortada
        titulo={`Hola, ${primerNombre}`}
        subtitulo={`${datos.estudiante_nombre} · ${datos.grado_seccion}`}
      />

      <section
        aria-label="Resumen del estudiante seleccionado"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpis.map(({ etiqueta, valor, Icon }) => (
          <Tarjeta key={etiqueta}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{etiqueta}</div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {valor}
                </div>
              </div>
            </div>
          </Tarjeta>
        ))}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <BandejaApoderado
          mensajes={datos.mensajes_bandeja}
          onAbrirMensaje={manejarAbrirMensaje}
          onMarcarTodoLeido={manejarMarcarTodoLeido}
          onConfirmarLectura={manejarConfirmarLectura}
          confirmandoId={confirmandoId}
          onIrDestino={(ruta) => navigate(ruta)}
        />

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: 0 }}>
                Próximas entregas
              </h3>
            </div>
            {datos.proximas_entregas.length === 0 ? (
              <div style={{ padding: 18, fontSize: 13, color: "var(--text-muted)" }}>
                Sin entregas pendientes registradas.
              </div>
            ) : (
              <div>
                {datos.proximas_entregas.map((ent) => (
                  <div
                    key={ent.id}
                    style={{
                      padding: "12px 18px",
                      borderBottom: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                        {ent.titulo}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {ent.curso} · {ent.fecha_entrega}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: ent.urgente
                          ? "var(--status-warning-bg)"
                          : "var(--bg-subtle)",
                        color: ent.urgente
                          ? "var(--status-warning-fg)"
                          : "var(--text-secondary)",
                        flexShrink: 0,
                      }}
                    >
                      {ent.estado_etiqueta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>

          <Tarjeta>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: "0 0 10px" }}>
              Resumen de asistencia
            </h3>
            <div style={{ margin: "0 0 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                {datos.estudiante_nombre}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {datos.grado_seccion}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-subtle)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {datos.resumen_asistencia.presentes}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Asistencias</div>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-subtle)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {datos.resumen_asistencia.tardanzas}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Tardanzas</div>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-subtle)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {datos.resumen_asistencia.faltas}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Faltas</div>
              </div>
            </div>
            <Boton
              type="button"
              variant="outline"
              onClick={() => navigate("/asistencia")}
            >
              Ver asistencia
            </Boton>
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
