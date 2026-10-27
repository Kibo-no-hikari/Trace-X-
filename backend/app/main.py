import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database import db_manager
from backend.app.routes import (
    health_router,
    investigations_router,
    evidence_router,
    events_router,
    timeline_router,
    correlation_router,
    reports_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tracex.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for MongoDB Atlas initialization and graceful shutdown."""
    logger.info("Initializing TraceX Digital Forensics API...")
    connected = db_manager.connect()
    if connected:
        logger.info("TraceX Backend ready with active MongoDB Atlas connection.")
    else:
        logger.warning(
            "TraceX Backend started in offline/degraded mode. MongoDB Atlas is not yet connected. "
            "Configure MONGODB_URI in backend/.env to activate live database storage."
        )

    yield

    logger.info("Shutting down TraceX Digital Forensics API...")
    db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Digital Forensics & Attack Timeline Reconstruction REST API. Powered by FastAPI and MongoDB Atlas.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled server exception at %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal forensic server error occurred. Please verify your request or server logs."}
    )

# Include Routers
app.include_router(health_router)
app.include_router(investigations_router)
app.include_router(evidence_router)
app.include_router(events_router)
app.include_router(timeline_router)
app.include_router(correlation_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "health_url": "/api/health",
        "principle": "No Evidence, No Claim.",
        "tagline": "Reconstruct the Incident. Follow the Evidence."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
