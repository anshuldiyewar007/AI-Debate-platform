"""In-memory storage service for debates, users, topics, and votes.
Ready for MongoDB migration - only this file needs to change.
"""
from uuid import uuid4
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


# In-memory storage
users: List[Dict[str, Any]] = []
debates: List[Dict[str, Any]] = []
topics: List[Dict[str, Any]] = []
votes: Dict[str, List[str]] = {}  # argumentId -> [userId1, userId2, ...]


# ============================================================================
# USER OPERATIONS
# ============================================================================

def create_user(email: str, hashed_password: str, name: Optional[str] = None, role: str = "user") -> Dict[str, Any]:
    """Create and store a new user."""
    user = {
        "id": str(uuid4()),
        "email": email,
        "hashed_password": hashed_password,
        "name": name or email.split("@")[0],
        "role": role,
        "createdAt": datetime.utcnow().isoformat(),
    }
    users.append(user)
    return user


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by email."""
    for user in users:
        if user["email"] == email:
            return user
    return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by ID."""
    for user in users:
        if user["id"] == user_id:
            return user
    return None


def get_all_users() -> List[Dict[str, Any]]:
    """Get all users."""
    return users


# ============================================================================
# TOPIC OPERATIONS
# ============================================================================

def create_topic(title: str, description: Optional[str] = None) -> Dict[str, Any]:
    """Create a new debate topic."""
    topic = {
        "id": str(uuid4()),
        "title": title,
        "description": description or "",
        "createdAt": datetime.utcnow().isoformat(),
    }
    topics.append(topic)
    return topic


def get_topic_by_id(topic_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve topic by ID."""
    for topic in topics:
        if topic["id"] == topic_id:
            return topic
    return None


def get_all_topics() -> List[Dict[str, Any]]:
    """Get all topics."""
    return topics


def delete_topic(topic_id: str) -> bool:
    """Delete a topic by ID."""
    global topics
    initial_count = len(topics)
    topics = [t for t in topics if t["id"] != topic_id]
    return len(topics) < initial_count


# ============================================================================
# DEBATE OPERATIONS
# ============================================================================

def create_debate(topic: str, created_by: str) -> Dict[str, Any]:
    """Create a new debate with AI-generated arguments."""
    debate = {
        "id": str(uuid4()),
        "topic": topic,
        "createdBy": created_by,
        "arguments": [],  # Will be populated with AI-generated args and user args
        "summary": None,
        "createdAt": datetime.utcnow().isoformat(),
    }
    debates.append(debate)
    return debate


def get_debate_by_id(debate_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve debate by ID."""
    for debate in debates:
        if debate["id"] == debate_id:
            return debate
    return None


def delete_debate(debate_id: str) -> bool:
    """Delete a debate by ID."""
    global debates
    initial = len(debates)
    debates = [d for d in debates if d["id"] != debate_id]
    return len(debates) < initial


def get_all_debates() -> List[Dict[str, Any]]:
    """Get all debates."""
    return debates


def list_debates_paginated(page: int = 1, limit: int = 10) -> Dict[str, Any]:
    """Return paginated debates."""
    all_debates = get_all_debates()
    total = len(all_debates)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "debates": all_debates[start:end],
    }


def add_argument_to_debate(
    debate_id: str,
    side: str,  # "FOR", "AGAINST", or "USER"
    content: str,
    created_by: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Add an argument to a debate."""
    debate = get_debate_by_id(debate_id)
    if not debate:
        return None
    
    argument = {
        "id": str(uuid4()),
        "side": side,
        "content": content,
        "votes": 0,
        "createdBy": created_by,
        "createdAt": datetime.utcnow().isoformat(),
    }
    debate["arguments"].append(argument)
    return argument


def get_argument_by_id(debate_id: str, argument_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific argument from a debate."""
    debate = get_debate_by_id(debate_id)
    if not debate:
        return None
    
    for arg in debate["arguments"]:
        if arg["id"] == argument_id:
            return arg
    return None


def update_debate_summary(debate_id: str, summary: str) -> bool:
    """Update debate summary."""
    debate = get_debate_by_id(debate_id)
    if not debate:
        return False
    debate["summary"] = summary
    return True


# ============================================================================
# VOTING OPERATIONS
# ============================================================================

def add_vote(debate_id: str, argument_id: str, user_id: str) -> bool:
    """Add a vote to an argument. Max one vote per user per argument."""
    vote_key = f"{argument_id}:{user_id}"
    
    # Check if user already voted on this argument
    if vote_key in votes:
        return False  # Already voted
    
    # Increment vote count
    argument = get_argument_by_id(debate_id, argument_id)
    if not argument:
        return False
    
    argument["votes"] += 1
    
    # Track this vote
    if argument_id not in votes:
        votes[argument_id] = []
    votes[argument_id].append(user_id)
    
    return True


def has_voted(argument_id: str, user_id: str) -> bool:
    """Check if user has already voted on an argument."""
    vote_key = f"{argument_id}:{user_id}"
    return argument_id in votes and user_id in votes[argument_id]


def get_debate_stats() -> Dict[str, Any]:
    """Get statistics for analytics."""
    total_debates = len(debates)
    total_users = len(users)
    
    # Find most voted debate
    most_voted = None
    max_votes = 0
    for debate in debates:
        total_votes = sum(arg.get("votes", 0) for arg in debate.get("arguments", []))
        if total_votes > max_votes:
            max_votes = total_votes
            most_voted = debate
    
    # Find most active user (by number of arguments created)
    user_activity: Dict[str, int] = {}
    for debate in debates:
        for arg in debate.get("arguments", []):
            creator = arg.get("createdBy")
            if creator:
                user_activity[creator] = user_activity.get(creator, 0) + 1
    
    most_active_user_id = max(user_activity, key=user_activity.get) if user_activity else None
    
    return {
        "total_users": total_users,
        "total_debates": total_debates,
        "most_voted_debate": most_voted,
        "most_active_user_id": most_active_user_id,
    }
