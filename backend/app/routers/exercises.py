from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Exercise, User
from app.schemas import ExerciseCreate, ExerciseUpdate, ExerciseResponse
from app.auth import get_current_user

router = APIRouter(prefix="/exercises", tags=["Exercícios"])

@router.get("", response_model=List[ExerciseResponse])
def list_exercises(
    difficulty: Optional[str] = Query(None, description="Filtrar por dificuldade"),
    subject: Optional[str] = Query(None, description="Filtrar por matéria"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Exercise)
    
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    if subject:
        query = query.filter(Exercise.subject == subject)
    
    exercises = query.order_by(Exercise.created_at.desc()).all()
    return exercises

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercício não encontrado"
        )
    return exercise

@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_exercise = Exercise(
        title=exercise_data.title,
        statement=exercise_data.statement,
        answer=exercise_data.answer,
        difficulty=exercise_data.difficulty,
        subject=exercise_data.subject,
        created_by=current_user.id
    )
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    return new_exercise

@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: UUID,
    exercise_data: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercício não encontrado"
        )
    
    # Verificar se o usuário é o criador
    if exercise.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar este exercício"
        )
    
    # Atualizar campos
    update_data = exercise_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    db.commit()
    db.refresh(exercise)
    return exercise

@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    exercise_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercício não encontrado"
        )
    
    # Verificar se o usuário é o criador
    if exercise.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar este exercício"
        )
    
    db.delete(exercise)
    db.commit()
    return None
