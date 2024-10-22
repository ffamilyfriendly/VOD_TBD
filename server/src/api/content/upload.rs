use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::managers::content_manager::{self, Entity, EntityType, MetadataUpdate, Source, Upload};
use crate::utils::jwt::ActiveToken;
use crate::datatypes::error::definition::{ApiErrors, Result};

#[derive(Validate, Serialize, Deserialize)]
pub struct NewEntity {
    parent: Option<String>,
    entity_type: u8
}

#[post("/entity", data = "<input>")]
pub fn create_entity(token: ActiveToken, input: Json<NewEntity>) -> Result<Entity> {
    has_permission!(token, ManageContent);
    input.validate()?;

    let entity = content_manager::create_entity(input.entity_type.clone().into(), input.parent.clone(), None)?;
    content_manager::create_empty_metadata(&entity.entity_id)?;

    Ok(entity.into())
}

#[patch("/<id>/metadata", data = "<input>")]
pub fn edit_metadata(token: ActiveToken, id: &str, input: Json<MetadataUpdate>) -> Result<usize> {
    has_permission!(token, ManageContent);
    Ok(content_manager::update_metadata(id, input.into_inner())?.into())
}

#[derive(Validate, Serialize, Deserialize)]
pub struct NewSource {
    parent: String,
    size: u64,
    filetype: String
}

#[post("/source", data = "<input>")]
pub fn create_source(token: ActiveToken, input: Json<NewSource>) -> Result<Source> {
    has_permission!(token, ManageContent);
    input.validate()?;

    let parent = content_manager::get_entity(&input.parent)?;

    // Ensure only entities which should hold sources can hold sources
    match parent.entity_type {
        EntityType::Series | EntityType::SeriesSeason => return Err(ApiErrors::CantHoldSource.into()),
        _ => { }
    }

    let source = content_manager::create_source(input.parent.clone(), input.size, token.uid)?;
    content_manager::create_upload(&source.source_id, &input.size, input.filetype.clone())?;

    Ok(source.into())
}

#[delete("/source/<id>")]
pub fn delete_source(token: ActiveToken, id: &str) -> Result<usize> {
    has_permission!(token, ManageContent);

    Ok(content_manager::delete_source(id)?.into())
}

type Data = [u8];

#[post("/<id>/upload", data = "<data>")]
pub fn upload_data(token: ActiveToken, id: &str, data: &Data) -> Result<Upload> {
    has_permission!(token, ManageContent);
    
    Ok(content_manager::write_to_upload(id, data)?.into())
}