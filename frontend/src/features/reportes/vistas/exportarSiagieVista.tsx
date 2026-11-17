import { ExternalLink, FileSpreadsheet, FileText, Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { UrlDescargaOut, UsuarioSesionOut } from "../../../api/generated/model";
import {
  useGenerarDescargaSiagieDocenteApiV1ReportesDocentesDocenteIdSiagieSeccionIdDescargaPost,
  useObtenerResumenSiagieDocenteApiV1ReportesDocentesDocenteIdSiagieGet,
} from "../../../api/generated/reportes/reportes";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { resolverDocenteId } from "../../../shared/utilidades/sesion";
import {
  esSeccionListaSiagie,
  obtenerEtiquetaEstadoSiagie,
  obtenerNotaTrimestreSiagie,
} from "../utilidades/estadoSiagie";

export function ExportarSiagieVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const navigate = useNavigate();
  const [trimestreId, setTrimestreId] = useState<1 | 2 | 3>(3);
  const [descargaActiva, setDescargaActiva] = useState<UrlDescargaOut | null>(null);
  const [errorDescarga, setErrorDescarga] = useState("");

  const docenteId = resolverDocenteId(usuario);
  const consulta = useObtenerResumenSiagieDocenteApiV1ReportesDocentesDocenteIdSiagieGet(
    docenteId,
    { query: { enabled: Boolean(docenteId) } },
  );
  const mutDescarga =
    useGenerarDescargaSiagieDocenteApiV1ReportesDocentesDocenteIdSiagieSeccionIdDescargaPost();

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
          Cargando estado de exportación SIAGIE...
        </p>
      </Tarjeta>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar Exportar al SIAGIE"
        descripcion="Ocurrió un problema al consultar las secciones listas para exportar."
        accion={
          <Boton type="button" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        }
      />
    );
  }

  const datos = consulta.data.data;
  const trimestreActivo =
    datos.trimestres.find((t) => t.trimestre_id === trimestreId) ??
    datos.trimestres[datos.trimestres.length - 1];

  async function manejarDescarga(
    seccionId: string,
    formato: "excel_siagie" | "acta_preliminar",
  ) {
    setErrorDescarga("");
    try {
      const resp = await mutDescarga.mutateAsync({
        docenteId,
        seccionId,
        data: { trimestre_id: trimestreActivo.trimestre_id, formato },
      });
      if (resp.status === 200) {
        setDescargaActiva(resp.data);
      } else {
        setErrorDescarga("La sección aún tiene competencias sin confirmar.");
      }
    } catch (err) {
      const detalle =
        err instanceof Error && err.message
          ? err.message
          : "No se pudo generar el enlace temporal de descarga.";
      setErrorDescarga(detalle);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <BannerPortada
        titulo="Exportar al SIAGIE"
        subtitulo="El portal prepara tu plantilla Excel del SIAGIE y actas preliminares a partir de niveles confirmados."
        acciones={
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.14)",
              borderRadius: "var(--radius-pill)",
              padding: 4,
              gap: 4,
            }}
          >
            {datos.trimestres.map((t) => {
              const activo = t.trimestre_id === trimestreActivo?.trimestre_id;
              return (
                <button
                  key={t.trimestre_id}
                  type="button"
                  onClick={() => {
                    setTrimestreId(t.trimestre_id);
                    setDescargaActiva(null);
                    setErrorDescarga("");
                  }}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    border: "none",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: activo ? "#FFFFFF" : "transparent",
                    color: activo ? "var(--color-primary)" : "#E2E8F0",
                    fontFamily: "var(--font-button)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t.nombre}
                </button>
              );
            })}
          </div>
        }
      />

      {errorDescarga ? (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-danger-bg)",
            color: "var(--status-danger)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {errorDescarga}
        </div>
      ) : null}

      {descargaActiva ? (
        <Tarjeta
          style={{
            borderColor: "var(--status-success-fg)",
            backgroundColor: "var(--status-success-bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div role="status">
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--status-success-fg)" }}>
              Descarga lista: {descargaActiva.nombre_archivo}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Enlace temporal firmado válido por {Math.round(descargaActiva.expira_en_segundos / 60)} min (RC05).
            </div>
          </div>
          <a
            href={descargaActiva.url_firmada}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Descargar archivo <ExternalLink size={14} />
          </a>
        </Tarjeta>
      ) : null}

      <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
        {(trimestreActivo?.secciones ?? []).map((sec) => {
          const lista = esSeccionListaSiagie(sec);
          const estadoEtiqueta = obtenerEtiquetaEstadoSiagie(sec);

          return (
            <div
              key={sec.seccion_id}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {sec.seccion_id}
              </span>

              <div style={{ flex: "1 1 210px", minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {datos.asignatura} · {sec.nombre}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {sec.estudiantes_total} estudiantes · {sec.competencias_confirmadas}/
                  {sec.competencias_total} competencias confirmadas
                </div>
              </div>

              <span
                style={{
                  height: 24,
                  padding: "0 10px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: lista ? "var(--status-success-bg)" : "var(--status-warning-bg)",
                  color: lista ? "var(--status-success-fg)" : "var(--status-warning-fg)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {estadoEtiqueta}
              </span>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {lista ? (
                  <>
                    <Boton
                      type="button"
                      size="sm"
                      aria-label={`Excel SIAGIE · ${sec.nombre}`}
                      disabled={mutDescarga.isPending}
                      onClick={() => void manejarDescarga(sec.seccion_id, "excel_siagie")}
                    >
                      <FileSpreadsheet size={14} /> Excel SIAGIE
                    </Boton>
                    <Boton
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Acta preliminar · ${sec.nombre}`}
                      disabled={mutDescarga.isPending}
                      onClick={() => void manejarDescarga(sec.seccion_id, "acta_preliminar")}
                    >
                      <FileText size={14} /> Acta preliminar
                    </Boton>
                  </>
                ) : (
                  <Boton
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Completar cierre · ${sec.nombre}`}
                    onClick={() => navigate(`/cursos/${sec.seccion_id}?tab=cierre`)}
                  >
                    Ir a cierre
                  </Boton>
                )}
              </div>
            </div>
          );
        })}

        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--bg-subtle)",
            fontSize: 12,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Info size={14} />
          <span>{obtenerNotaTrimestreSiagie(Boolean(trimestreActivo?.cerrado))}</span>
        </div>
      </Tarjeta>
    </div>
  );
}
