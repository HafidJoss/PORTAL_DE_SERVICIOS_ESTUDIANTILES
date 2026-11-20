import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Lock, LockOpen, Pencil, Search, UserPlus } from "lucide-react";

import {
  getListarCuentasPersonasApiV1PersonasCuentasGetQueryKey,
  useCambiarEstadoCuentaPersonaApiV1PersonasCuentasCuentaIdEstadoPatch,
  useCrearCuentaPersonaApiV1PersonasCuentasPost,
  useEditarCuentaPersonaApiV1PersonasCuentasCuentaIdPatch,
  useListarCuentasPersonasApiV1PersonasCuentasGet,
  useRestablecerCodigoCuentaApiV1PersonasCuentasCuentaIdRestablecerCodigoPost,
} from "../../../api/generated/personas/personas";
import type {
  CuentaPersonaOut,
  CuentaPersonaOutEstado,
  CuentaPersonaOutRol,
} from "../../../api/generated/model";
import { ProblemDetailError } from "../../../api/clienteHttp";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";

type PestanaEstado = "todas" | "activa" | "pendiente" | "bloqueada";

const ROLES_FILTRO: readonly string[] = [
  "Todos",
  "Administrador",
  "Dirección",
  "Secretaría Académica",
  "Docente",
  "Auxiliar",
  "Estudiante",
  "Apoderado",
];

const ROLES_CREACION: readonly CuentaPersonaOutRol[] = [
  "Dirección",
  "Secretaría Académica",
  "Docente",
  "Auxiliar",
  "Estudiante",
  "Apoderado",
];

const ESTILO_ESTADO: Record<CuentaPersonaOutEstado, { label: string; bg: string; fg: string }> = {
  activa: { label: "Activa", bg: "#ECFDF5", fg: "#047857" },
  pendiente: { label: "Pendiente de activación", bg: "#FFFBEB", fg: "#B45309" },
  bloqueada: { label: "Bloqueada", bg: "#FEF2F2", fg: "#991B1B" },
};

const ESTILO_ROL: Record<CuentaPersonaOutRol, { bg: string; fg: string }> = {
  Administrador: { bg: "#1E293B", fg: "#FFFFFF" },
  Dirección: { bg: "#EFF6FF", fg: "#1D4ED8" },
  "Secretaría Académica": { bg: "#F5F3FF", fg: "#6D28D9" },
  Docente: { bg: "#FEF2F2", fg: "#C81E1E" },
  Auxiliar: { bg: "#FFFBEB", fg: "#B45309" },
  Estudiante: { bg: "#ECFDF5", fg: "#047857" },
  Apoderado: { bg: "#F1F5F9", fg: "#334155" },
};

const TITULO_PESTANA: Record<PestanaEstado, string> = {
  todas: "Cuentas y roles",
  activa: "Cuentas activas",
  pendiente: "Pendientes de activación",
  bloqueada: "Cuentas bloqueadas",
};

export function CuentasAdminVista() {
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<PestanaEstado>("todas");
  const [rolFiltro, setRolFiltro] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [dniForm, setDniForm] = useState("");
  const [rolForm, setRolForm] = useState<CuentaPersonaOutRol>("Apoderado");
  const [errorForm, setErrorForm] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const consulta = useListarCuentasPersonasApiV1PersonasCuentasGet({
    estado: estadoFiltro,
    rol: rolFiltro,
    q: busqueda,
  });

  const crearMutation = useCrearCuentaPersonaApiV1PersonasCuentasPost();
  const editarMutation = useEditarCuentaPersonaApiV1PersonasCuentasCuentaIdPatch();
  const restablecerMutation =
    useRestablecerCodigoCuentaApiV1PersonasCuentasCuentaIdRestablecerCodigoPost();
  const estadoMutation = useCambiarEstadoCuentaPersonaApiV1PersonasCuentasCuentaIdEstadoPatch();

  const datos = consulta.data?.status === 200 ? consulta.data.data : null;

  async function refrescar() {
    await queryClient.invalidateQueries({
      queryKey: getListarCuentasPersonasApiV1PersonasCuentasGetQueryKey({
        estado: estadoFiltro,
        rol: rolFiltro,
        q: busqueda,
      }),
    });
  }

  function abrirCrear() {
    setEditandoId(null);
    setNombreForm("");
    setDniForm("");
    setRolForm("Apoderado");
    setErrorForm("");
    setFormAbierto(true);
  }

  function abrirEditar(c: CuentaPersonaOut) {
    setEditandoId(c.id);
    setNombreForm(c.nombre);
    setDniForm(c.dni);
    setRolForm(c.rol);
    setErrorForm("");
    setFormAbierto(true);
  }

  async function manejarGuardar() {
    setErrorForm("");
    setMensajeExito("");
    if (nombreForm.trim().split(/\s+/).length < 2) {
      setErrorForm("Escribe nombres y apellidos.");
      return;
    }
    if (!/^\d{8}$/.test(dniForm.trim())) {
      setErrorForm("El DNI debe tener 8 dígitos.");
      return;
    }

    try {
      if (editandoId) {
        await editarMutation.mutateAsync({
          cuentaId: editandoId,
          data: { nombre: nombreForm.trim(), dni: dniForm.trim(), rol: rolForm },
        });
        setMensajeExito(`Cuenta de ${nombreForm.trim()} actualizada.`);
      } else {
        const resp = await crearMutation.mutateAsync({
          data: { nombre: nombreForm.trim(), dni: dniForm.trim(), rol: rolForm },
        });
        if (resp.status === 201) {
          setMensajeExito(resp.data.mensaje);
        }
      }
      setFormAbierto(false);
      setEditandoId(null);
      await refrescar();
    } catch (err) {
      setErrorForm(
        err instanceof ProblemDetailError ? err.detail || err.title : "No se pudo guardar la cuenta.",
      );
    }
  }

  async function manejarRestablecer(c: CuentaPersonaOut) {
    setMensajeExito("");
    const resp = await restablecerMutation.mutateAsync({ cuentaId: c.id });
    if (resp.status === 200) {
      setMensajeExito(resp.data.mensaje);
    }
    await refrescar();
  }

  async function manejarCambiarEstado(c: CuentaPersonaOut) {
    const siguiente = c.estado === "bloqueada" ? "activa" : "bloqueada";
    await estadoMutation.mutateAsync({
      cuentaId: c.id,
      data: { estado: siguiente },
    });
    setMensajeExito(
      siguiente === "bloqueada"
        ? `Cuenta de ${c.nombre} bloqueada.`
        : `Cuenta de ${c.nombre} desbloqueada.`,
    );
    await refrescar();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid var(--border-subtle)",
          overflowX: "auto",
        }}
      >
        {(
          [
            ["todas", "Todas", datos?.total ?? 0],
            ["activa", "Activas", datos?.activas ?? 0],
            ["pendiente", "Pendientes", datos?.pendientes ?? 0],
            ["bloqueada", "Bloqueadas", datos?.bloqueadas ?? 0],
          ] as const
        ).map(([id, label, count]) => {
          const on = estadoFiltro === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setEstadoFiltro(id)}
              style={{
                height: 44,
                padding: "0 14px",
                background: "none",
                border: "none",
                borderBottom: `3px solid ${on ? "var(--color-primary)" : "transparent"}`,
                color: on ? "var(--color-primary)" : "var(--text-muted)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              {label}
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--bg-subtle)",
                  fontSize: 11,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <BannerPortada
        titulo={TITULO_PESTANA[estadoFiltro]}
        subtitulo="El usuario es el DNI. Cada cuenta se activa con un código de un solo uso; solo el Administrador restablece contraseñas."
        acciones={
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
              {datos?.cuentas.length ?? 0}
            </div>
            <div style={{ fontSize: 12, color: "#CBD5E1" }}>Cuentas</div>
          </div>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ROLES_FILTRO.map((r) => {
            const on = rolFiltro === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRolFiltro(r)}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${on ? "var(--color-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: on ? "var(--color-primary-light)" : "var(--bg-surface)",
                  color: on ? "var(--color-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              aria-label="Buscar por nombre o DNI"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o DNI"
              style={{
                height: 38,
                width: "100%",
                border: "1px solid var(--border-input)",
                borderRadius: "var(--radius-pill)",
                padding: "0 14px 0 36px",
                fontSize: 13,
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-main)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={abrirCrear}
            style={{
              height: 38,
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
              gap: 8,
            }}
          >
            <UserPlus size={15} />
            Nueva cuenta
          </button>
        </div>
      </div>

      {mensajeExito ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            backgroundColor: "#ECFDF5",
            color: "#047857",
            fontSize: 13,
          }}
        >
          {mensajeExito}
        </div>
      ) : null}

      {formAbierto ? (
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-primary)",
            borderRadius: "var(--radius-xl)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 16 }}>
            {editandoId ? "Editar cuenta" : "Nueva cuenta"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              Nombres y apellidos
              <input
                value={nombreForm}
                onChange={(e) => {
                  setNombreForm(e.target.value);
                  setErrorForm("");
                }}
                placeholder="Ej. Juana Ccori Flores"
                style={{
                  height: 38,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 12px",
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              DNI
              <input
                value={dniForm}
                maxLength={8}
                inputMode="numeric"
                onChange={(e) => {
                  setDniForm(e.target.value.replace(/\D/g, ""));
                  setErrorForm("");
                }}
                placeholder="8 dígitos"
                style={{
                  height: 38,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 12px",
                }}
              />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
            <span>Rol</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ROLES_CREACION.map((r) => {
                const on = rolForm === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRolForm(r)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: "var(--radius-pill)",
                      border: `1px solid ${on ? "var(--color-primary)" : "var(--border-subtle)"}`,
                      backgroundColor: on ? "var(--color-primary-light)" : "var(--bg-surface)",
                      color: on ? "var(--color-primary)" : "var(--text-secondary)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {errorForm ? (
            <div role="alert" style={{ color: "#991B1B", fontSize: 13 }}>
              {errorForm}
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setFormAbierto(false);
                setEditandoId(null);
              }}
              style={{
                height: 36,
                padding: "0 14px",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--color-primary)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={crearMutation.isPending || editarMutation.isPending}
              onClick={() => void manejarGuardar()}
              style={{
                height: 36,
                padding: "0 16px",
                border: "none",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {editandoId ? "Guardar cambios" : "Crear y generar código"}
            </button>
          </div>
        </section>
      ) : null}

      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)", textAlign: "left" }}>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Usuario</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Rol</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Estado</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Último acceso</th>
              <th style={{ padding: "10px 14px", fontSize: 11, textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos?.cuentas.map((c) => {
              const est = ESTILO_ESTADO[c.estado];
              const rolSt = ESTILO_ROL[c.rol];
              const protegida = c.rol === "Administrador";
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      DNI {c.dni}
                      {c.extra}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        height: 22,
                        padding: "0 9px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: rolSt.bg,
                        color: rolSt.fg,
                        fontSize: 12,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {c.rol}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        height: 22,
                        padding: "0 9px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: est.bg,
                        color: est.fg,
                        fontSize: 12,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {est.label}
                    </span>
                    {c.codigo_activacion ? (
                      <div style={{ marginTop: 4, fontSize: 12 }}>
                        Código:{" "}
                        <strong
                          style={{
                            backgroundColor: "#FFFBEB",
                            padding: "2px 6px",
                            borderRadius: 6,
                          }}
                        >
                          {c.codigo_activacion}
                        </strong>
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-muted)" }}>
                    {c.ultimo_acceso}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    {!protegida ? (
                      <div style={{ display: "inline-flex", gap: 4 }}>
                        <button
                          type="button"
                          aria-label={`Editar a ${c.nombre}`}
                          title="Editar cuenta"
                          onClick={() => abrirEditar(c)}
                          style={{
                            width: 34,
                            height: 34,
                            border: "none",
                            borderRadius: "50%",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Restablecer código de ${c.nombre}`}
                          title={
                            c.estado === "pendiente"
                              ? "Generar nuevo código de activación"
                              : "Restablecer contraseña"
                          }
                          onClick={() => void manejarRestablecer(c)}
                          style={{
                            width: 34,
                            height: 34,
                            border: "none",
                            borderRadius: "50%",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={
                            c.estado === "bloqueada"
                              ? `Desbloquear a ${c.nombre}`
                              : `Bloquear a ${c.nombre}`
                          }
                          title={c.estado === "bloqueada" ? "Desbloquear" : "Bloquear"}
                          onClick={() => void manejarCambiarEstado(c)}
                          style={{
                            width: 34,
                            height: 34,
                            border: "none",
                            borderRadius: "50%",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          {c.estado === "bloqueada" ? <LockOpen size={15} /> : <Lock size={15} />}
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {datos && datos.cuentas.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
            Sin resultados.
          </div>
        ) : null}
      </section>
    </div>
  );
}
