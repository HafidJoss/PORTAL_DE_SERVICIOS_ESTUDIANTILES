import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { UsuarioSesionOut } from "../../api/generated/model";
import {
  getObtenerInicioEstudianteApiV1SeguimientoEstudiantesEstudianteIdInicioGetQueryKey,
  useMarcarNovedadesVistasApiV1SeguimientoEstudiantesEstudianteIdNovedadesVistoPost,
  useObtenerInicioEstudianteApiV1SeguimientoEstudiantesEstudianteIdInicioGet,
} from "../../api/generated/seguimiento/seguimiento";
import { BannerHero } from "../../shared/components/BannerHero";
import { Button } from "../../shared/components/Button";
import { EstadoVacio } from "../../shared/components/EstadoVacio";
import { leerPreferenciasAvisos } from "../../shared/preferencias/preferenciasAvisos";
import { resolverEstudianteId } from "../../shared/utils/sesion";
import { filtrarNovedadesPorPreferencias } from "./filtrosSeguimiento";
import {
  VARIANTES_INICIO,
  guardarVarianteInicio,
  leerVarianteInicio,
  type VarianteInicio,
} from "./preferenciasInicio";
import { VarianteAgendaSemanal } from "./variantes/VarianteAgendaSemanal";
import { VarianteFeedNovedades } from "./variantes/VarianteFeedNovedades";
import { VarianteResumenModulos } from "./variantes/VarianteResumenModulos";

interface InicioPageProps {
  usuario: UsuarioSesionOut;
}

/** Tablero Inicio (/inicio) del estudiante con soporte para las variantes A, B y C. */
export function InicioPage({ usuario }: InicioPageProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const queryClient = useQueryClient();
  const [variante, setVariante] = useState<VarianteInicio>(() => leerVarianteInicio());
  const [errorVisto, setErrorVisto] = useState<string | null>(null);

  const consulta = useObtenerInicioEstudianteApiV1SeguimientoEstudiantesEstudianteIdInicioGet(
    estudianteId,
    {
      query: {
        enabled: Boolean(estudianteId),
      },
    },
  );

  const marcarVisto =
    useMarcarNovedadesVistasApiV1SeguimientoEstudiantesEstudianteIdNovedadesVistoPost();

  if (!estudianteId) {
    return (
      <EstadoVacio
        titulo="Vista disponible solo para estudiantes"
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para ver el tablero de inicio."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const primerNombre = usuario.nombres.trim().split(/\s+/)[0] || usuario.nombres;
  const preferencias = leerPreferenciasAvisos();
  const novedadesVisibles = datos
    ? filtrarNovedadesPorPreferencias(datos.novedades, preferencias)
    : [];

  function seleccionarVariante(nueva: VarianteInicio) {
    setVariante(nueva);
    guardarVarianteInicio(nueva);
  }

  async function manejarMarcarVisto() {
    setErrorVisto(null);
    try {
      const resp = await marcarVisto.mutateAsync({ estudianteId });
      if (resp.status !== 200) {
        setErrorVisto("No se pudo marcar las novedades como vistas. Inténtalo nuevamente.");
        return;
      }
      const queryKey =
        getObtenerInicioEstudianteApiV1SeguimientoEstudiantesEstudianteIdInicioGetQueryKey(
          estudianteId,
        );
      queryClient.setQueryData(queryKey, (actual: typeof consulta.data) => {
        if (!actual || actual.status !== 200) return actual;
        return {
          ...actual,
          data: {
            ...actual.data,
            novedades_sin_ver: 0,
            ultima_visita: resp.data.ultima_visita,
          },
        };
      });
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      setErrorVisto("No se pudo marcar las novedades como vistas. Inténtalo nuevamente.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerHero
        titulo={`¡Hola, ${primerNombre}!`}
        subtitulo={
          datos
            ? `Última visita: ${datos.ultima_visita} · ${datos.novedades_sin_ver} novedades sin ver`
            : "Resumen de tu seguimiento diario"
        }
        acciones={
          datos ? (
            <Button
              variant="secondary"
              disabled={marcarVisto.isPending || datos.novedades_sin_ver === 0}
              onClick={() => void manejarMarcarVisto()}
            >
              {marcarVisto.isPending ? "Marcando..." : "Marcar todo como visto"}
            </Button>
          ) : null
        }
      />

      {errorVisto ? (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-danger-bg)",
            color: "var(--status-danger)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {errorVisto}
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Variantes del tablero de inicio"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-card)",
          paddingBottom: 12,
        }}
      >
        {VARIANTES_INICIO.map((opcion) => {
          const activa = variante === opcion.clave;
          return (
            <button
              key={opcion.clave}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => seleccionarVariante(opcion.clave)}
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
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando tu inicio..."
          descripcion="Estamos preparando tus novedades, entregas y agenda semanal."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tu inicio"
          descripcion="Ocurrió un problema al consultar tu resumen de seguimiento."
          accion={
            <Button variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : variante === "A" ? (
        <VarianteFeedNovedades
          novedades={novedadesVisibles}
          proximasEntregas={datos.proximas_entregas}
        />
      ) : variante === "B" ? (
        <VarianteResumenModulos
          kpis={datos.kpis}
          proximasEntregas={datos.proximas_entregas}
          novedades={novedadesVisibles}
          distribucionNiveles={datos.distribucion_niveles}
        />
      ) : (
        <VarianteAgendaSemanal
          agendaSemanal={datos.agenda_semanal}
          novedades={novedadesVisibles}
        />
      )}
    </div>
  );
}
