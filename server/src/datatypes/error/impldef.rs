use rocket::{http::{ContentType, Status}, response::Responder, Response};
use serde::Serialize;

use super::definition::{ApiErrors, ApiSuccessResponse, Error, InviteManagerErrors, UserManagerErrors};

impl From<UserManagerErrors> for Error {
    fn from(value: UserManagerErrors) -> Self {
        Error::UserErr(value)
    }
}

impl From<InviteManagerErrors> for Error {
    fn from(value: InviteManagerErrors) -> Self {
        Error::InviteErr(value)
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
            ApiErrors::WrongCredentialsProvided | ApiErrors::Missing | ApiErrors::MissesPermission(_) => Status::Unauthorized,
            ApiErrors::WrongTokenTypeProvided(_, _) | ApiErrors::Invalid => Status::BadRequest,
            ApiErrors::CantHoldSource(_) => Status::NotAcceptable
        },

        Error::InviteErr(e) => match e {
            InviteManagerErrors::NotFound(_) => Status::NotFound,
            InviteManagerErrors::Deplated | InviteManagerErrors::Expired => Status::Gone
        },

        Error::IOError(_) => Status::InternalServerError,

        Error::Database(_e) => Status::InternalServerError,
        Error::Validation(_e)       => Status::BadRequest,
        Error::WebToken(_) => Status::InternalServerError,
        _ => Status::InternalServerError
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

impl<T: Serialize> From<T> for ApiSuccessResponse<T> {
    fn from(value: T) -> Self {
        ApiSuccessResponse {
            ok: true,
            code: Status::Ok,
            data: value
        }
    }
}

impl<'r, T: Serialize> Responder<'r, 'static> for ApiSuccessResponse<T> {
    fn respond_to(self, _request: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let res = serde_json::to_string::<ApiSuccessResponse<T>>(&self).expect("hello");

        Response::build()
        .status(Status::Ok)
        .sized_body(res.len(), std::io::Cursor::new(res))
        .ok()
    }
}