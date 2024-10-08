use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::managers::invite_manager;
use crate::managers::user_manager::{self, delete_user, get_user, User, UserPermissions};
use crate::datatypes::error::definition::{ApiErrors, Result, UserManagerErrors};
use crate::utils::jwt::{gen_token, get_timestamp, get_token, passes, ActiveToken, RefreshToken, TimeOffsets};

fn gen_refresh_token(u: &User) -> String {
    let t = RefreshToken { sub: u.email.clone(), token_type: "refresh".to_owned(), exp: get_timestamp(TimeOffsets::HalfYear.into()) };
    gen_token(&t)
}

#[derive(Validate, Serialize, Deserialize)]
pub struct UserLogin {
    #[validate(email(message = "invalid form"))]
    email: String,
    #[validate(length(min = 5, max = 100, message = "must be between 5-100 characters"))]
    password: String,
}

#[post("/login", data = "<input>")]
pub fn login(input: Json<UserLogin>) -> Result<String> { 
    input.validate()?;
    let user = user_manager::get_user(&input.email)?;

    if !user_manager::compare_password(&input.password, &user) {
        return Err(ApiErrors::WrongCredentialsProvided.into())
    }

    Ok(gen_refresh_token(&user).into())
}

#[derive(Validate, Serialize, Deserialize)]
pub struct UserRegister {
    #[validate(email(message = "invalid form"))]
    email: String,
    #[validate(length(min = 5, max = 100, message = "must be between 5-100 characters"))]
    password: String,
    #[validate(length(min = 5, max = 20, message = "must be between 5-20 characters"))]
    name: String,
    #[validate(length(min = 5, max = 20, message = "must be between 5-20 characters"))]
    invite: String
}

#[post("/register", data = "<input>")]
pub fn register(input: Json<UserRegister>) -> Result<String> { 
    input.validate()?;
    let invite = invite_manager::get_invite(&input.invite)?;

    invite.is_valid_err()?;
    let mut flags = 0;

    if invite.id == "first_time_setup" {
        flags = UserPermissions::Administrator as u8;
    }

    let user = user_manager::insert_user(&input.name, &input.email, &user_manager::hash_password(&input.password).unwrap(), flags, &input.invite)?;
    invite_manager::subtract_from_invite(&invite.id)?;
    Ok(gen_refresh_token(&user).into())
}

#[derive(Validate, Serialize, Deserialize)]
pub struct RefreshTokenData {
    token: String
}

#[post("/refresh", data = "<input>")]
pub fn refresh(input: Json<RefreshTokenData>) -> Result<String> { 
    input.validate()?;
    if !passes::<RefreshToken>(input.token.clone()) {
        return Err(ApiErrors::WrongCredentialsProvided.into())
    }

    let t = get_token::<RefreshToken>(input.token.clone())?;
    
    if t.token_type != "refresh" {
        return Err(ApiErrors::WrongTokenTypeProvided(t.token_type, "refresh".to_owned()).into())
    }

    let user = get_user(&t.sub)?;

    let token_object = ActiveToken {
        exp: get_timestamp(TimeOffsets::FiveMinutes.into()),
        sub: user.email,
        uid: user.id,
        permissions: user.flags.int_rep,
        token_type: "active".to_owned()
    };

    Ok(gen_token::<ActiveToken>(&token_object).into())
}

#[delete("/user/<id>")]
pub fn delete(id: u16, token: ActiveToken) -> Result<()> { 
    if id != token.uid && !token.get_perms().has(&user_manager::UserPermissions::ManageUsers) {
        return Err(ApiErrors::MissesPermission(user_manager::UserPermissions::ManageUsers).into())
    }

    let r = delete_user(id)?;
    if r == 1 {
        Ok(().into())
    } else {
        return Err(UserManagerErrors::NotFound(id.to_string()).into())
    }
}

#[get("/user/@me")]
pub fn get_current_user(token: ActiveToken) -> Result<User> {
    Ok(user_manager::get_user(&token.sub)?.into())
}