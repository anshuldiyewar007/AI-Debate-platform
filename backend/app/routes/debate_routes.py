"""Debate management endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from app.schemas.debate_schema import (
    DebateOut,
    DebateCreate,
    ArgumentOut,
    VoteRequest,
    SummaryRequest,
    ParticipateRequest,
)
from app.utils.auth_utils import get_current_user, get_current_admin
from app.services.gemini_service import generate_debate, generate_summary
from app.services.storage_service import (
    create_debate,
    get_debate_by_id,
    get_all_debates,
    list_debates_paginated,
    add_argument_to_debate,
    get_argument_by_id,
    add_vote,
    has_voted,
    update_debate_summary,
    get_topic_by_id,
)

router = APIRouter()


@router.get("/debates", response_model=dict)
async def list_debates(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """Get paginated list of debates."""
    return list_debates_paginated(page, limit)


@router.get("/debates/{debate_id}", response_model=DebateOut)
async def get_debate(debate_id: str):
    """Get a specific debate by ID."""
    debate = get_debate_by_id(debate_id)
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate not found",
        )
    return debate


@router.post("/debates", response_model=DebateOut)
async def create_new_debate(
    payload: DebateCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new debate with AI-generated arguments.
    
    Flow:
    1. Validate topic
    2. Call Gemini API to generate FOR/AGAINST arguments
    3. Store debate with arguments in memory
    """
    if not payload.topic or len(payload.topic.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic must be at least 3 characters",
        )
    
    # Create debate in storage
    debate = create_debate(
        topic=payload.topic,
        created_by=current_user["id"],
    )
    
    # Generate arguments from Gemini
    try:
        generated = await generate_debate(payload.topic)
        
        # Add FOR arguments
        for arg in generated.get("for", []):
            add_argument_to_debate(
                debate_id=debate["id"],
                side="FOR",
                content=arg,
                created_by=None,  # AI-generated
            )
        
        # Add AGAINST arguments
        for arg in generated.get("against", []):
            add_argument_to_debate(
                debate_id=debate["id"],
                side="AGAINST",
                content=arg,
                created_by=None,  # AI-generated
            )
    except Exception as e:
        # If Gemini fails, still return debate but with empty arguments
        pass
    
    return get_debate_by_id(debate["id"])


@router.post("/debates/{debate_id}/participate")
async def participate_in_debate(
    debate_id: str,
    payload: ParticipateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Add a user argument to a debate.
    
    User can add arguments supporting FOR or AGAINST the topic.
    """
    debate = get_debate_by_id(debate_id)
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate not found",
        )
    
    if payload.side not in ["FOR", "AGAINST"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Side must be FOR or AGAINST",
        )
    
    if not payload.content or len(payload.content.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Argument must be at least 5 characters",
        )
    
    # Add user argument
    argument = add_argument_to_debate(
        debate_id=debate_id,
        side="USER",  # User-submitted argument
        content=payload.content,
        created_by=current_user["id"],
    )
    
    return ArgumentOut(
        id=argument["id"],
        side=argument["side"],
        content=argument["content"],
        votes=argument["votes"],
        createdBy=argument["createdBy"],
        createdAt=argument["createdAt"],
    )


@router.post("/debates/{debate_id}/vote/{argument_id}")
async def vote_on_argument(
    debate_id: str,
    argument_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Vote on an argument.
    
    Rules:
    - One vote per user per argument
    - Prevents duplicate voting
    """
    debate = get_debate_by_id(debate_id)
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate not found",
        )
    
    argument = get_argument_by_id(debate_id, argument_id)
    if not argument:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found",
        )
    
    # Check if already voted
    if has_voted(argument_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted on this argument",
        )
    
    # Add vote
    success = add_vote(debate_id, argument_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add vote",
        )
    
    return {
        "argumentId": argument_id,
        "votes": argument["votes"],
        "message": "Vote added successfully",
    }


@router.post("/debates/{debate_id}/summary")
async def generate_debate_summary(
    debate_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """
    Generate a summary of the debate.
    
    Calls Gemini API to create a neutral summary of all arguments.
    """
    debate = get_debate_by_id(debate_id)
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate not found",
        )
    
    if not debate.get("arguments"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debate has no arguments to summarize",
        )
    
    # Collect all argument content
    arg_texts = [arg["content"] for arg in debate["arguments"]]
    
    # Generate summary from Gemini
    try:
        summary = await generate_summary(arg_texts)
        update_debate_summary(debate_id, summary)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate summary",
        )
