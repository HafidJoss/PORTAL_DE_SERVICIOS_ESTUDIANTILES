import { ArrowLeft, Megaphone, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  useConfirmarCierreCompetenciaApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdCierreConfirmarPost,
  useCrearActividadDocenteApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdActividadesPost,
  useCrearSesionClaseApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesPost,
  useGuardarNotasSesionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesSesionIdNotasPut,
  useObtenerPanelEvaluacionSeccionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdClasesGet,
  usePublicarActividadDocenteApiV1EvaluacionDocentesDocenteIdActividadesActividadIdPublicarPost,
  useRegistrarObservacionDocenteApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdObservacionesPost,
} from "../../../api/generated/evaluacion/evaluacion";
import type {
  ActividadDocenteCreateIn,
  ActividadDocenteOut,
  ElementoStreamSeccionOut,
  NivelGuardadoDocenteOut,
  ObservacionDocenteCreateIn,
  SesionClaseCreateIn,
  SesionClaseOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import {
  useObtenerDetalleSeccionDocenteApiV1SeguimientoDocentesDocenteIdSeccionesSeccionIdGet,
  usePublicarAnuncioSeccionApiV1SeguimientoDocentesDocenteIdSeccionesSeccionIdAnunciosPost,
} from "../../../api/generated/seguimiento/seguimiento";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";
import { FichaClaseCuadricula } from "../../evaluacion/componentes/fichaClaseCuadricula";
import { FormularioActividadDocente } from "../../evaluacion/componentes/formularioActividadDocente";
import { FormularioNuevaClase } from "../../evaluacion/componentes/formularioNuevaClase";
import { ListaEstudiantesSeccion } from "../../evaluacion/componentes/listaEstudiantesSeccion";
import { PanelCierreCompetencias } from "../../evaluacion/componentes/panelCierreCompetencias";
import { RegistroAuxiliarTabla } from "../../evaluacion/componentes/registroAuxiliarTabla";
import {
  ajustarNotaDiaEnSesiones,
  actualizarCriterioEnSesiones,
  calcularNotaDelDia,
  completarVaciosEnSesiones,
  contarIncompletosSesion,
  type NivelCneb,
} from "../../evaluacion/utilidades/calculoMediana";
import {
  descargarArchivoCsv,
  serializarRegistroAuxiliarCsv,
} from "../../evaluacion/utilidades/exportadorCsvAuxiliar";

type TabDetalleDocente = "nov" | "clases" | "reg" | "act" | "cierre" | "est";

const PESTANAS_DOCENTE: readonly { id: TabDetalleDocente; label: string }[] = [
  { id: "nov", label: "Novedades" },
  { id: "clases", label: "Clases" },
  { id: "reg", label: "Registro auxiliar" },
  { id: "act", label: "Actividades" },
  { id: "cierre", label: "Cierre" },
  { id: "est", label: "Estudiantes" },
];

function normalizarTab(valor: string | null): TabDetalleDocente {
  if (valor && PESTANAS_DOCENTE.some((p) => p.id === valor)) {
    return valor as TabDetalleDocente;
  }
  return "nov";
}

export function CursoDocenteDetalleVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const { asignaturaId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabDetalleDocente>(() => normalizarTab(searchParams.get("tab")));
  const [stream, setStream] = useState<ElementoStreamSeccionOut[]>([]);
  const [sesiones, setSesiones] = useState<SesionClaseOut[]>([]);
  const [actividades, setActividades] = useState<ActividadDocenteOut[]>([]);
  const [cierres, setCierres] = useState<NivelGuardadoDocenteOut[]>([]);
  const [obsConteoExtra, setObsConteoExtra] = useState<Record<number, number>>({});

  const [sesionAbiertaId, setSesionAbiertaId] = useState<string | null>(null);
  const [nuevaClaseAbierta, setNuevaClaseAbierta] = useState(false);
  const [errorFicha, setErrorFicha] = useState("");

  const [anuncioTipo, setAnuncioTipo] = useState<"Aviso" | "Recordatorio" | "Tarea">("Aviso");
  const [anuncioTexto, setAnuncioTexto] = useState("");
  const [errorAnuncio, setErrorAnuncio] = useState("");
  const [avisoGlobal, setAvisoGlobal] = useState("");

  const docenteId = resolverDocenteId(usuario);

  const consultaDetalle =
    useObtenerDetalleSeccionDocenteApiV1SeguimientoDocentesDocenteIdSeccionesSeccionIdGet(
      docenteId,
      asignaturaId,
      { query: { enabled: Boolean(docenteId && asignaturaId), retry: false } },
    );

  const consultaPanel =
    useObtenerPanelEvaluacionSeccionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdClasesGet(
      docenteId,
      asignaturaId,
      { query: { enabled: Boolean(docenteId && asignaturaId), retry: false } },
    );

  const mutAnuncio =
    usePublicarAnuncioSeccionApiV1SeguimientoDocentesDocenteIdSeccionesSeccionIdAnunciosPost();
  const mutCrearSesion =
    useCrearSesionClaseApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesPost();
  const mutGuardarNotas =
    useGuardarNotasSesionApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdSesionesSesionIdNotasPut();
  const mutCrearActividad =
    useCrearActividadDocenteApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdActividadesPost();
  const mutPublicarActividad =
    usePublicarActividadDocenteApiV1EvaluacionDocentesDocenteIdActividadesActividadIdPublicarPost();
  const mutConfirmarCierre =
    useConfirmarCierreCompetenciaApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdCierreConfirmarPost();
  const mutObservacion =
    useRegistrarObservacionDocenteApiV1EvaluacionDocentesDocenteIdSeccionesSeccionIdObservacionesPost();

  useEffect(() => {
    setTab(normalizarTab(searchParams.get("tab")));
  }, [searchParams]);

  const detalle = consultaDetalle.data?.status === 200 ? consultaDetalle.data.data : null;
  const panel = consultaPanel.data?.status === 200 ? consultaPanel.data.data : null;

  useEffect(() => {
    if (detalle) setStream(detalle.stream);
  }, [detalle]);

  useEffect(() => {
    if (!panel) return;
    setSesiones(panel.sesiones);
    setActividades(panel.actividades);
    setCierres(panel.cierres);
    setObsConteoExtra({});
    setSesionAbiertaId(null);
    setNuevaClaseAbierta(false);
    setErrorFicha("");
  }, [panel]);

  if (!docenteId) {
    return (
      <EstadoVacio
        titulo="Vista exclusiva del perfil docente"
        descripcion="Tu sesión actual no tiene un perfil docente asignado."
      />
    );
  }

  if (consultaDetalle.isLoading || consultaPanel.isLoading) {
    return (
      <Tarjeta>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Cargando detalle de la sección...
        </p>
      </Tarjeta>
    );
  }

  if (consultaDetalle.isError || consultaPanel.isError || !detalle || !panel) {
    return (
      <EstadoVacio
        titulo="Sección no encontrada"
        descripcion={`No encontramos información disponible para la sección «${asignaturaId}».`}
        accion={
          <Boton type="button" onClick={() => navigate("/cursos")}>
            Volver a Mis cursos
          </Boton>
        }
      />
    );
  }

  const confirmadasCount = cierres.filter((c) => c.confirmada).length;
  const estudiantesConObs = panel.estudiantes.map((e) => ({
    ...e,
    observaciones_total: (e.observaciones_total ?? 0) + (obsConteoExtra[e.indice] ?? 0),
  }));

  async function manejarPublicarAnuncio(evento: FormEvent) {
    evento.preventDefault();
    if (anuncioTexto.trim().length < 3) {
      setErrorAnuncio("Escribe un anuncio de al menos 3 caracteres.");
      return;
    }
    setErrorAnuncio("");
    const resp = await mutAnuncio.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      data: { tipo: anuncioTipo, texto: anuncioTexto.trim() },
    });
    if (resp.status === 201) {
      setStream((prev) => [resp.data, ...prev]);
      setAnuncioTexto("");
      setAvisoGlobal("Anuncio publicado en Novedades (comunicación unidireccional).");
    }
  }

  async function manejarCrearClase(datos: SesionClaseCreateIn) {
    const resp = await mutCrearSesion.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      data: datos,
    });
    if (resp.status === 201) {
      setSesiones((prev) => [...prev, resp.data]);
      setNuevaClaseAbierta(false);
      setSesionAbiertaId(resp.data.id);
      setAvisoGlobal(`Clase «${resp.data.tema}» agregada.`);
    }
  }

  async function manejarGuardarNotas(sesId: string, publicar: boolean) {
    const objetivo = sesiones.find((s) => s.id === sesId);
    if (!objetivo || !panel) return;

    if (publicar) {
      const faltantes = contarIncompletosSesion(objetivo, panel.estudiantes.length);
      if (faltantes > 0) {
        setErrorFicha(
          `Faltan completar criterios en ${faltantes} estudiante(s) antes de publicar.`,
        );
        return;
      }
    }

    setErrorFicha("");
    const ajustes: Record<string, NivelCneb> = {};
    for (const [k, v] of Object.entries(objetivo.ajustes_manuales)) {
      if (v === "AD" || v === "A" || v === "B" || v === "C") ajustes[k] = v;
    }

    const resp = await mutGuardarNotas.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      sesionId: sesId,
      data: {
        notas_por_estudiante: objetivo.notas_por_estudiante,
        ajustes_manuales: ajustes,
        publicar,
      },
    });
    if (resp.status === 200) {
      setSesiones((prev) =>
        prev.map((s) => (s.id === sesId ? { ...s, estado: resp.data.estado } : s)),
      );
      setAvisoGlobal(publicar ? "Notas de sesión publicadas." : "Avance de sesión guardado.");
    }
  }

  async function manejarCrearActividad(datos: ActividadDocenteCreateIn) {
    const resp = await mutCrearActividad.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      data: datos,
    });
    if (resp.status === 201) {
      setActividades((prev) => [resp.data, ...prev]);
      setAvisoGlobal(
        resp.data.estado === "borrador"
          ? "Actividad guardada como borrador."
          : "Actividad publicada para estudiantes y apoderados.",
      );
    }
  }

  async function manejarPublicarBorrador(actividadId: string) {
    const resp = await mutPublicarActividad.mutateAsync({ docenteId, actividadId });
    if (resp.status === 200) {
      setActividades((prev) => prev.map((a) => (a.id === actividadId ? resp.data : a)));
      setAvisoGlobal("Actividad publicada correctamente.");
    }
  }

  async function manejarConfirmarCierre(comp: "C1" | "C2" | "C3" | "C4") {
    if (!panel) return;
    const cierre = cierres.find((c) => c.competencia === comp);
    const nivelesMap = (cierre?.niveles_por_estudiante ?? {}) as Record<string, string>;
    const conclMap = (cierre?.conclusiones_por_estudiante ?? {}) as Record<string, string>;
    const filas = panel.estudiantes.map((e) => ({
      estudiante_idx: e.indice,
      nivel: (nivelesMap[String(e.indice)] ?? "") as "" | NivelCneb,
      conclusion: conclMap[String(e.indice)] ?? "",
    }));

    const resp = await mutConfirmarCierre.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      data: {
        competencia: comp,
        nivel_educativo: panel.nivel_educativo,
        filas,
      },
    });
    if (resp.status === 200) {
      setCierres((prev) =>
        prev.map((c) => (c.competencia === comp ? { ...c, confirmada: true } : c)),
      );
      setAvisoGlobal(`${comp} confirmada para el cierre del trimestre.`);
    }
  }

  async function manejarObservacion(datos: ObservacionDocenteCreateIn) {
    const resp = await mutObservacion.mutateAsync({
      docenteId,
      seccionId: asignaturaId,
      data: datos,
    });
    if (resp.status === 201) {
      setObsConteoExtra((prev) => ({
        ...prev,
        [datos.estudiante_idx]: (prev[datos.estudiante_idx] ?? 0) + 1,
      }));
      setAvisoGlobal("Observación publicada para el estudiante y su apoderado.");
    }
  }

  const sesionActiva = sesiones.find((s) => s.id === sesionAbiertaId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        role="tablist"
        aria-label="Secciones de trabajo de la asignatura"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid var(--border-subtle)",
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        <Boton
          type="button"
          variant="outline"
          size="sm"
          aria-label="Volver a Mis cursos"
          onClick={() => navigate("/cursos")}
        >
          <ArrowLeft size={16} />
        </Boton>

        {PESTANAS_DOCENTE.map((p) => {
          const activa = tab === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => {
                setTab(p.id);
                setAvisoGlobal("");
              }}
              style={{
                height: 40,
                padding: "0 14px",
                border: "none",
                borderBottom: `3px solid ${activa ? "var(--color-primary)" : "transparent"}`,
                backgroundColor: "transparent",
                color: activa ? "var(--color-primary)" : "var(--text-secondary)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <BannerPortada
        titulo={`${detalle.asignatura} · ${detalle.nombre}`}
        subtitulo={`${detalle.horario} · ${detalle.aula} · Tutor(a): ${detalle.tutor}`}
        acciones={
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20 }}>
                {detalle.estudiantes_total}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Estudiantes</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20 }}>
                {sesiones.filter((s) => s.estado === "registrada").length}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Clases registradas</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20 }}>
                {confirmadasCount}/{detalle.competencias_total}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Competencias confirmadas</div>
            </div>
          </div>
        }
      />

      {avisoGlobal ? (
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
          {avisoGlobal}
        </div>
      ) : null}

      {tab === "nov" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
          <aside style={{ flex: "1 1 250px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <Tarjeta>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontFamily: "var(--font-heading)" }}>
                Notas pendientes
              </h3>
              {detalle.pendientes.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  Todo calificado en esta sección.
                </p>
              ) : (
                detalle.pendientes.map((p) => (
                  <button
                    key={p.sesion_id}
                    type="button"
                    onClick={() => {
                      setTab("clases");
                      setSesionAbiertaId(p.sesion_id);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      padding: "4px 0",
                      cursor: "pointer",
                      color: "var(--color-primary)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {p.titulo} ({p.registrados}/{p.total})
                  </button>
                ))
              )}
            </Tarjeta>

            <Tarjeta>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, fontFamily: "var(--font-heading)" }}>
                Niveles de la sección
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                {detalle.distribucion_niveles.map((item) => (
                  <div
                    key={item.nivel}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
                  >
                    <InsigniaNivel nivel={item.nivel} />
                    <span>{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </Tarjeta>
          </aside>

          <div style={{ flex: "999 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <Tarjeta>
              <form
                onSubmit={(e) => void manejarPublicarAnuncio(e)}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Megaphone size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: 14 }}>Publicar anuncio en un solo sentido</strong>
                  <select
                    aria-label="Categoría del anuncio"
                    value={anuncioTipo}
                    onChange={(e) =>
                      setAnuncioTipo(e.target.value as "Aviso" | "Recordatorio" | "Tarea")
                    }
                    style={{
                      marginLeft: "auto",
                      height: 32,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-input)",
                      padding: "0 8px",
                    }}
                  >
                    <option value="Aviso">Aviso</option>
                    <option value="Recordatorio">Recordatorio</option>
                    <option value="Tarea">Tarea</option>
                  </select>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                  <span>Anuncio unidireccional para la sección (sin respuestas libres en muro)</span>
                  <textarea
                    rows={2}
                    placeholder="Escribe un aviso o recordatorio para la sección..."
                    value={anuncioTexto}
                    onChange={(e) => setAnuncioTexto(e.target.value)}
                    style={{
                      padding: 10,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-input)",
                    }}
                  />
                </label>

                {errorAnuncio ? (
                  <div role="alert" style={{ color: "var(--status-danger)", fontSize: 12 }}>
                    {errorAnuncio}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Boton type="submit" size="sm" disabled={mutAnuncio.isPending}>
                    Publicar anuncio
                  </Boton>
                </div>
              </form>
            </Tarjeta>

            {stream.map((item) => (
              <Tarjeta key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--bg-subtle)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.tipo}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.fecha}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 6 }}>{item.titulo}</div>
                {item.subtitulo ? (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {item.subtitulo}
                  </div>
                ) : null}
                {item.cuerpo ? (
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    {item.cuerpo}
                  </p>
                ) : null}
              </Tarjeta>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "clases" ? (
        sesionActiva ? (
          <FichaClaseCuadricula
            sesion={sesionActiva}
            estudiantes={panel.estudiantes}
            competenciaNombre={
              panel.competencias.find((c) => c.codigo === sesionActiva.competencia)?.nombre ?? ""
            }
            capacidadNombre={
              panel.competencias.find((c) => c.codigo === sesionActiva.competencia)
                ?.capacidades[sesionActiva.capacidad_idx] ?? ""
            }
            errorValidacion={errorFicha}
            guardando={mutGuardarNotas.isPending}
            onVolver={() => setSesionAbiertaId(null)}
            onCambiarCriterio={(sesId, estIdx, critIdx, val) =>
              setSesiones((prev) =>
                actualizarCriterioEnSesiones(prev, sesId, estIdx, critIdx, val),
              )
            }
            onCompletarVacios={(sesId, nivel) =>
              setSesiones((prev) =>
                completarVaciosEnSesiones(prev, sesId, panel.estudiantes.length, nivel),
              )
            }
            onAjustarNotaDia={(sesId, estIdx, val) =>
              setSesiones((prev) => ajustarNotaDiaEnSesiones(prev, sesId, estIdx, val))
            }
            onGuardarBorrador={(sesId) => manejarGuardarNotas(sesId, false)}
            onPublicarSesion={(sesId) => manejarGuardarNotas(sesId, true)}
            onDescargarCsv={() => {
              const csv = serializarRegistroAuxiliarCsv(
                ["Estudiante", "K1", "K2", "K3", "K4", "Nota del día"],
                panel.estudiantes.map((est) => {
                  const key = String(est.indice);
                  const k = sesionActiva.notas_por_estudiante[key] ?? ["", "", "", ""];
                  const nota = calcularNotaDelDia(k, sesionActiva.ajustes_manuales[key]) || "—";
                  return [est.nombre, k[0] || "—", k[1] || "—", k[2] || "—", k[3] || "—", nota];
                }),
              );
              descargarArchivoCsv(`clase-${asignaturaId}-${sesionActiva.id}.csv`, csv);
            }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
                Sesiones de clase ({sesiones.length})
              </h3>
              <Boton type="button" size="sm" onClick={() => setNuevaClaseAbierta((p) => !p)}>
                <Plus size={15} /> {nuevaClaseAbierta ? "Cerrar" : "Nueva clase"}
              </Boton>
            </div>

            {nuevaClaseAbierta ? (
              <FormularioNuevaClase
                competencias={panel.competencias}
                guardando={mutCrearSesion.isPending}
                onCrearClase={manejarCrearClase}
                onCancelar={() => setNuevaClaseAbierta(false)}
              />
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sesiones.map((ses) => (
                <Tarjeta
                  key={ses.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {ses.fecha} · {ses.competencia}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{ses.tema}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {ses.evidencia}
                    </div>
                  </div>
                  <Boton
                    type="button"
                    variant={ses.estado === "pendiente" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSesionAbiertaId(ses.id)}
                  >
                    {ses.estado === "pendiente" ? "Registrar notas" : "Ver ficha"}
                  </Boton>
                </Tarjeta>
              ))}
            </div>
          </div>
        )
      ) : null}

      {tab === "reg" ? (
        <RegistroAuxiliarTabla
          seccionId={asignaturaId}
          competencias={panel.competencias}
          estudiantes={panel.estudiantes}
          sesiones={sesiones}
        />
      ) : null}

      {tab === "act" ? (
        <FormularioActividadDocente
          actividades={actividades}
          competencias={panel.competencias}
          guardando={mutCrearActividad.isPending || mutPublicarActividad.isPending}
          onCrearActividad={manejarCrearActividad}
          onPublicarBorrador={manejarPublicarBorrador}
        />
      ) : null}

      {tab === "cierre" ? (
        <PanelCierreCompetencias
          competencias={panel.competencias}
          estudiantes={panel.estudiantes}
          sesiones={sesiones}
          cierres={cierres}
          nivelEducativo={panel.nivel_educativo}
          guardando={mutConfirmarCierre.isPending}
          onCambiarNivel={(comp, estIdx, nivel) =>
            setCierres((prev) =>
              prev.map((c) =>
                c.competencia === comp
                  ? {
                      ...c,
                      niveles_por_estudiante: {
                        ...c.niveles_por_estudiante,
                        [String(estIdx)]: nivel,
                      },
                    }
                  : c,
              ),
            )
          }
          onCambiarConclusion={(comp, estIdx, texto) =>
            setCierres((prev) =>
              prev.map((c) =>
                c.competencia === comp
                  ? {
                      ...c,
                      conclusiones_por_estudiante: {
                        ...c.conclusiones_por_estudiante,
                        [String(estIdx)]: texto,
                      },
                    }
                  : c,
              ),
            )
          }
          onAplicarSugeridos={(comp, mapa) =>
            setCierres((prev) =>
              prev.map((c) =>
                c.competencia === comp
                  ? { ...c, niveles_por_estudiante: { ...c.niveles_por_estudiante, ...mapa } }
                  : c,
              ),
            )
          }
          onConfirmarCompetencia={manejarConfirmarCierre}
        />
      ) : null}

      {tab === "est" ? (
        <ListaEstudiantesSeccion
          estudiantes={estudiantesConObs}
          sesiones={sesiones}
          guardando={mutObservacion.isPending}
          onPublicarObservacion={manejarObservacion}
        />
      ) : null}
    </div>
  );
}
