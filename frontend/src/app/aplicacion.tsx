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
import { setUnauthorizedHandler } from "../api/clienteHttp";
import { AsistenciaVista } from "../features/asistencia/vistas/asistenciaVista";
import { CalificacionesVista } from "../features/evaluacion/vistas/calificacionesVista";
import { MensajesVista } from "../features/evaluacion/vistas/mensajesVista";
import { TrabajosVista } from "../features/evaluacion/vistas/trabajosVista";
import { ConfiguracionVista } from "../features/identidad/vistas/configuracionVista";
import { IngresoVista } from "../features/identidad/vistas/ingresoVista";
import { LibretaVista } from "../features/reportes/vistas/libretaVista";
import { CursoDetalleVista } from "../features/seguimiento/vistas/cursoDetalleVista";
import { CursosVista } from "../features/seguimiento/vistas/cursosVista";
import { InicioVista } from "../features/seguimiento/vistas/inicioVista";
import { MarcoPortal } from "../shared/componentes/marcoPortal";
import { crearClienteConsultas } from "./clienteConsultas";
import { ProveedorTema } from "./proveedorTema";

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
          <MarcoPortal
            usuarioNombre={nombreCompleto}
            usuarioDetalle={detalle}
            onLogout={manejarLogout}
            cerrandoSesion={logoutMutation.isPending}
          >
            <Routes>
              <Route path="/inicio" element={<InicioVista usuario={usuario} />} />
              <Route path="/cursos" element={<CursosVista usuario={usuario} />} />
              <Route
                path="/cursos/:asignaturaId"
                element={<CursoDetalleVista usuario={usuario} />}
              />
              <Route
                path="/calificaciones"
                element={<CalificacionesVista usuario={usuario} />}
              />
              <Route path="/trabajos" element={<TrabajosVista usuario={usuario} />} />
              <Route path="/asistencia" element={<AsistenciaVista usuario={usuario} />} />
              <Route path="/mensajes" element={<MensajesVista usuario={usuario} />} />
              <Route path="/libreta" element={<LibretaVista usuario={usuario} />} />
              <Route
                path="/configuracion"
                element={<ConfiguracionVista usuario={usuario} />}
              />
              <Route path="*" element={<Navigate to="/inicio" replace />} />
            </Routes>
          </MarcoPortal>
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
      <Route path="/ingresar" element={<IngresoVista />} />
      <Route path="/*" element={<PortalAutenticado />} />
    </Routes>
  );
}

export function App() {
  const [queryClient] = useState(() => crearClienteConsultas());

  return (
    <QueryClientProvider client={queryClient}>
      <ProveedorTema>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </BrowserRouter>
      </ProveedorTema>
    </QueryClientProvider>
  );
}

export default App;
