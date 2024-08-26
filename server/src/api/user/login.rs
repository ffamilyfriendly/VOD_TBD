use rocket::serde::json::Json;
use rocket::response::Result;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::managers::user_manager;

#[derive(Validate, Serialize, Deserialize)]
pub struct UserLogin {
    #[validate(email(message = "that is not what an email adress looks like, dummy"))]
    email: String,
    #[validate(length(min = 5, message = "your password must be 5 characters or longer"))]
    password: String,
}

// TODO: create result type or something idk man
#[post("/login", data = "<input>")]
pub fn login(input: Json<UserLogin>) -> Result<String> { 
    input.validate()?;

    let user = match user_manager::get_user(&input.email) {
        Ok(user) => user,
        Err(_e) => return Err("no".to_owned())
    };

    if !user_manager::compare_password(&input.password, &user.password) {
        return Err("FUCK NO".to_owned())
    }

    Ok("hello".to_owned())
}