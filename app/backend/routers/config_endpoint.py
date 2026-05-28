import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["config"])


@router.get("/api/config")
def get_runtime_config():
    """Return runtime configuration consumed by the frontend on load.

    In production the backend and frontend share the same origin, so
    API_BASE_URL is an empty string (relative URLs).  Set PYTHON_BACKEND_URL
    in the environment to override (e.g. for split-service deployments).
    """
    backend_url = os.getenv("PYTHON_BACKEND_URL", "")
    return JSONResponse({"API_BASE_URL": backend_url})
