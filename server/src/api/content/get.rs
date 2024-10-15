use crate::managers::content_manager::{self, Collection, Entity, EntitySelectOptions, MetaData, Source};
use crate::utils::jwt::ActiveToken;
use crate::datatypes::error::definition::Result;
use rocket::form::Lenient;


#[get("/<id>/sources")]
pub fn get_sources(id: &str, _token: ActiveToken) -> Result<Vec<Source>> {
    Ok(content_manager::get_sources(id)?.into())
}

#[get("/<_ent_id>/source/<id>")]
pub fn get_source(id: &str, _ent_id: &str, _token: ActiveToken) -> Result<Source> {
    Ok(content_manager::get_source(id)?.into())
}

#[get("/<id>/collection")]
pub fn get_collection(id: &str, _token: ActiveToken) -> Result<Collection> {
    Ok(content_manager::get_collection(id)?.into())
}

#[get("/<id>/entity")]
pub fn get_entity(id: &str, _token: ActiveToken) -> Result<Entity> {
    Ok(content_manager::get_entity(id)?.into())
}

#[get("/<id>/metadata")]
pub fn get_metadata(id: &str, _token: ActiveToken) -> Result<MetaData> {
    Ok(content_manager::get_metadata(id)?.into())
}

#[get("/<parent>/collections?<data..>")]
pub fn get_collections(parent: &str, data: Lenient<EntitySelectOptions>, _token: ActiveToken) -> Result<Vec<Collection>> {
    Ok(content_manager::get_collections(parent, data.into_inner())?.into())
}