from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ArgumentOut(BaseModel):
    """Debate argument response."""
    id: str
    side: str
    content: str
    votes: int
    createdBy: Optional[str]
    createdAt: str


class TopicCreate(BaseModel):
    """Topic creation request."""
    title: str = Field(..., min_length=3)
    description: Optional[str] = None


class TopicOut(BaseModel):
    """Topic response."""
    id: str
    title: str
    description: str
    createdAt: str


class DebateCreate(BaseModel):
    """Debate creation request."""
    topic: str = Field(..., min_length=3)


class DebateOut(BaseModel):
    """Debate response."""
    id: str
    topic: str
    createdBy: str
    arguments: List[ArgumentOut]
    summary: Optional[str] = None
    createdAt: str


class VoteRequest(BaseModel):
    """Vote request."""
    argumentId: str


class SummaryRequest(BaseModel):
    """Summary generation request."""
    pass


class ParticipateRequest(BaseModel):
    """User participation request."""
    side: str = Field(..., description="FOR or AGAINST")
    content: str = Field(..., min_length=5)
