"""Configuración compartida y cliente ASGI en memoria para pruebas sin red."""

import asyncio
import selectors
import time

import httpx
from fastapi import FastAPI


class _NoSocketSelector(selectors.BaseSelector):
    """Selector mínimo en memoria para entornos donde socketpair está restringido."""

    def register(self, fileobj, events, data=None):
        return selectors.SelectorKey(fileobj, 0, events, data)

    def unregister(self, fileobj):
        return None

    def modify(self, fileobj, events, data=None):
        return None

    def select(self, timeout=None):
        if timeout is None or timeout > 0:
            time.sleep(min(timeout or 0.005, 0.005))
        return []

    def close(self):
        return None

    def get_map(self):
        return {}


class _NoSocketLoop(asyncio.SelectorEventLoop):
    """Event loop ASGI en memoria que no abre sockets locales."""

    def __init__(self) -> None:
        super().__init__(selector=_NoSocketSelector())

    def _make_self_pipe(self) -> None:
        self._ssock = None
        self._csock = None

    def _close_self_pipe(self) -> None:
        pass

    def _write_to_self(self) -> None:
        pass


class _InMemoryASGITransport(httpx.BaseTransport):
    """Ejecuta una aplicación ASGI (FastAPI) directamente en memoria."""

    def __init__(self, app: FastAPI) -> None:
        self.app = app

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        scope = {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": request.method,
            "scheme": request.url.scheme,
            "path": request.url.path,
            "raw_path": request.url.raw_path,
            "query_string": request.url.query,
            "headers": [(k.lower(), v) for k, v in request.headers.raw],
            "client": ("127.0.0.1", 0),
            "server": ("testserver", 80),
        }
        body = request.read()
        enviado = False

        async def receive():
            nonlocal enviado
            if not enviado:
                enviado = True
                return {"type": "http.request", "body": body, "more_body": False}
            return {"type": "http.disconnect"}

        status = 500
        headers: list[tuple[bytes, bytes]] = []
        chunks: list[bytes] = []

        async def send(msg):
            nonlocal status, headers
            if msg["type"] == "http.response.start":
                status = msg["status"]
                headers = msg.get("headers", [])
            elif msg["type"] == "http.response.body":
                chunks.append(msg.get("body", b""))

        loop = _NoSocketLoop()
        try:
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.app(scope, receive, send))
        finally:
            asyncio.set_event_loop(None)
            loop.close()

        return httpx.Response(
            status_code=status,
            headers=headers,
            content=b"".join(chunks),
        )


def crear_cliente(app: FastAPI) -> httpx.Client:
    """Devuelve un cliente HTTP síncrono conectado en memoria a la app FastAPI."""
    return httpx.Client(
        transport=_InMemoryASGITransport(app),
        base_url="http://testserver",
    )
