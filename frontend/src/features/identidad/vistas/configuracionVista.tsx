import { useState, type CSSProperties, type FormEvent } from "react";
import { AlertCircle, Award, CalendarCheck, CheckCircle2, ClipboardList, Info, MessageSquare } from "lucide-react";

import { useCambiarContrasenaApiV1IdentidadCambiarContrasenaPost } from "../../../api/generated/identidad/identidad";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { ProblemDetailError } from "../../../api/clienteHttp";
import { useTema, type TemaPortal } from "../../../app/proveedorTema";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  guardarPreferenciasAvisos,
  leerPreferenciasAvisos,
  type PreferenciasAvisos,
} from "../utilidades/preferenciasIdentidad";
import { validarCambioContrasena } from "../utilidades/validaciones";

const INPUT_STYLE: CSSProperties = {
  height: 40,
  border: "1px solid var(--border-input)",
  borderRadius: "var(--radius-lg)",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-main)",
};

const AVISOS_CONFIG = [
  {
    id: "calif" as const,
    label: "Calificativos publicados",
    sub: "Cuando un docente publica un nivel de logro",
    Icon: Award,
    bg: "var(--status-success-bg)",
    fg: "var(--status-success-fg)",
  },
  {
    id: "tareas" as const,
    label: "Tareas y recordatorios",
    sub: "Nuevos trabajos y fechas de entrega",
    Icon: ClipboardList,
    bg: "var(--color-primary-light)",
    fg: "var(--color-primary)",
  },
  {
    id: "asist" as const,
    label: "Asistencia",
    sub: "Tardanzas y faltas registradas",
    Icon: CalendarCheck,
    bg: "var(--bg-subtle)",
    fg: "var(--text-main)",
  },
  {
    id: "obs" as const,
    label: "Observaciones",
    sub: "Comentarios de tus docentes y tutora",
    Icon: MessageSquare,
    bg: "var(--status-info-bg)",
    fg: "var(--status-info-fg)",
  },
];

const AVISOS_DOCENTE = [
  {
    id: "calif" as const,
    label: "Calificativos pendientes",
    sub: "Actividades publicadas sin calificar",
    Icon: Award,
    bg: "var(--color-primary-light)",
    fg: "var(--color-primary)",
  },
  {
    id: "tareas" as const,
    label: "Fechas de cierre",
    sub: "Cierre preliminar y cierre del trimestre",
    Icon: ClipboardList,
    bg: "var(--status-warning-bg)",
    fg: "var(--status-warning-fg)",
  },
  {
    id: "asist" as const,
    label: "Asistencia de mis secciones",
    sub: "Resumen diario del auxiliar",
    Icon: CalendarCheck,
    bg: "var(--bg-subtle)",
    fg: "var(--text-main)",
  },
  {
    id: "obs" as const,
    label: "Comunicados de Dirección",
    sub: "Avisos institucionales",
    Icon: MessageSquare,
    bg: "var(--status-info-bg)",
    fg: "var(--status-info-fg)",
  },
];

export function ConfiguracionVista({ usuario }: { usuario: UsuarioSesionOut }) {
  const { theme, setTheme } = useTema();
  const [avisos, setAvisos] = useState<PreferenciasAvisos>(leerPreferenciasAvisos);
  const [pwActual, setPwActual] = useState("");
  const [pwNueva, setPwNueva] = useState("");
  const [pwConfirmar, setPwConfirmar] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwExito, setPwExito] = useState("");

  const cambiarPassMutation = useCambiarContrasenaApiV1IdentidadCambiarContrasenaPost();

  const esDocente = usuario.rol === "Docente";
  const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.trim();
  const subtitulo = esDocente
    ? [nombreCompleto, usuario.rol, usuario.especialidad].filter(Boolean).join(" · ")
    : usuario.grado_seccion
      ? `${nombreCompleto} · ${usuario.rol} · ${usuario.grado_seccion}`
      : `${nombreCompleto} · ${usuario.rol}`;

  const esApoderado = usuario.rol === "Apoderado";
  const hijosVinculados = usuario.hijos_vinculados ?? [];

  const datosPersonales = esDocente
    ? [
        ["Nombres", usuario.nombres],
        ["Apellidos", usuario.apellidos],
        ["DNI", usuario.dni],
        ["Especialidad", usuario.especialidad ?? "—"],
        ["Nivel", usuario.nivel_educativo ?? "—"],
        ["Secciones a cargo", usuario.secciones_a_cargo?.join(", ") || "—"],
      ]
    : esApoderado
      ? [
          ["Nombres", usuario.nombres],
          ["Apellidos", usuario.apellidos],
          ["DNI", usuario.dni],
          ["Perfil", "Apoderado / Familia"],
          ["Menores vinculados", `${hijosVinculados.length}`],
        ]
      : [
          ["Nombres", usuario.nombres],
          ["Apellidos", usuario.apellidos],
          ["DNI", usuario.dni],
          ["Código de estudiante", usuario.codigo_estudiante ?? "—"],
          ["Grado y sección", usuario.grado_seccion ?? "—"],
          ["Tutora / Tutor", usuario.tutor ?? "—"],
        ];

  const avisosLista = esDocente ? AVISOS_DOCENTE : AVISOS_CONFIG;

  function alternarAviso(clave: keyof PreferenciasAvisos) {
    const siguiente = { ...avisos, [clave]: !avisos[clave] };
    setAvisos(siguiente);
    guardarPreferenciasAvisos(siguiente);
  }

  async function manejarCambioPassword(e: FormEvent) {
    e.preventDefault();
    setPwExito("");
    const errorLocal = validarCambioContrasena(pwActual, pwNueva, pwConfirmar);
    if (errorLocal) {
      setPwError(errorLocal);
      return;
    }

    setPwError("");
    try {
      const resp = await cambiarPassMutation.mutateAsync({
        data: { contrasena_actual: pwActual, nueva_contrasena: pwNueva },
      });
      setPwActual("");
      setPwNueva("");
      setPwConfirmar("");
      setPwExito(
        resp.status === 200
          ? resp.data.mensaje
          : "Contraseña actualizada correctamente.",
      );
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setPwError(err.detail || err.title);
      } else {
        setPwError("No se pudo actualizar la contraseña.");
      }
    }
  }

  const opcionesTema: { id: TemaPortal; label: string; bg: string; side: string }[] = [
    { id: "claro", label: "Claro", bg: "#FFFFFF", side: "#F8FAFC" },
    { id: "oscuro", label: "Oscuro", bg: "#0F172A", side: "#1E293B" },
  ];

  return (
    <>
      <BannerPortada titulo="Configuración" subtitulo={subtitulo} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Tarjeta>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 16,
                margin: "0 0 16px",
              }}
            >
              Perfil institucional
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <AvatarIniciales
                nombre={nombreCompleto}
                iniciales={`${usuario.nombres.trim()[0] ?? ""}${usuario.apellidos.trim()[0] ?? ""}`.toUpperCase()}
                size={76}
                inverted
              />
              <div style={{ flex: "1 1 200px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Tu avatar institucional se genera automáticamente con tus iniciales para proteger la privacidad en el portal.
              </div>
            </div>
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                }}
              >
                Datos personales
              </h2>
            </div>
            <div>
              {datosPersonales.map(([etiqueta, valor]) => (
                <div
                  key={etiqueta}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    minHeight: 48,
                    alignItems: "center",
                    padding: "8px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {etiqueta}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 500, textAlign: "right" }}>
                    {valor}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: "12px 20px",
                fontSize: 12,
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-canvas)",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Para corregir tus datos, acércate a Secretaría Académica.</span>
            </div>
          </Tarjeta>

          {esApoderado ? (
            <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 16,
                    margin: 0,
                  }}
                >
                  Menores vinculados
                </h2>
              </div>
              {hijosVinculados.length === 0 ? (
                <div style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>
                  No hay estudiantes vinculados registrados en tu cuenta.
                </div>
              ) : (
                <div>
                  {hijosVinculados.map((hijo) => {
                    const nombreHijo = `${hijo.nombres} ${hijo.apellidos}`.trim();
                    return (
                      <div
                        key={hijo.estudiante_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 20px",
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                      >
                        <AvatarIniciales
                          nombre={nombreHijo}
                          iniciales={hijo.iniciales}
                          size={38}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                            {nombreHijo}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {hijo.grado_seccion}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Código {hijo.codigo} · {hijo.tutor}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Tarjeta>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Tarjeta>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 16,
                margin: "0 0 14px",
              }}
            >
              Apariencia
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              {opcionesTema.map((opcion) => {
                const activo = theme === opcion.id;
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => setTheme(opcion.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      padding: 10,
                      border: `2px solid ${activo ? "var(--color-primary)" : "var(--border-subtle)"}`,
                      borderRadius: 16,
                      backgroundColor: "var(--bg-surface)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        height: 60,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: opcion.bg,
                      }}
                    >
                      <span style={{ width: "30%", backgroundColor: opcion.side }} />
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--text-main)",
                      }}
                    >
                      {opcion.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                }}
              >
                Avisos en el portal
              </h2>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Elige qué novedades se resaltan en tu inicio.
              </div>
            </div>
            {avisosLista.map(({ id, label, sub, Icon, bg, fg }) => {
              const encendido = avisos[id];
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    minHeight: 60,
                    padding: "10px 20px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      backgroundColor: bg,
                      color: fg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>
                      {label}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)" }}>
                      {sub}
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={encendido}
                    aria-label={label}
                    onClick={() => alternarAviso(id)}
                    style={{
                      width: 46,
                      height: 26,
                      border: "none",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: encendido ? "var(--color-primary)" : "var(--border-input)",
                      padding: 3,
                      cursor: "pointer",
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        marginLeft: encendido ? 20 : 0,
                        transition: "margin .15s",
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                }}
              >
                Cambiar contraseña
              </h2>
            </div>
            <form
              onSubmit={manejarCambioPassword}
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
              noValidate
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500 }}>
                Contraseña actual
                <input
                  type="password"
                  value={pwActual}
                  onChange={(e) => {
                    setPwActual(e.target.value);
                    setPwError("");
                    setPwExito("");
                  }}
                  style={INPUT_STYLE}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500 }}>
                Nueva contraseña
                <input
                  type="password"
                  value={pwNueva}
                  placeholder="Mínimo 8 caracteres"
                  onChange={(e) => {
                    setPwNueva(e.target.value);
                    setPwError("");
                    setPwExito("");
                  }}
                  style={INPUT_STYLE}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500 }}>
                Confirmar contraseña
                <input
                  type="password"
                  value={pwConfirmar}
                  onChange={(e) => {
                    setPwConfirmar(e.target.value);
                    setPwError("");
                    setPwExito("");
                  }}
                  style={INPUT_STYLE}
                />
              </label>

              {pwError ? (
                <div
                  role="alert"
                  style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--status-danger)" }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{pwError}</span>
                </div>
              ) : null}

              {pwExito ? (
                <div
                  role="status"
                  style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--status-success-fg)" }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{pwExito}</span>
                </div>
              ) : null}

              <Boton
                type="submit"
                disabled={cambiarPassMutation.isPending}
                style={{ alignSelf: "flex-start" }}
              >
                {cambiarPassMutation.isPending ? "Guardando..." : "Guardar contraseña"}
              </Boton>
            </form>
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
