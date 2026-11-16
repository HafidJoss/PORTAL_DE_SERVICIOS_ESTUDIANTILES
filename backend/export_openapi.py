"""Exporta el esquema OpenAPI de FastAPI a JSON sin levantar servidor ni BD."""

import json
from pathlib import Path

from app.main import crear_app


def exportar_openapi(destino: Path | None = None) -> Path:
    """Escribe el esquema OpenAPI en `backend/openapi.json` y devuelve su ruta."""
    salida = destino or Path(__file__).resolve().parent / "openapi.json"
    esquema = crear_app().openapi()
    salida.write_text(json.dumps(esquema, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return salida


if __name__ == "__main__":
    ruta = exportar_openapi()
    print(f"OpenAPI exportado en: {ruta}")
