use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::datatypes::error::definition::Result;

use crate::managers::tmdb_manager;
use crate::utils::jwt::ActiveToken;

#[derive(Validate, Serialize, Deserialize)]
pub struct NewSeriesFrom {
    tmdb_id: u64
}

#[post("/series/import", data = "<input>")]
pub async fn create_from_series_id(token: ActiveToken, input: Json<NewSeriesFrom>) -> Result<String> {
    has_permission!(token, ManageContent);
    tmdb_manager::create_series_from_tmdb_id(&input.tmdb_id).await?;
    Ok("hi".to_owned().into())
}