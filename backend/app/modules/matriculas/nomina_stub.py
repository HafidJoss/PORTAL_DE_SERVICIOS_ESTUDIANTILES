"""Estado contractual (stub) de nómina escolar por sección y pool Sin sección (RF21)."""

from copy import deepcopy
from typing import Any

_POOL_BASE: list[dict[str, Any]] = [
    {
        "id": "p0",
        "nombre": "Prado Infanzón, Thiago",
        "codigo": "05121048291001",
        "nivel": "Secundaria",
        "grado": 1,
        "nota": "Va a 1.° de Secundaria · Traslado de I.E. N.° 38001",
        "estado": "Activo",
    },
    {
        "id": "p1",
        "nombre": "Sulca Ramos, Valentina",
        "codigo": "05121048291002",
        "nivel": "Secundaria",
        "grado": 1,
        "nota": "Va a 1.° de Secundaria · Traslado de I.E. Los Libertadores",
        "estado": "Activo",
    },
    {
        "id": "p2",
        "nombre": "Ccori Flores, Adrián",
        "codigo": "05121048291003",
        "nivel": "Secundaria",
        "grado": 1,
        "nota": "Va a 1.° de Secundaria · Matrícula extemporánea",
        "estado": "Activo",
    },
    {
        "id": "p3",
        "nombre": "Yupanqui Lapa, Camila",
        "codigo": "05121048291004",
        "nivel": "Secundaria",
        "grado": 2,
        "nota": "Va a 2.° de Secundaria · Traslado de Lima",
        "estado": "Activo",
    },
    {
        "id": "p4",
        "nombre": "Torres Ore, Josué",
        "codigo": "05121048291005",
        "nivel": "Secundaria",
        "grado": 4,
        "nota": "Va a 4.° de Secundaria · Reincorporación",
        "estado": "Activo",
    },
    {
        "id": "p5",
        "nombre": "Gómez Tito, Abigail",
        "codigo": "05121048291006",
        "nivel": "Secundaria",
        "grado": 5,
        "nota": "Va a 5.° de Secundaria · Traslado de I.E. 9 de Diciembre",
        "estado": "Activo",
    },
]

_NOMINA_BASE: dict[str, list[dict[str, Any]]] = {
    "P1A": [
        {"id": "P1A-1", "nombre": "Alarcón Medina, Camila", "codigo": "05121001000001", "dni": "78201101", "apoderado": "Alarcón, Rosa", "estado": "Activo"},
        {"id": "P1A-2", "nombre": "Bendezú Lapa, Mateo", "codigo": "05121001000002", "dni": "78201102", "apoderado": "Bendezú, Fermín", "estado": "Activo"},
    ],
    "P1B": [
        {"id": "P1B-1", "nombre": "Cárdenas Rojas, Sofía", "codigo": "05121002000001", "dni": "78201201", "apoderado": "Cárdenas, Teresa", "estado": "Activo"},
    ],
    "P2A": [
        {"id": "P2A-1", "nombre": "Gutiérrez Ore, Gabriel", "codigo": "05121003000001", "dni": "78201301", "apoderado": "Gutiérrez, Juana", "estado": "Activo"},
    ],
    "S1A": [
        {"id": "S1A-1", "nombre": "Quispe Huamán, Sofía", "codigo": "05123487210187", "dni": "78120046", "apoderado": "Huamán Ccori, Rosa", "estado": "Activo"},
        {"id": "S1A-2", "nombre": "Palomino Tito, Diego", "codigo": "05123487210188", "dni": "78120047", "apoderado": "Palomino, Marcos", "estado": "Activo"},
    ],
    "S1B": [
        {"id": "S1B-1", "nombre": "Mendoza Yupanqui, Ana Lucía", "codigo": "05123487210190", "dni": "78120050", "apoderado": "Mendoza, Teresa", "estado": "Activo"},
    ],
    "S1P": [],
    "S2A": [
        {"id": "S2A-1", "nombre": "Ayala Bautista, Kevin", "codigo": "05123487210201", "dni": "74120011", "apoderado": "Ayala, Fermín", "estado": "Activo"},
        {"id": "S2A-2", "nombre": "Cisneros Aguilar, Valeria", "codigo": "05123487210202", "dni": "74120012", "apoderado": "Cisneros, Juana", "estado": "Activo"},
    ],
    "S2B": [
        {"id": "S2B-1", "nombre": "Tineo Prado, Renzo", "codigo": "05123487210210", "dni": "74120020", "apoderado": "Tineo, Rosa", "estado": "Activo"},
    ],
    "S3A": [
        {"id": "S3A-1", "nombre": "Pariona Gómez, Milagros", "codigo": "05123487210301", "dni": "73011201", "apoderado": "Pariona, Teresa", "estado": "Activo"},
        {"id": "S3A-2", "nombre": "Vílchez Sulca, Edwin", "codigo": "05123487210302", "dni": "73011202", "apoderado": "Vílchez, Marcos", "estado": "Activo"},
    ],
    "S3B": [
        {"id": "S3B-1", "nombre": "Cárdenas Rojas, Diego", "codigo": "05123487210041", "dni": "73011254", "apoderado": "Cárdenas, Juana", "estado": "Activo"},
        {"id": "S3B-2", "nombre": "Quispe Huamán, Luis Ángel", "codigo": "05123487210042", "dni": "72458193", "apoderado": "Huamán Ccori, Rosa", "estado": "Activo"},
        {"id": "S3B-3", "nombre": "Torres Chávez, Frank", "codigo": "05123487210043", "dni": "73011260", "apoderado": "Torres, Fermín", "estado": "Trasladado"},
    ],
    "S4A": [
        {"id": "S4A-1", "nombre": "Huamaní Ccori, María José", "codigo": "05123487210401", "dni": "72110001", "apoderado": "Huamaní, Rosa", "estado": "Activo"},
    ],
    "S4C": [
        {"id": "S4C-1", "nombre": "Prado Infanzón, Lucero", "codigo": "05123487210421", "dni": "72110021", "apoderado": "Prado, Teresa", "estado": "Activo"},
    ],
    "S5A": [
        {"id": "S5A-1", "nombre": "Llactahuamán Soto, Andrea", "codigo": "05123487210501", "dni": "71110001", "apoderado": "Llactahuamán, Teresa", "estado": "Activo"},
    ],
}

_pool_memoria: list[dict[str, Any]] = deepcopy(_POOL_BASE)
_nomina_memoria: dict[str, list[dict[str, Any]]] = deepcopy(_NOMINA_BASE)


def reiniciar_nomina_matriculas() -> None:
    """Restaura pool sin sección y nómina por sección en memoria."""
    global _pool_memoria, _nomina_memoria
    _pool_memoria = deepcopy(_POOL_BASE)
    _nomina_memoria = deepcopy(_NOMINA_BASE)


def obtener_pool_memoria() -> list[dict[str, Any]]:
    """Devuelve la referencia interna del pool sin sección."""
    return _pool_memoria


def obtener_estudiantes_de_seccion(seccion_id: str) -> list[dict[str, Any]]:
    """Devuelve la lista mutable de estudiantes asignados a una sección."""
    if seccion_id not in _nomina_memoria:
        _nomina_memoria[seccion_id] = []
    return _nomina_memoria[seccion_id]


def contar_estudiantes_en_seccion(seccion_id: str) -> int:
    """Devuelve cuántos estudiantes tiene asignados una sección."""
    return len(_nomina_memoria.get(seccion_id, []))
