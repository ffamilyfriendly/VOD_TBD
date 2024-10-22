use rocket::serde::json::Json;
use serde::Deserialize;

use crate::{datatypes::error::definition::Result, managers::tag_manager::{self, Tag}, utils::jwt::ActiveToken};

#[get("/<id>/tags")]
pub fn get_content_tags(id: &str, _token: ActiveToken) -> Result<Vec<Tag>> {
    Ok(tag_manager::get_tags_on_entity(id)?.into())
}

#[derive(Deserialize)]
pub struct AddTag {
    tag_id: String
}

#[put("/<id>/tags", data= "<data>")]
pub fn add_tag_to_content(id: &str, token: ActiveToken, data: Json<AddTag>) -> Result<usize> {
    has_permission!(token, ManageContent);

    Ok(tag_manager::tag_content(&data.tag_id, id)?.into())
}

#[delete("/<entity_id>/tags/<tag_id>")]
pub fn remove_tag_from_content(entity_id: &str, tag_id: &str, token: ActiveToken) -> Result<usize> {
    has_permission!(token, ManageContent);

    Ok(tag_manager::untag_content(tag_id, entity_id)?.into())
}

#[derive(Deserialize)]
pub struct NewTag {
    title: String,
    colour: String
}

#[post("/tags", data = "<data>")]
pub fn add_tag(token: ActiveToken, data: Json<NewTag>) -> Result<Tag> {
    has_permission!(token, ManageContent);

    Ok(tag_manager::create_tag(data.title.to_owned(), data.colour.to_owned())?.into())
}

#[delete("/tags/<tag_id>")]
pub fn delete_tag(token: ActiveToken, tag_id: &str) -> Result<usize> {
    has_permission!(token, ManageContent);
    Ok(tag_manager::delete_tag(tag_id)?.into())
}

#[get("/tags?<query>")]
pub fn query_tags(_token: ActiveToken, query: &str) -> Result<Vec<Tag>> {
    Ok(tag_manager::get_tags_with_title(query)?.into())
}