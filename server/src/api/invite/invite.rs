use rocket::serde::json::Json;

use crate::{datatypes::error::definition::Result, managers::invite_manager::{self, Invite}};

#[get("/<id>")]
pub fn get_invite(id: String) -> Result<Invite> {
    Ok(invite_manager::get_invite(&id)?.into())
}