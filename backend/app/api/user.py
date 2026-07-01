from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.database.database import get_db

from sqlalchemy.orm import Session

from app.schemas.user import UserUpdate, ChangePassword
from app.services.user_service import (
    update_profile,
    change_password,
)

from app.repository.user_repository import delete_user

router = APIRouter(
    prefix="/user",
    tags=["User"]
)


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/update")
def update(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return update_profile(
        db,
        current_user,
        data
    )


@router.put("/change-password")
def change(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user = change_password(
        db,
        current_user,
        data
    )

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="Old password incorrect"
        )

    return {"message": "Password updated successfully"}


@router.delete("/delete")
def delete(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    delete_user(
        db,
        current_user
    )

    return {
        "message": "Account deleted successfully"
    }
from app.schemas.user import UserUpdate, ChangePassword, UserResponse

@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/update", response_model=UserResponse)
def update(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return update_profile(db, current_user, data)