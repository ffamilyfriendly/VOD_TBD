use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::datatypes::error::definition::Result;

use crate::managers::tmdb_manager::{self, MovieResult, SeriesResult};
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

#[post("/movie/<id>/import", data = "<input>")]
pub async fn overwrite_from_movie_id(token: ActiveToken, input: Json<NewSeriesFrom>, id: &str) -> Result<String> {
    has_permission!(token, ManageContent);
    tmdb_manager::overwrite_movie_meta(id, &input.tmdb_id).await?;
    Ok("hi".to_owned().into())
}

#[get("/movies/search?<query>")]
pub async fn search_movie_meta(token: ActiveToken, query: &str) -> Result<Vec<MovieResult>> {
    has_permission!(token, ManageContent);
    Ok(tmdb_manager::search_movie_metadata(query).await?.into())
}

#[get("/series/search?<query>")]
pub async fn search_series_meta(token: ActiveToken, query: &str) -> Result<Vec<SeriesResult>> {
    has_permission!(token, ManageContent);
    let res = tmdb_manager::search_series_metadata(query).await;

    if res.is_err() {
        println!("WTF: {:?}", res);
    }

    Ok(tmdb_manager::search_series_metadata(query).await?.into())
}