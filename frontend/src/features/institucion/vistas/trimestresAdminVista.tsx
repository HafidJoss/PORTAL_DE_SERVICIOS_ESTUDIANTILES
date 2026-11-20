import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  FileCheck,
  Lock,
  Play,
  RotateCcw,
} from "lucide-react";

import {
  getListarTrimestresAdminApiV1InstitucionTrimestresGetQueryKey,
  getObtenerTableroAdminApiV1InstitucionTableroAdminGetQueryKey,
  useEjecutarTransicionTrimestreApiV1InstitucionTrimestresTrimestreIdTransicionPost,
  useListarTrimestresAdminApiV1InstitucionTrimestresGet,
  usePublicarLibretaTrimestreApiV1InstitucionTrimestresTrimestreIdPublicarLibretaPost,
} from "../../../api/generated/institucion/institucion";
import type { TrimestreAdminOut, TrimestreAdminOutEstado } from "../../../api/generated/model";
import { ProblemDetailError } from "../../../api/clienteHttp";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  accionesDisponiblesTrimestre,
  etapasProgresoTrimestre,
  validarFormularioReapertura,
  type TipoAccionPanelTrimestre,
} from "../utilidades/reglasTrimestresAdmin";

const ESTILO_ESTADO: Record<TrimestreAdminOutEstado, { bg: string; fg: string }> = {
  Aperturado: { bg: "#F1F5F9", fg: "#475569" },
  "En Evaluación": { bg: "#FFFBEB", fg: "#B45309" },
  "Cierre Preliminar": { bg: "#EFF6FF", fg: "#1D4ED8" },
  Cerrado: { bg: "#ECFDF5", fg: "#047857" },
};

function textosPanel(trimestre: TrimestreAdminOut, accion: TipoAccionPanelTrimestre) {
  const pendientes = trimestre.secciones_pendientes_cierre ?? 0;
  if (accion === "iniciar_evaluacion") {
    return {
      titulo: `Iniciar la evaluación del ${trimestre.nombre}`,
      cuerpo: "Los docentes podrán registrar actividades, notas del día y calificativos.",
      advertencia: "",
      confirmar: "Confirmar inicio de evaluación",
    };
  }
  if (accion === "cierre_preliminar") {
    return {
      titulo: `Pasar el ${trimestre.nombre} a cierre preliminar`,
      cuerpo:
        "Desde este momento los docentes ya no registran nuevos calificativos: solo ajustan niveles y conclusiones descriptivas.",
      advertencia:
        pendientes > 0
          ? `${pendientes} secciones aún no tienen todas sus competencias confirmadas.`
          : "",
      confirmar: "Confirmar cierre preliminar",
    };
  }
  if (accion === "cerrar") {
    return {
      titulo: `Cerrar el ${trimestre.nombre}`,
      cuerpo:
        "Se validan los niveles de todas las secciones y se bloquea la edición. Luego podrás publicar la libreta.",
      advertencia:
        pendientes > 0
          ? `${pendientes} secciones con niveles sin confirmar: no podrán exportarse al SIAGIE hasta reabrir.`
          : "",
      confirmar: "Confirmar cierre",
    };
  }
  if (accion === "publicar_libreta") {
    return {
      titulo: `Publicar la libreta del ${trimestre.nombre}`,
      cuerpo:
        "Estudiantes y apoderados podrán ver y descargar la libreta en PDF. Se notificará por el portal.",
      advertencia: "",
      confirmar: "Confirmar publicación",
    };
  }
  return {
    titulo: `Reabrir el ${trimestre.nombre}`,
    cuerpo:
      "Permite corregir niveles y conclusiones. Al volver a cerrar se generará una nueva versión de la libreta.",
    advertencia: "",
    confirmar: "Reabrir trimestre",
  };
}

function iconoAccion(tipo: TipoAccionPanelTrimestre) {
  if (tipo === "iniciar_evaluacion") return Play;
  if (tipo === "publicar_libreta") return FileCheck;
  if (tipo === "reabrir") return RotateCcw;
  return Lock;
}

export function TrimestresAdminVista() {
  const queryClient = useQueryClient();
  const [panelActivo, setPanelActivo] = useState<{
    trimestreId: number;
    accion: TipoAccionPanelTrimestre;
  } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [actaEmitida, setActaEmitida] = useState(false);
  const [documentoUgel, setDocumentoUgel] = useState("");
  const [errorPanel, setErrorPanel] = useState("");

  const consulta = useListarTrimestresAdminApiV1InstitucionTrimestresGet();
  const transicionMutation =
    useEjecutarTransicionTrimestreApiV1InstitucionTrimestresTrimestreIdTransicionPost();
  const publicarMutation =
    usePublicarLibretaTrimestreApiV1InstitucionTrimestresTrimestreIdPublicarLibretaPost();

  if (consulta.isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--text-muted)" }}>
        Cargando año escolar y trimestres...
      </div>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <Tarjeta>
        <p style={{ margin: 0, color: "var(--status-danger-fg)" }}>
          No se pudieron cargar los trimestres del año lectivo.
        </p>
      </Tarjeta>
    );
  }

  const datos = consulta.data.data;

  function abrirPanel(trimestreId: number, accion: TipoAccionPanelTrimestre) {
    setPanelActivo({ trimestreId, accion });
    setMotivo("");
    setActaEmitida(false);
    setDocumentoUgel("");
    setErrorPanel("");
  }

  async function confirmarPanel() {
    if (!panelActivo) return;
    setErrorPanel("");

    if (panelActivo.accion === "reabrir") {
      const errorLocal = validarFormularioReapertura(motivo, actaEmitida, documentoUgel);
      if (errorLocal) {
        setErrorPanel(errorLocal);
        return;
      }
    }

    try {
      if (panelActivo.accion === "publicar_libreta") {
        await publicarMutation.mutateAsync({ trimestreId: panelActivo.trimestreId });
      } else {
        await transicionMutation.mutateAsync({
          trimestreId: panelActivo.trimestreId,
          data: {
            accion: panelActivo.accion,
            motivo: panelActivo.accion === "reabrir" ? motivo.trim() : undefined,
            acta_emitida_siagie: panelActivo.accion === "reabrir" ? actaEmitida : false,
            documento_ugel:
              panelActivo.accion === "reabrir" && actaEmitida ? documentoUgel.trim() : undefined,
          },
        });
      }
      setPanelActivo(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListarTrimestresAdminApiV1InstitucionTrimestresGetQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getObtenerTableroAdminApiV1InstitucionTableroAdminGetQueryKey(),
        }),
      ]);
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setErrorPanel(err.detail || err.title);
      } else {
        setErrorPanel("No se pudo actualizar el estado del trimestre.");
      }
    }
  }

  const procesando = transicionMutation.isPending || publicarMutation.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Año escolar y trimestres"
        subtitulo="Los calificativos solo se registran con el trimestre En Evaluación. En Cierre Preliminar solo se ajustan niveles y conclusiones."
        acciones={
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {datos.anio_lectivo}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>Año lectivo</div>
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {datos.trimestre_actual_corto}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>Trimestre actual</div>
            </div>
          </div>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1040 }}>
        {datos.trimestres.map((t) => {
          const estilo = ESTILO_ESTADO[t.estado];
          const etapas = etapasProgresoTrimestre(t.estado);
          const acciones = accionesDisponiblesTrimestre(t.estado, t.libreta_publicada);
          const panelAbierto = panelActivo?.trimestreId === t.id ? panelActivo.accion : null;
          const textos = panelAbierto ? textosPanel(t, panelAbierto) : null;

          return (
            <section
              key={t.id}
              style={{
                backgroundColor: "var(--bg-surface)",
                border: `1px solid ${t.estado !== "Cerrado" ? "var(--color-primary)" : "var(--border-card)"}`,
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 18 }}>
                      {t.nombre}
                    </h2>
                    <span
                      style={{
                        height: 22,
                        padding: "0 9px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: estilo.bg,
                        color: estilo.fg,
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {t.estado}
                    </span>
                    {t.libreta_publicada ? (
                      <span
                        style={{
                          height: 22,
                          padding: "0 9px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#EFF6FF",
                          color: "#1D4ED8",
                          fontFamily: "var(--font-button)",
                          fontWeight: 600,
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FileCheck size={12} />
                        Libreta publicada
                      </span>
                    ) : null}
                    {t.reabierto ? (
                      <span
                        style={{
                          height: 22,
                          padding: "0 9px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#FFFBEB",
                          color: "#B45309",
                          fontFamily: "var(--font-button)",
                          fontWeight: 600,
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Reabierto
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {t.fechas}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {acciones.map((acc) => {
                    const Icono = iconoAccion(acc.tipo);
                    return (
                      <button
                        key={acc.tipo}
                        type="button"
                        onClick={() => abrirPanel(t.id, acc.tipo)}
                        style={{
                          height: 38,
                          padding: "0 16px",
                          border: "1px solid var(--color-primary)",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: acc.esPrimaria
                            ? "var(--color-primary)"
                            : "var(--bg-surface)",
                          color: acc.esPrimaria ? "#FFFFFF" : "var(--color-primary)",
                          fontFamily: "var(--font-button)",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icono size={14} />
                        {acc.etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 6,
                  padding: "0 20px 18px",
                }}
              >
                {etapas.map((etapa) => (
                  <div key={etapa.estado} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span
                      style={{
                        height: 6,
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: etapa.actual
                          ? "var(--color-primary)"
                          : etapa.completada
                            ? "#1E293B"
                            : "#E2E8F0",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: etapa.actual ? 600 : 400,
                        color: etapa.actual
                          ? "var(--color-primary)"
                          : etapa.completada
                            ? "var(--text-main)"
                            : "var(--text-muted)",
                      }}
                    >
                      {etapa.etiqueta}
                    </span>
                  </div>
                ))}
              </div>

              {panelAbierto && textos ? (
                <div
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-subtle)",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{textos.titulo}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {textos.cuerpo}
                  </div>
                  {textos.advertencia ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 12,
                        backgroundColor: "#FFFBEB",
                        color: "#92400E",
                        fontSize: 13,
                      }}
                    >
                      <AlertTriangle size={16} />
                      {textos.advertencia}
                    </div>
                  ) : null}

                  {panelAbierto === "reabrir" ? (
                    <>
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Motivo (obligatorio)
                        <textarea
                          rows={3}
                          value={motivo}
                          onChange={(e) => {
                            setMotivo(e.target.value);
                            setErrorPanel("");
                          }}
                          placeholder="Ej. Corrección del nivel de 2 estudiantes de 4.° C en Matemática por error de registro"
                          style={{
                            border: "1px solid var(--border-input)",
                            borderRadius: 12,
                            padding: "10px 12px",
                            fontSize: 14,
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-main)",
                          }}
                        />
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={actaEmitida}
                          onChange={(e) => {
                            setActaEmitida(e.target.checked);
                            setErrorPanel("");
                          }}
                        />
                        El Acta Oficial ya fue emitida en el SIAGIE
                      </label>
                      {actaEmitida ? (
                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          N.° de documento de autorización de la UGEL
                          <input
                            value={documentoUgel}
                            onChange={(e) => {
                              setDocumentoUgel(e.target.value);
                              setErrorPanel("");
                            }}
                            placeholder="Ej. Oficio N.° 0345-2026-UGEL-HGA"
                            style={{
                              height: 40,
                              border: "1px solid var(--border-input)",
                              borderRadius: 12,
                              padding: "0 12px",
                              fontSize: 14,
                              backgroundColor: "var(--bg-surface)",
                              color: "var(--text-main)",
                            }}
                          />
                        </label>
                      ) : null}
                    </>
                  ) : null}

                  {errorPanel ? (
                    <div
                      role="alert"
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        fontSize: 13,
                        color: "var(--status-danger-fg)",
                      }}
                    >
                      <AlertCircle size={16} />
                      {errorPanel}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setPanelActivo(null)}
                      style={{
                        height: 36,
                        padding: "0 14px",
                        border: "1px solid var(--color-primary)",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => void confirmarPanel()}
                      style={{
                        height: 36,
                        padding: "0 16px",
                        border: "none",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "var(--color-primary)",
                        color: "#FFFFFF",
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Check size={14} />
                      {textos.confirmar}
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
