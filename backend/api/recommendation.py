from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.recommendation import RecommendationResponse
from backend.services.recommendation_service import get_recommendations

router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"]
)


@router.get("/", response_model=list[RecommendationResponse])
def recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    candidate_limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return get_recommendations(db, limit=limit, candidate_limit=candidate_limit)