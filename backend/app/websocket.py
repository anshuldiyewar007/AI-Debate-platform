"""WebSocket connection manager for real-time debate updates."""
from typing import Set, Dict, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections for debate rooms."""
    
    def __init__(self):
        # debate_id -> set of connected WebSocket clients
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, debate_id: str, websocket: WebSocket):
        """Accept a new WebSocket connection for a debate."""
        await websocket.accept()
        
        if debate_id not in self.active_connections:
            self.active_connections[debate_id] = set()
        
        self.active_connections[debate_id].add(websocket)
        logger.info(f"Client connected to debate {debate_id}. Active: {len(self.active_connections[debate_id])}")
    
    async def disconnect(self, debate_id: str, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if debate_id in self.active_connections:
            self.active_connections[debate_id].discard(websocket)
            
            if not self.active_connections[debate_id]:
                del self.active_connections[debate_id]
            
            logger.info(f"Client disconnected from debate {debate_id}")
    
    async def broadcast(self, debate_id: str, message: dict):
        """Broadcast a message to all clients in a debate room."""
        if debate_id not in self.active_connections:
            return
        
        # Convert message to JSON
        message_str = json.dumps(message)
        
        # Send to all connected clients
        disconnected = []
        for connection in self.active_connections[debate_id]:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            await self.disconnect(debate_id, conn)
    
    def get_active_users(self, debate_id: str) -> int:
        """Get number of active users in a debate."""
        return len(self.active_connections.get(debate_id, set()))


# Global connection manager instance
manager = ConnectionManager()
