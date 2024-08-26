use validator::ValidationErrors;

#[derive(thiserror::Error, Debug)]
pub enum UserManagerErrors {
    #[error("User with email `{0}` was not found")]
    NotFound(String),
    #[error("Validation failed")]
    ValidationError
}

#[derive(thiserror::Error, Debug)]
pub enum ApiErrors {
    /// Auth related errors
    #[error("Incorrect login details were provided.")]
    WrongCredentialsProvided,
    #[error("Token of incorrect type was provided. Got `{0}` expected `{1}`")]
    WrongTokenTypeProvided(String, String)
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Database(#[from] rusqlite::Error),

    #[error(transparent)]
    UserErr(UserManagerErrors),

    #[error(transparent)]
    Validation(#[from] ValidationErrors),

    #[error(transparent)]
    ApiError(ApiErrors),

    #[error(transparent)]
    WebToken(#[from] jsonwebtoken::errors::Error)
}

pub type Result<T, E = Error> = std::result::Result<T, E>;