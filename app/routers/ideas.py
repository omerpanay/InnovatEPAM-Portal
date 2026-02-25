"""Ideas router: submission, listing, and detail endpoints.

Handles idea CRUD operations for the InnovatEPAM Portal.
"""

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user, get_db
from app.schemas.idea import IdeaListItem, IdeaListResponse, IdeaResponse
from app.services import idea_service

router = APIRouter(prefix="/api/v1/ideas", tags=["ideas"])


@router.post(
    "",
    response_model=IdeaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new idea",
)
async def create_idea(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    attachment: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a new idea with an optional file attachment."""
    # Swagger UI sends an empty file part when no file is selected
    if attachment and not attachment.filename:
        attachment = None

    try:
        idea = await idea_service.create_idea(
            db=db,
            title=title,
            description=description,
            category=category,
            author_id=current_user.id,
            attachment=attachment,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return IdeaResponse(
        id=str(idea.id),
        title=idea.title,
        description=idea.description,
        category=idea.category,
        status=idea.status,
        author_id=str(idea.author_id),
        attachment_filename=os.path.basename(idea.attachment_path)
        if idea.attachment_path
        else None,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
    )


@router.get(
    "",
    response_model=IdeaListResponse,
    summary="List ideas with pagination",
)
async def list_ideas(
    skip: int = 0,
    limit: int = 20,
    mine: bool = False,
    idea_status: str | None = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a paginated list of ideas."""
    ideas, total = await idea_service.get_ideas(
        db=db,
        skip=skip,
        limit=limit,
        mine=mine,
        status=idea_status,
        current_user_id=current_user.id,
    )

    return IdeaListResponse(
        items=[
            IdeaListItem(
                id=str(idea.id),
                title=idea.title,
                category=idea.category,
                status=idea.status,
                author_id=str(idea.author_id),
                created_at=idea.created_at,
            )
            for idea in ideas
        ],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{idea_id}",
    response_model=IdeaResponse,
    summary="Get idea details",
)
async def get_idea(
    idea_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details of a single idea."""
    idea = await idea_service.get_idea_by_id(db, idea_id)
    if idea is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )

    return IdeaResponse(
        id=str(idea.id),
        title=idea.title,
        description=idea.description,
        category=idea.category,
        status=idea.status,
        author_id=str(idea.author_id),
        attachment_filename=os.path.basename(idea.attachment_path)
        if idea.attachment_path
        else None,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
    )
