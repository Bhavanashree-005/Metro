from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

app = FastAPI(
    title="MetroImpact AI Backend",
    description="API for Chennai Metro Causal Impact Analysis",
    version="1.0.0",
)

# Allow React frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routers import map_router, causal_router, sim_router, ingest_router

app.include_router(map_router)
app.include_router(causal_router)
app.include_router(sim_router)
app.include_router(ingest_router)

# Serve Frontend
DIST_PATH = Path(__file__).parent.parent / "client" / "dist"

@app.get("/api/health")
def api_health():
    return {"status": "healthy"}

if DIST_PATH.exists():
    # 1. Mount the entire dist folder for direct file access (index-*.js, icons, etc.)
    # We use a custom sub-class or just careful routing
    app.mount("/assets", StaticFiles(directory=str(DIST_PATH / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # API handles its own
        if full_path.startswith("api"):
             return {"error": "Not Found"}
        
        # Check if it's a direct file in the dist root (like favicon.svg, project_demo.webp)
        local_file = DIST_PATH / full_path
        if local_file.is_file():
            return FileResponse(str(local_file))
            
        # Fallback to index.html for React Router
        return FileResponse(str(DIST_PATH / "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"status": "ok", "message": "Backend build not found. Run npm run build."}
