"""Ideas router: submission, listing, detail, download, edit, and delete endpoints.

Handles idea CRUD operations for the InnovatEPAM Portal.
"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
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
    summary="List ideas with pagination and optional search filter",
)
async def list_ideas(
    skip: int = 0,
    limit: int = 20,
    mine: bool = False,
    idea_status: str | None = None,
    search: str | None = None,
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
        search=search,
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
    "/stats",
    summary="Get idea statistics",
)
async def get_stats(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve overall statistics for ideas.
    Accessible by any authenticated user.
    """
    stats = await idea_service.get_idea_stats(db)
    return stats


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


@router.get(
    "/{idea_id}/attachment",
    summary="Download idea attachment",
)
async def download_attachment(
    idea_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download the file attachment for an idea."""
    idea = await idea_service.get_idea_by_id(db, idea_id)
    if idea is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )
    if not idea.attachment_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attachment for this idea",
        )

    file_path = Path(idea.attachment_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment file not found on server",
        )

    return FileResponse(
        path=str(file_path),
        filename=os.path.basename(idea.attachment_path),
        media_type="application/octet-stream",
    )


@router.patch(
    "/{idea_id}",
    response_model=IdeaResponse,
    summary="Edit an idea",
)
async def edit_idea(
    idea_id: uuid.UUID,
    title: str | None = Form(None),
    description: str | None = Form(None),
    category: str | None = Form(None),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Edit own idea. Only the author can edit, and only while status is 'submitted'."""
    idea = await idea_service.get_idea_by_id(db, idea_id)
    if idea is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )
    if idea.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own ideas",
        )
    if idea.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ideas with 'submitted' status can be edited",
        )

    updated = await idea_service.update_idea(db, idea, title=title, description=description, category=category)
    return IdeaResponse(
        id=str(updated.id),
        title=updated.title,
        description=updated.description,
        category=updated.category,
        status=updated.status,
        author_id=str(updated.author_id),
        attachment_filename=os.path.basename(updated.attachment_path)
        if updated.attachment_path
        else None,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.delete(
    "/{idea_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an idea",
)
async def delete_idea(
    idea_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete own idea. Only the author can delete, and only while status is 'submitted'."""
    idea = await idea_service.get_idea_by_id(db, idea_id)
    if idea is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )
    if idea.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own ideas",
        )
    if idea.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ideas with 'submitted' status can be deleted",
        )

    await idea_service.delete_idea(db, idea)
