from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

WORKER_PATH = Path(__file__).with_name("forecast_worker.py")


def forecast_next_days(
    product_id: int,
    category: str,
    recent_quantities: list[float],
    days: int = 7,
    reference_date: str | None = None,
) -> list[dict[str, Any]]:
    payload = {
        "product_id": product_id,
        "category": category,
        "recent_quantities": recent_quantities,
        "days": days,
    }
    if reference_date is not None:
        payload["reference_date"] = reference_date

    result = subprocess.run(
        [sys.executable, str(WORKER_PATH)],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        stderr = (result.stderr or "").strip()
        stdout = (result.stdout or "").strip()
        message = stderr or stdout or "Forecast worker failed"
        raise RuntimeError(message)

    output = (result.stdout or "").strip()
    if not output:
        return []

    return json.loads(output)