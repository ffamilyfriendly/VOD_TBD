use rocket::{http::{ContentType, Status}, response::Responder, Response};
use serde::Serialize;

use super::definition::{ApiErrors, Error, UserManagerErrors};

impl From<UserManagerErrors> for Error {
    fn from(value: UserManagerErrors) -> Self {
        Error::UserErr(value)
    }
}

impl From<ApiErrors> for Error {
    fn from(value: ApiErrors) -> Self {
        Error::ApiError(value)
    }
}

fn get_status(e: &Error) -> Status {
    match e {
        Error::UserErr(e) => match e {
            UserManagerErrors::NotFound(_)         =>   Status::NotFound,
            UserManagerErrors::ValidationError  =>      Status::BadRequest
        },

        Error::ApiError(e) => match e {
            ApiErrors::WrongCredentialsProvided => Status::Unauthorized,
            ApiErrors::WrongTokenTypeProvided(_, _) => Status::BadRequest
        },

        Error::Database(_e) => Status::InternalServerError,
        Error::Validation(_e)       => Status::BadRequest,
        Error::WebToken(_) => Status::InternalServerError
    }
}

#[derive(Serialize)]
struct ErrorResponse {
    // always going to be false
    ok:         bool,
    code:       Status,
    data: ErrorDetails
}

#[derive(Serialize)]
struct ErrorDetails {
    message:        String
}

impl<'r> Responder<'r, 'static> for Error {
    fn respond_to(self, _request: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let code = get_status(&self);
        let res = ErrorResponse { 
            ok: false,
            code: code,
            data: ErrorDetails {
                message: self.to_string()
            }
        };
        let res_data = serde_json::to_string(&res).expect("no");

        Response::build()
            .header(ContentType::JSON)
            .status(code)
            .sized_body(res_data.len(), std::io::Cursor::new(res_data))
            .ok()
    }
}