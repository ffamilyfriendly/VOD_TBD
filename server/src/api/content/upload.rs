use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::managers::content_manager::{self, Entity, Source, Upload};
use crate::utils::jwt::ActiveToken;
use crate::datatypes::error::definition::Result;


#[derive(Validate, Serialize, Deserialize)]
pub struct NewEntity {
    parent: Option<String>,
    entity_type: u8
}

#[post("/entity", data = "<input>")]
pub fn create_entity(token: ActiveToken, input: Json<NewEntity>) -> Result<Entity> {
    input.validate()?;
    token.get_perms().has_or_err(&crate::managers::user_manager::UserPermissions::ManageContent)?;

    let entity = content_manager::create_entity(input.entity_type.clone().into(), input.parent.clone())?;

    Ok(entity.into())
}

#[derive(Validate, Serialize, Deserialize)]
pub struct NewSource {
    parent: String,
    size: u64
}

#[post("/source", data = "<input>")]
pub fn create_source(token: ActiveToken, input: Json<NewSource>) -> Result<Source> {
    input.validate()?;
    token.get_perms().has_or_err(&crate::managers::user_manager::UserPermissions::ManageContent)?;

    let source = content_manager::create_source(input.parent.clone(), input.size, token.uid)?;
    content_manager::create_upload(&source.source_id, &input.size)?;

    Ok(source.into())
}

type Data = [u8];

#[post("/upload/<id>", data = "<data>")]
pub fn upload_data(token: ActiveToken, id: &str, data: &Data) -> Result<Upload> {
    token.get_perms().has_or_err(&crate::managers::user_manager::UserPermissions::ManageContent)?;
    
    Ok(content_manager::write_to_upload(id, data)?.into())
}