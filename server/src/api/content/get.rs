use crate::managers::content_manager::{self, Source};
use crate::utils::jwt::ActiveToken;
use crate::datatypes::error::definition::Result;


#[get("/<id>/sources")]
pub fn get_sources(id: &str, token: ActiveToken) -> Result<Vec<Source>> {
    token.get_perms().has_or_err(&crate::managers::user_manager::UserPermissions::ManageContent)?;
    Ok(content_manager::get_sources(id)?.into())
}
