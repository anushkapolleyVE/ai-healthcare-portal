from app.auth import verify_password, hash_password
from app.repository.user_repository import update_user


def update_profile(db, user, data):
    user.name = data.name
    user.email = data.email
    user.phone = data.phone
    user.date_of_birth = data.date_of_birth
    user.gender = data.gender
    user.address = data.address

    return update_user(db, user)


def change_password(db, user, passwords):
    if not verify_password(passwords.old_password, user.password):
        return None

    user.password = hash_password(passwords.new_password)

    return update_user(db, user)