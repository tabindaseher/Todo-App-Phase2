from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.middleware.errors import error_handler_middleware
from app.middleware.logging import logging_middleware
import logging

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="Todo Backend API",
    version="1.0.0",
    description="API for managing tasks in a multi-user Todo application"
)

# Add logging middleware first (to log all requests)
@app.middleware("http")
async def add_logging(request, call_next):
    response = await logging_middleware(request, call_next)
    return response

# Add error handler middleware
@app.middleware("http")
async def add_error_handler(request, call_next):
    response = await error_handler_middleware(request, call_next)
    return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Expose headers for authorization
    expose_headers=["Access-Control-Allow-Origin", "Authorization"]
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint to verify backend is running"""
    return {"message": "Backend is running!"}


@app.get("/health")
async def health_check():
    """Health check endpoint to verify API availability"""
    return {"status": "healthy", "timestamp": "2023-10-27T10:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )