import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../shared/estilos/tokens.css";
import { App } from "./aplicacion";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
