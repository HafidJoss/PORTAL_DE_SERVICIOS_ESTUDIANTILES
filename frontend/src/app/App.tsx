import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useCerrarSesionApiV1IdentidadLogoutPost,
  useObtenerSesionApiV1IdentidadSesionGet,
} from "../api/generated/identidad/identidad";
import type { UsuarioSesionOut } from "../api/generated/model";
import { setUnauthorizedHandler } from "../api/http";
import { AsistenciaPage } from "../features/asistencia/AsistenciaPage";
import { CalificacionesPage } from "../features/evaluacion/CalificacionesPage";
import { MensajesPage } from "../features/evaluacion/MensajesPage";
import { TrabajosPage } from "../features/evaluacion/TrabajosPage";
import { ConfiguracionPage } from "../features/identidad/pages/ConfiguracionPage";
import { IngresoPage } from "../features/identidad/pages/IngresoPage";
import { LibretaPage } from "../features/reportes/LibretaPage";
import { CursoDetallePage } from "../features/seguimiento/CursoDetallePage";
import { CursosPage } from "../features/seguimiento/CursosPage";
import { InicioPage } from "../features/seguimiento/InicioPage";
import { PortalLayout } from "../shared/components/PortalLayout";
import { createQueryClient } from "./queryClient";
import { ThemeProvider } from "./ThemeProvider";

function RequiereSesion({
  children,
}: {
  children: (usuario: UsuarioSesionOut) => ReactNode;
}) {
  const consulta = useObtenerSesionApiV1IdentidadSesionGet({
    query: { retry: false },
  });

  if (consulta.isLoading) {
    return (
      <main style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
        Cargando sesión...
      </main>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200 || !consulta.data.data.autenticado) {
    return <Navigate to="/ingresar" replace />;
  }

  return <>{children(consulta.data.data.usuario)}</>;
}

function PortalAutenticado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useCerrarSesionApiV1IdentidadLogoutPost();

  async function manejarLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.clear();
      navigate("/ingresar", { replace: true });
    }
  }

  return (
    <RequiereSesion>
      {(usuario) => {
        const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.trim();
        const detalle = usuario.grado_seccion
          ? `${usuario.rol} · ${usuario.grado_seccion}`
          : usuario.rol;

        return (
          <PortalLayout
            usuarioNombre={nombreCompleto}
            usuarioDetalle={detalle}
            onLogout={manejarLogout}
            cerrandoSesion={logoutMutation.isPending}
          >
            <Routes>
              <Route path="/inicio" element={<InicioPage usuario={usuario} />} />
              <Route path="/cursos" element={<CursosPage usuario={usuario} />} />
              <Route
                path="/cursos/:asignaturaId"
                element={<CursoDetallePage usuario={usuario} />}
              />
              <Route
                path="/calificaciones"
                element={<CalificacionesPage usuario={usuario} />}
              />
              <Route path="/trabajos" element={<TrabajosPage usuario={usuario} />} />
              <Route path="/asistencia" element={<AsistenciaPage usuario={usuario} />} />
              <Route path="/mensajes" element={<MensajesPage usuario={usuario} />} />
              <Route path="/libreta" element={<LibretaPage usuario={usuario} />} />
              <Route
                path="/configuracion"
                element={<ConfiguracionPage usuario={usuario} />}
              />
              <Route path="*" element={<Navigate to="/inicio" replace />} />
            </Routes>
          </PortalLayout>
        );
      }}
    </RequiereSesion>
  );
}

export function RutasApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (location.pathname !== "/ingresar") {
        queryClient.clear();
        navigate("/ingresar", { replace: true });
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [location.pathname, navigate, queryClient]);

  return (
    <Routes>
      <Route path="/ingresar" element={<IngresoPage />} />
      <Route path="/*" element={<PortalAutenticado />} />
    </Routes>
  );
}

export function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
