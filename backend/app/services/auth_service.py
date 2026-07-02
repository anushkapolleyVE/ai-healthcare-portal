# from sqlalchemy.orm import Session

# from app.models.user import User
# from app.schemas.user import UserCreate
# from app.repository.user_repository import (
#     create_user,
#     get_user_by_email,
# )
# from app.auth import (
#     hash_password,
#     verify_password,
#     create_access_token,
# )

# from app.services.email_service import send_welcome_email


# def register_user(db: Session, user: UserCreate):
#     """
#     Register a new user.
#     """

#     # Check if email already exists
#     existing_user = get_user_by_email(db, user.email)

#     if existing_user:
#         return None

#     # Create new user
#     db_user = User(
#         name=user.name,
#         email=user.email,
#         password=hash_password(user.password),
#         role="patient"
#     )

#     # Save to database
#     db_user = create_user(db, db_user)

#     # Send welcome email
#     try:
#         send_welcome_email(
#             email=db_user.email,
#             name=db_user.name
#         )
#     except Exception as e:
#         print(f"Email Error: {e}")

#     return db_user


# def login_user(db: Session, email: str, password: str):
#     """
#     Login existing user.
#     """

#     user = get_user_by_email(db, email)

#     if not user:
#         return None

#     if not verify_password(password, user.password):
#         return None

#     access_token = create_access_token(
#             data={
#                 "sub": user.email,     # ← must be email, not id
#                 "id": user.id,
#                 "role": user.role
#             }
#         )
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "role": user.role
#         }
#     }
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.repository.user_repository import (
    create_user,
    get_user_by_email,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(db: Session, user: UserCreate):
    """
    Register a new user.
    """

    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        return None

    db_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="patient"
    )

    db_user = create_user(db, db_user)

    return db_user


def login_user(db: Session, email: str, password: str):
    """
    Login existing user.
    """

    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "role": user.role
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }