"""AI Debate Bot FastAPI Application."""
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, debate_routes, topic_routes, admin_routes
from app.database import connect_to_mongo, close_mongo_connection
from app.services.storage_service import get_user_by_email, create_user
from app.utils.auth_utils import hash_password
from app.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.websocket import manager
from app.utils.auth_utils import verify_token

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Debate Bot - API", version="1.0.0")

# CORS - allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    await connect_to_mongo()
    # Seed an admin user when ADMIN_EMAIL and ADMIN_PASSWORD are provided in env
    try:
        if ADMIN_EMAIL and ADMIN_PASSWORD:
            existing = get_user_by_email(ADMIN_EMAIL)
            if not existing:
                hashed = hash_password(ADMIN_PASSWORD)
                create_user(email=ADMIN_EMAIL, hashed_password=hashed, name="admin", role="admin")
                logger.info("Seeded admin user from environment")
    except Exception:
        logger.exception("Failed to seed admin user")
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    await close_mongo_connection()
    logger.info("Application shutdown complete")


# Include routers
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(debate_routes.router, tags=["Debates"])
app.include_router(topic_routes.router, tags=["Topics"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"message": "AI Debate Bot API is running", "version": "1.0.0"}


# WebSocket endpoint for real-time debate updates
@app.websocket("/ws/debate/{debate_id}")
async def websocket_endpoint(websocket: WebSocket, debate_id: str):
    """
    WebSocket endpoint for real-time debate updates.
    
    Maintains persistent connection and broadcasts events to all connected clients.
    """
    try:
        await manager.connect(debate_id, websocket)
        
        # Broadcast connection event
        await manager.broadcast(
            debate_id,
            {
                "type": "user_joined",
                "message": f"User joined debate {debate_id}",
                "active_users": manager.get_active_users(debate_id),
            },
        )
        
        # Listen for messages from client
        while True:
            data = await websocket.receive_text()
            
            # Simple echo with broadcast (extensible for real-time events)
            await manager.broadcast(
                debate_id,
                {
                    "type": "message",
                    "data": data,
                    "active_users": manager.get_active_users(debate_id),
                },
            )
    
    except WebSocketDisconnect:
        await manager.disconnect(debate_id, websocket)
        
        # Broadcast disconnection event
        if manager.get_active_users(debate_id) > 0:
            await manager.broadcast(
                debate_id,
                {
                    "type": "user_left",
                    "message": f"User left debate {debate_id}",
                    "active_users": manager.get_active_users(debate_id),
                },
            )
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await manager.disconnect(debate_id, websocket)
        except:
            pass



@app.get("/")
async def root():
    return {"message": "AI Debate Bot API - running"}
