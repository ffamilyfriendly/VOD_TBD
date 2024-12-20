use serde::{Deserialize, Serialize};
use rocket::serde::json::Json;
use validator::Validate;

use crate::{datatypes::error::definition::Result, managers::invite_manager::{self, Invite}, utils::jwt::ActiveToken};

#[get("/<id>")]
pub fn get_invite(id: &str) -> Result<Invite> {
    Ok(invite_manager::get_invite(&id)?.into())
}

#[get("/all")]
pub fn get_all_invites(token: ActiveToken) -> Result<Vec<Invite>> {
    has_permission!(token, ManageUsers);
    Ok(invite_manager::get_all_invites()?.into())
}

#[derive(Validate, Serialize, Deserialize)]
pub struct NewInvite {
    #[validate(length(min = 5, max = 100, message = "must be 5-100 characters long"))]
    id: String,
    expires: u64,
    uses: u16
}

#[post("/create", data = "<input>")]
pub fn create_invite(token: ActiveToken, input: Json<NewInvite>) -> Result<Invite> {
    has_permission!(token, ManageUsers);
    input.validate()?;
    
    Ok(invite_manager::create_invite(&input.id.replace(" ", "-"), input.expires, input.uses, Some(token.uid))?.into())
}

#[delete("/<id>")]
pub fn delete_invite(token: ActiveToken, id: &str) -> Result<usize> {
    has_permission!(token, ManageUsers);
    
    Ok(invite_manager::delete_invite(&id)?.into())
}
