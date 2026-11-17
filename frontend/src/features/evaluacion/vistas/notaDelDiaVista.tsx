import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useCrearSesionClaseApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesPost,
  useGuardarNotasSesionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesSesionIdNotasPut,
  useObtenerPanelEvaluacionSeccionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdClasesGet,
} from "../../../api/generated/evaluacion/evaluacion";
import type {
  SesionClaseCreateIn,
  SesionClaseOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";
import { FichaClaseCuadricula } from "../componentes/fichaClaseCuadricula";
import { FormularioNuevaClase } from "../componentes/formularioNuevaClase";
import {
  ajustarNotaDiaEnSesiones,
  actualizarCriterioEnSesiones,
  calcularNotaDelDia,
  completarVaciosEnSesiones,
  contarIncompletosSesion,
  type NivelCneb,
} from "../utilidades/calculoMediana";
import {
  descargarArchivoCsv,
  serializarRegistroAuxiliarCsv,
} from "../utilidades/exportadorCsvAuxiliar";

const SECCIONES_DISPONIBLES = [
  { id: "3A", nombre: "3.° A" },
  { id: "3B", nombre: "3.° B" },
  { id: "4A", nombre: "4.° A" },
  { id: "4C", nombre: "4.° C" },
] as const;

export function NotaDelDiaVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const [searchParams] = useSearchParams();
  const seccionParam = searchParams.get("seccion");
  const seccionInicial = SECCIONES_DISPONIBLES.some((s) => s.id === seccionParam)
    ? (seccionParam as string)
    : "4A";

  const [seccionId, setSeccionId] = useState(seccionInicial);
  const [sesionesLocales, setSesionesLocales] = useState<SesionClaseOut[]>([]);
  const [sesionActivaId, setSesionActivaId] = useState<string>("");
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const [errorFicha, setErrorFicha] = useState("");
  const [avisoOk, setAvisoOk] = useState("");

  const docenteId = resolverDocenteId(usuario);
  const consulta =
    useObtenerPanelEvaluacionSeccionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdClasesGet(
      docenteId,
      seccionId,
      { query: { enabled: Boolean(docenteId) } },
    );

  const mutCrearSesion =
    useCrearSesionClaseApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesPost();
  const mutGuardarNotas =
    useGuardarNotasSesionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesSesionIdNotasPut();

  const panelDatos = consulta.data?.status === 200 ? consulta.data.data : null;

  useEffect(() => {
    if (!panelDatos) return;
    setSesionesLocales(panelDatos.sesiones);
    const pendiente = panelDatos.sesiones.find((s) => s.estado === "pendiente");
    setSesionActivaId(
      pendiente?.id ?? panelDatos.sesiones[panelDatos.sesiones.length - 1]?.id ?? "",
    );
    setErrorFicha("");
    setAvisoOk("");
    setNuevaAbierta(false);
  }, [panelDatos]);

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
          Cargando ficha rápida del día...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || !panelDatos) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar la Nota del día"
        descripcion="Ocurrió un problema al consultar las sesiones de la sección."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const sesionActiva =
    sesionesLocales.find((s) => s.id === sesionActivaId) ??
    sesionesLocales[sesionesLocales.length - 1];

  const compMeta =
    panelDatos.competencias.find((c) => c.codigo === sesionActiva?.competencia) ??
    panelDatos.competencias[0];

  async function persistirNotas(sesId: string, publicar: boolean) {
    const objetivo = sesionesLocales.find((s) => s.id === sesId);
    if (!objetivo || !panelDatos) return;

    if (publicar) {
      const faltantes = contarIncompletosSesion(objetivo, panelDatos.estudiantes.length);
      if (faltantes > 0) {
        setErrorFicha(
          `Faltan completar los 4 criterios en ${faltantes} estudiante(s) antes de publicar.`,
        );
        return;
      }
    }

    setErrorFicha("");
    const ajustesTipados: Record<string, NivelCneb> = {};
    for (const [k, v] of Object.entries(objetivo.ajustes_manuales)) {
      if (v === "AD" || v === "A" || v === "B" || v === "C") ajustesTipados[k] = v;
    }

    const resp = await mutGuardarNotas.mutateAsync({
      docenteId,
      seccionId,
      sesionId: sesId,
      data: {
        notas_por_estudiante: objetivo.notas_por_estudiante,
        ajustes_manuales: ajustesTipados,
        publicar,
      },
    });

    if (resp.status === 200) {
      setSesionesLocales((prev) =>
        prev.map((s) => (s.id === sesId ? { ...s, estado: resp.data.estado } : s)),
      );
      setAvisoOk(
        publicar
          ? "Nota del día publicada correctamente."
          : "Avances de criterios guardados.",
      );
    }
  }

  async function manejarCrearClase(datos: SesionClaseCreateIn) {
    const resp = await mutCrearSesion.mutateAsync({
      docenteId,
      seccionId,
      data: datos,
    });
    if (resp.status === 201) {
      setSesionesLocales((prev) => [...prev, resp.data]);
      setSesionActivaId(resp.data.id);
      setNuevaAbierta(false);
      setAvisoOk(`Sesión «${resp.data.tema}» creada.`);
    }
  }

  function descargarFichaCsv() {
    if (!sesionActiva || !panelDatos) return;
    const csv = serializarRegistroAuxiliarCsv(
      ["Estudiante", "K1", "K2", "K3", "K4", "Nota del día"],
      panelDatos.estudiantes.map((est) => {
        const key = String(est.indice);
        const k = sesionActiva.notas_por_estudiante[key] ?? ["", "", "", ""];
        const nota = calcularNotaDelDia(k, sesionActiva.ajustes_manuales[key]) || "—";
        return [est.nombre, k[0] || "—", k[1] || "—", k[2] || "—", k[3] || "—", nota];
      }),
    );
    descargarArchivoCsv(`nota-del-dia-${seccionId}-${sesionActiva.id}.csv`, csv);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BannerPortada
        titulo="Nota del día"
        subtitulo={`${panelDatos.seccion_nombre} · ${panelDatos.asignatura_nombre} · Captura rápida de criterios K1..K4`}
        acciones={
          <Boton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setNuevaAbierta((prev) => !prev)}
          >
            <Plus size={15} /> {nuevaAbierta ? "Cerrar formulario" : "Nueva clase"}
          </Boton>
        }
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {SECCIONES_DISPONIBLES.map((sec) => {
          const activa = sec.id === seccionId;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSeccionId(sec.id)}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${activa ? "var(--color-primary)" : "var(--border-subtle)"}`,
                backgroundColor: activa ? "var(--color-primary-light)" : "var(--bg-surface)",
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

        {sesionesLocales.length > 0 ? (
          <select
            aria-label="Seleccionar sesión de clase"
            value={sesionActiva?.id ?? ""}
            onChange={(e) => {
              setSesionActivaId(e.target.value);
              setErrorFicha("");
            }}
            style={{
              height: 36,
              marginLeft: "auto",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-input)",
              padding: "0 10px",
              fontSize: 13,
            }}
          >
            {sesionesLocales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fecha} · {s.tema} ({s.estado === "pendiente" ? "Pendiente" : "Publicada"})
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {avisoOk ? (
        <div
          role="status"
          style={{
            padding: "10px 14px",
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

      {nuevaAbierta ? (
        <FormularioNuevaClase
          competencias={panelDatos.competencias}
          guardando={mutCrearSesion.isPending}
          onCrearClase={manejarCrearClase}
          onCancelar={() => setNuevaAbierta(false)}
        />
      ) : null}

      {sesionActiva && compMeta ? (
        <FichaClaseCuadricula
          sesion={sesionActiva}
          estudiantes={panelDatos.estudiantes}
          competenciaNombre={compMeta.nombre}
          capacidadNombre={compMeta.capacidades[sesionActiva.capacidad_idx] ?? ""}
          guardando={mutGuardarNotas.isPending}
          errorValidacion={errorFicha}
          onCambiarCriterio={(sesId, estIdx, critIdx, val) =>
            setSesionesLocales((prev) =>
              actualizarCriterioEnSesiones(prev, sesId, estIdx, critIdx, val),
            )
          }
          onCompletarVacios={(sesId, nivel) =>
            setSesionesLocales((prev) =>
              completarVaciosEnSesiones(prev, sesId, panelDatos.estudiantes.length, nivel),
            )
          }
          onAjustarNotaDia={(sesId, estIdx, val) =>
            setSesionesLocales((prev) => ajustarNotaDiaEnSesiones(prev, sesId, estIdx, val))
          }
          onGuardarBorrador={(sesId) => persistirNotas(sesId, false)}
          onPublicarSesion={(sesId) => persistirNotas(sesId, true)}
          onDescargarCsv={descargarFichaCsv}
        />
      ) : null}
    </div>
  );
}
