import { useState } from "react";

import { useListarActividadesEstudianteApiV1EvaluacionEstudiantesEstudianteIdActividadesGet } from "../../../api/generated/evaluacion/evaluacion";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import {
  filtrarActividadesPorPestana,
  type PestanaTrabajos,
} from "../utilidades/filtrosActividades";
import { TarjetaActividad } from "../componentes/tarjetaActividad";

interface TrabajosVistaProps {
  usuario: UsuarioSesionOut;
}

const PESTANAS: ReadonlyArray<{ id: PestanaTrabajos; etiqueta: string }> = [
  { id: "pendientes", etiqueta: "Pendientes" },
  { id: "entregados", etiqueta: "Entregados" },
  { id: "todos", etiqueta: "Todos" },
];

/** Vista Trabajos y pendientes (/trabajos) para consulta de trabajos y notas del día. */
export function TrabajosVista({ usuario }: TrabajosVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const [pestana, setPestana] = useState<PestanaTrabajos>("pendientes");

  const consulta =
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
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para consultar trabajos."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const listaFiltrada = datos
    ? filtrarActividadesPorPestana(datos.actividades, pestana)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Trabajos y pendientes"
        subtitulo="Revisa tus tareas asignadas y las notas del día registradas en clase."
        acciones={
          datos ? (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                  {datos.pendientes}
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Pendientes</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                  {datos.vencen_pronto}
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Vencen pronto</div>
              </div>
            </div>
          ) : null
        }
      />

      <div
        role="tablist"
        aria-label="Filtrar actividades"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-card)",
          paddingBottom: 12,
        }}
      >
        {PESTANAS.map((tab) => {
          const activa = pestana === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setPestana(tab.id)}
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
          titulo="Cargando actividades..."
          descripcion="Estamos consultando tus trabajos y sesiones de clase."
        />
      ) : consulta.isError ? (
        <EstadoVacio
          titulo="No pudimos cargar tus trabajos"
          descripcion="Ocurrió un problema al consultar tus actividades académicas. Inténtalo nuevamente."
          accion={
            <Boton variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          }
        />
      ) : listaFiltrada.length === 0 ? (
        <EstadoVacio
          titulo="No tienes actividades en esta vista"
          descripcion="Cuando tus docentes publiquen trabajos o sesiones evaluadas aparecerán aquí."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {listaFiltrada.map((actividad) => (
            <TarjetaActividad key={actividad.id} actividad={actividad} />
          ))}
        </div>
      )}

      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
        Las entregas se realizan en clase; el portal no recibe archivos.
      </p>
    </div>
  );
}
