"""Topic management endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.debate_schema import TopicCreate, TopicOut
from app.utils.auth_utils import get_current_admin
from app.services.storage_service import (
    create_topic,
    get_all_topics,
    get_topic_by_id,
    delete_topic,
)

router = APIRouter()


@router.get("/topics", response_model=List[TopicOut])
async def list_topics():
    """Get all debate topics."""
    return get_all_topics()


@router.get("/topics/{topic_id}", response_model=TopicOut)
async def get_topic(topic_id: str):
    """Get a specific topic by ID."""
    topic = get_topic_by_id(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )
    return topic


@router.post("/topics", response_model=TopicOut)
async def create_new_topic(
    topic_data: TopicCreate,
    admin: dict = Depends(get_current_admin),
):
    """Create a new debate topic (admin only)."""
    topic = create_topic(
        title=topic_data.title,
        description=topic_data.description,
    )
    return topic


@router.delete("/topics/{topic_id}")
async def delete_topic_endpoint(
    topic_id: str,
    admin: dict = Depends(get_current_admin),
):
    """Delete a topic (admin only)."""
    if not delete_topic(topic_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )
    return {"message": f"Topic {topic_id} deleted"}
