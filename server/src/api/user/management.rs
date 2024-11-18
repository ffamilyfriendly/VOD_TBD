use rocket::serde::json::Json;
use validator::Validate;

use crate::managers::user_manager::{self, User, UserUpdate};
use crate::utils::jwt::ActiveToken;
use crate::datatypes::error::definition::{ApiErrors, Result};


#[get("/all")]
pub fn get_all_users(token: ActiveToken) -> Result<Vec<User>> {
    has_permission!(token, ManageUsers);
    Ok(user_manager::get_users()?.into())
}

#[derive(serde::Deserialize, Validate)]
pub struct PasswordUpdate {
    #[validate(length(min = 5, max = 100, message = "must be between 5-100 characters"))]
    pub current_password: Option<String>,
    #[validate(length(min = 5, max = 100, message = "must be between 5-100 characters"))]
    pub new_password: String
}

#[get("/<id>")]
pub fn get_selected_user(token: ActiveToken, id: u16) -> Result<User> {
    has_permission!(token, ManageUsers);

    Ok(user_manager::get_user_by_id(&id)?.into())
}

#[patch("/<id>/password", data = "<data>")]
pub fn update_password(token: ActiveToken, id: u16, data: Json<PasswordUpdate>) -> Result<usize> {
    if id != token.uid && !token.get_perms().has(&user_manager::UserPermissions::ManageUsers) {
        return Err(ApiErrors::MissesPermission(user_manager::UserPermissions::ManageUsers).into())
    }
    data.validate()?;

    let user = user_manager::get_user_by_id(&id)?;
    let can_update_password = match token.get_perms().has(&user_manager::UserPermissions::ManageUsers) {
        false => {
            let plain_psw = data.current_password.to_owned().ok_or(ApiErrors::MissesField("current_password".to_owned()))?;
            user_manager::compare_password(&plain_psw, &user)
        },
        true => true
    };

    if !can_update_password {
        return Err(ApiErrors::WrongCredentialsProvided.into());
    };

    Ok(user_manager::update_user(&user.id, UserUpdate { password: Some(data.new_password.to_owned()), email: None, flags: None })?.into())
}

#[derive(serde::Deserialize)]
pub struct FlagUpdate {
    pub flag: Option<u8>,
    pub email: Option<String>
}

#[patch("/<id>", data = "<data>")]
pub fn update_user(token: ActiveToken, data: Json<FlagUpdate>, id: u16) -> Result<usize> {
    let flags = match data.flag {
        Some(f) => {
            has_permission!(token, Administrator);
            Some(f.to_owned())
        },
        None => None
    };

    let email = match &data.email {
        Some(email) => {
            if id != token.uid && !token.get_perms().has(&user_manager::UserPermissions::ManageUsers) {
                return Err(ApiErrors::MissesPermission(user_manager::UserPermissions::ManageUsers).into())
            }
            Some(email.to_owned())
        },
        None => None
    };
    
    Ok(user_manager::update_user(&id, UserUpdate { password: None, email, flags})?.into())
}

