use rocket::request::{ Outcome, Request, FromRequest };
use rocket::http::Status;
use serde::{ de::DeserializeOwned, Deserialize, Serialize };
use jsonwebtoken::{ encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey };
use std::time::{ SystemTime, UNIX_EPOCH };

use crate::datatypes::error::definition::ApiErrors;
use crate::managers::user_manager::PermissionsResolver;

/* User JWT struct */
#[ derive(Serialize, Deserialize) ]
pub struct ActiveToken {
    pub exp: u64, /* when token expires */
    pub sub: String, /* subject (email) */
    /* okapi specific properties */
    pub uid: u16, /* User id */
    pub permissions: u8, /* u16 int leaves us with 16 diff perms / flags. Should be enough */
    pub token_type: String
}

impl ActiveToken {
    pub fn get_perms(&self) -> PermissionsResolver {
        PermissionsResolver { int_rep: self.permissions }
    }
}

/* User JWT struct */
#[ derive(Serialize, Deserialize) ]
pub struct RefreshToken {
    pub exp: u64, /* when token expires */
    pub sub: String, /* subject (email) */
    pub token_type: String
}

pub enum TimeOffsets {
    Minute = 60,
    FiveMinutes = 60 * 5,
    Hour = 60 * 60,
    Day = 60 * 60 * 24,
    Week = 60 * 60 * 24 * 7,
    Month = 60 * 60 * 24 * 30,
    HalfYear = 60 * 60 * 24 * 30 * 6,
}


impl From<TimeOffsets> for u64 {
    fn from(value: TimeOffsets) -> Self {
        value as u64
    }
}

pub fn get_timestamp(offset: u64) -> u64 {
    //1000 * 60 * 60 * 24 * 30 * 6
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() + offset
}

pub fn gen_token<T: Serialize>(user: &T) -> String {
    let token = encode(&Header::new(Algorithm::default()), user, &EncodingKey::from_secret(include_bytes!("secret.txt")));
    token.unwrap()
}

pub fn get_token<T: DeserializeOwned>(token: String) -> Result<T, jsonwebtoken::errors::Error> {
    Ok(decode::<T>(&token, &DecodingKey::from_secret(include_bytes!("secret.txt")), &Validation::default())?.claims)
}

pub fn passes<T: DeserializeOwned>(token: String) -> bool {
    match get_token::<T>(token) {
        Ok(_) => true,
        Err(_) => false
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ActiveToken {
    type Error = ApiErrors;

    async fn from_request( req: &'r Request<'_> ) -> Outcome<Self, Self::Error> {
        let token = req.headers().get_one("token");
        match token {
            Some(token) => {
                let t = match get_token::<ActiveToken>(token.to_string()) {
                    Ok(t) => match t.token_type.as_str() {
                        "active" => t,
                        _ => return Outcome::Error((Status::Unauthorized, ApiErrors::WrongTokenTypeProvided(t.token_type, "active".to_owned())))
                    },
                    Err(_e) => return Outcome::Error((Status::Unauthorized, ApiErrors::Invalid))
                };
                Outcome::Success(t)
            }
            None => Outcome::Error((Status::Unauthorized, ApiErrors::Missing))
        }
    }
}