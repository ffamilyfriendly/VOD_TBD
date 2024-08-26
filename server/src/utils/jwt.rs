use serde::{ de::DeserializeOwned, Deserialize, Serialize };
use jsonwebtoken::{ encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey };
use std::time::{ SystemTime, UNIX_EPOCH };

/* User JWT struct */
#[ derive(Serialize, Deserialize) ]
pub struct ActiveToken {
    pub exp: u128, /* when token expires */
    pub sub: String, /* subject (email) */
    /* okapi specific properties */
    pub uid: u16, /* User id */
    pub permissions: u8, /* u16 int leaves us with 16 diff perms / flags. Should be enough */
    pub token_type: String
}

/* User JWT struct */
#[ derive(Serialize, Deserialize) ]
pub struct RefreshToken {
    pub exp: u128, /* when token expires */
    pub sub: String, /* subject (email) */
    pub token_type: String
}

pub enum TimeOffsets {
    Minute = 1000 * 60,
    FiveMinutes = 1000 * 60 * 5,
    Hour = 1000 * 60 * 60,
    Day = 1000 * 60 * 60 * 24,
    Week = 1000 * 60 * 60 * 24 * 7,
    Month = 1000 * 60 * 60 * 24 * 30,
    HalfYear = 1000 * 60 * 60 * 24 * 30 * 6,
}

impl From<TimeOffsets> for u128 {
    fn from(value: TimeOffsets) -> Self {
        value as u128
    }
}

pub fn get_timestamp(offset: u128) -> u128 {
    //1000 * 60 * 60 * 24 * 30 * 6
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() + offset
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