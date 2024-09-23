use std::io;

use rocket::http::Status;
use serde::{Deserialize, Serialize};
use validator::ValidationErrors;

use crate::managers::user_manager::UserPermissions;

#[derive(thiserror::Error, Debug)]
pub enum UserManagerErrors {
    #[error("User with email `{0}` was not found")]
    NotFound(String),
    #[error("Validation failed")]
    ValidationError
}

#[derive(thiserror::Error, Debug)]
pub enum InviteManagerErrors {
    #[error("Invite with id `{0}` was not found")]
    NotFound(String),
    #[error("Invite has expired")]
    Expired,
    #[error("Invite has depleted")]
    Deplated
}

#[derive(thiserror::Error, Debug)]
pub enum ApiErrors {
    /// Auth related errors
    #[error("Incorrect login details were provided.")]
    WrongCredentialsProvided,
    #[error("Token of incorrect type was provided. Got `{0}` expected `{1}`")]
    WrongTokenTypeProvided(String, String),
    #[error("Token was not provided")]
    Missing,
    #[error("Token was provided but invalid")]
    Invalid,

    /// Access related errors
    #[error("This endpoint requires the `{0}` permission")]
    MissesPermission(UserPermissions),
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Database(#[from] rusqlite::Error),

    #[error(transparent)]
    UserErr(UserManagerErrors),

    #[error(transparent)]
    InviteErr(InviteManagerErrors),

    #[error(transparent)]
    Validation(#[from] ValidationErrors),

    #[error(transparent)]
    ApiError(ApiErrors),

    #[error(transparent)]
    IOError(#[from] io::Error),

    #[error(transparent)]
    WebToken(#[from] jsonwebtoken::errors::Error)
}

#[derive(Serialize, Deserialize)]
pub struct ApiSuccessResponse<T: Serialize> {
    pub data: T,
    pub ok: bool,
    pub code: Status
}

pub type Result<T, E = Error> = std::result::Result<ApiSuccessResponse<T>, E>;