import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  FileText,
  Home,
  Library,
  LogOut,
  Mail,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

import { useTheme } from "../../app/ThemeProvider";
import { useEsMovil } from "../hooks/useEsMovil";
import { AvatarIniciales } from "./AvatarIniciales";

interface PortalLayoutProps {
  usuarioNombre: string;
  usuarioDetalle: string;
  onLogout?: () => void;
  cerrandoSesion?: boolean;
  children: ReactNode;
}

const DESKTOP_NAV = [
  { to: "/inicio", label: "Inicio", Icon: Home },
  { to: "/cursos", label: "Cursos", Icon: Library },
  { to: "/calificaciones", label: "Calificaciones", Icon: BookOpenCheck },
  { to: "/trabajos", label: "Trabajos y pendientes", Icon: ClipboardList },
  { to: "/asistencia", label: "Asistencia", Icon: CalendarCheck },
  { to: "/mensajes", label: "Mensajes", Icon: Mail },
  { to: "/libreta", label: "Libreta", Icon: FileText },
] as const;

const MOBILE_NAV = [
  { to: "/inicio", label: "Inicio", Icon: Home },
  { to: "/cursos", label: "Cursos", Icon: Library },
  { to: "/calificaciones", label: "Notas", Icon: BookOpenCheck },
  { to: "/trabajos", label: "Tareas", Icon: ClipboardList },
  { to: "/asistencia", label: "Asistencia", Icon: CalendarCheck },
  { to: "/mensajes", label: "Mensajes", Icon: Mail },
] as const;

export function PortalLayout({
  usuarioNombre,
  usuarioDetalle,
  onLogout,
  cerrandoSesion = false,
  children,
}: PortalLayoutProps) {
  const esMovil = useEsMovil();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: esMovil ? "column" : "row",
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-main)",
        overflowX: "hidden",
      }}
    >
      {!esMovil ? (
        <aside
          style={{
            width: 264,
            flexShrink: 0,
            backgroundColor: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 14px",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}>
            <img
              src="/escudo.png"
              alt="Escudo G.U.E. Mariscal Cáceres"
              style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
              >
                Mariscal Cáceres
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Portal Estudiantil
              </div>
            </div>
          </div>

          <nav
            aria-label="Navegación principal"
            style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
          >
            {DESKTOP_NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                })}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <NavLink
              to="/configuracion"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 13,
                backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
              })}
            >
              <Settings size={17} />
              <span>Configuración</span>
            </NavLink>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema visual"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-main)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {theme === "oscuro" ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === "oscuro" ? "Tema claro" : "Tema oscuro"}</span>
            </button>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                disabled={cerrandoSesion}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: cerrandoSesion ? "wait" : "pointer",
                }}
              >
                <LogOut size={17} />
                <span>{cerrandoSesion ? "Saliendo..." : "Cerrar sesión"}</span>
              </button>
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 6px",
              }}
            >
              <AvatarIniciales nombre={usuarioNombre} size={36} inverted />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {usuarioNombre}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {usuarioDetalle}
                </div>
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <header
          style={{
            height: 56,
            padding: "0 16px",
            backgroundColor: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img
              src="/escudo.png"
              alt="Escudo G.U.E. Mariscal Cáceres"
              style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Portal Estudiantil
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema visual"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-main)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {theme === "oscuro" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <AvatarIniciales nombre={usuarioNombre} size={34} inverted />
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                disabled={cerrandoSesion}
                aria-label="Cerrar sesión"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: cerrandoSesion ? "wait" : "pointer",
                }}
              >
                <LogOut size={18} />
              </button>
            ) : null}
          </div>
        </header>
      )}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: esMovil ? "20px 16px 84px" : "36px 48px 56px",
          maxWidth: 1240,
        }}
      >
        {children}
      </main>

      {esMovil ? (
        <nav
          aria-label="Navegación móvil"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: 64,
            backgroundColor: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            alignItems: "center",
            padding: "0 4px",
            zIndex: 20,
          }}
        >
          {MOBILE_NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                textDecoration: "none",
                fontSize: 10,
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                color: isActive ? "var(--color-primary)" : "var(--text-muted)",
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
