use std::{future::Future, string};

use rocket::response::content;
use serde::{Deserialize, Serialize};

use crate::{datatypes::error::definition::Error, utils::config::load_config};

use super::{content_manager::{self, MetadataUpdate}, tag_manager};

#[derive(Serialize, Deserialize, Debug)]
pub struct MovieResult {
    adult: bool,
    backdrop_path: Option<String>,
    genre_ids: Vec<u64>,
    id: u64,
    original_language: String,
    original_title: String,
    overview: String,
    popularity: f64,
    poster_path: String,
    release_date: String,
    title: String,
    video: bool,
    vote_average: f64,
    vote_count: u64
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Genre {
    id: u64,
    name: String
}

#[derive(Deserialize)]
pub struct MultiResult<T> {
    results: Vec<T>
}

pub async fn search_movie_metadata(query: &str) -> Result<Vec<MovieResult>, Error> {
    let resp = get_authed_client(format!("https://api.themoviedb.org/3/search/movie?query={}", query)).await?.json::<MultiResult<MovieResult>>().await?;
    Ok(resp.results)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SeriesResult {
    adult: bool,
    backdrop_path: Option<String>,
    genre_ids: Vec<u64>,
    id: u64,
    origin_country: Vec<String>,
    original_language: String,
    original_name: String,
    overview: String,
    popularity: f64,
    poster_path: Option<String>,
    first_air_date: String,
    name: String,
    vote_average: f64,
    vote_count: u64
}

pub async fn search_series_metadata(query: &str) -> Result<Vec<SeriesResult>, Error> {
    let resp = get_authed_client(format!("https://api.themoviedb.org/3/search/tv?query={}", query)).await?.json::<MultiResult<SeriesResult>>().await?;
    Ok(resp.results)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Season {
    air_date: String,
    episode_count: u8,
    id: u64,
    name: String,
    overview: String,
    poster_path: String,
    season_number: u8,
    vote_average: f64
}

#[derive(Serialize, Deserialize, Debug)]
// This struct has a lot of overlap with a simple SeriesResult so I will take the liberty to not include everything
pub struct SeriesDetails {
    genres: Vec<Genre>,
    in_production: bool,
    seasons: Vec<Season>,
    poster_path: String,
    backdrop_path: String,
    vote_average: f64,
    overview: String,
    last_air_date: String,
    original_language: String,
    name: String,
}

fn get_authed_client(url: String) -> impl Future<Output = std::result::Result<reqwest::Response, reqwest::Error>> {
    let conf = load_config().expect("no can load config");
    let client = reqwest::Client::new();
    client.get(url).bearer_auth(conf.secrets.tmdb_key).send()
}

pub async fn get_series_details(series_id: &u64) -> Result<SeriesDetails, Error> {
    println!("trying to get data with key: {}\nurl= {}", "NVM", format!("https://api.themoviedb.org/3/tv/{}", series_id));

    let resp = get_authed_client(format!("https://api.themoviedb.org/3/tv/{}", series_id)).await?.json::<SeriesDetails>().await?;
    Ok(resp)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SeriesEpisode {
    air_date: Option<String>,
    episode_number: u64,
    id: u64,
    name: String,
    overview: String,
    season_number: u64,
    vote_average: f64,
    vote_count: u64,
    still_path: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SeasonDetails {
    episodes: Vec<SeriesEpisode>,
    air_date: String,
    name: String,
    poster_path: String
}

pub async fn get_season_details(series_id: &u64, season: &u8) -> Result<SeasonDetails, Error> {
    let resp = get_authed_client(format!("https://api.themoviedb.org/3/tv/{}/season/{}", series_id, season)).await?.json::<SeasonDetails>().await?;
    Ok(resp)
}

fn create_series_episode(episode: &SeriesEpisode, parent: String) -> Result<(), Error> {
    let entity = content_manager::create_entity(content_manager::EntityType::SeriesEpisode, Some(parent), Some(episode.episode_number as u16))?;
    content_manager::create_empty_metadata(&entity.entity_id)?;
    content_manager::update_metadata(&entity.entity_id, MetadataUpdate { thumbnail: Some(format!("https://image.tmdb.org/t/p/w780{}", episode.still_path)), backdrop: None, description: Some(episode.overview.clone()), ratings: Some(episode.vote_average), language: None, release_date: episode.air_date.clone(), title: Some(episode.name.clone()) })?;

    Ok(())
}

async fn create_series_season(season: &Season, series_id: &u64, parent: String) -> Result<(), Error> {
    let entity = content_manager::create_entity(content_manager::EntityType::SeriesSeason, Some(parent), Some(season.season_number as u16))?;
    content_manager::create_empty_metadata(&entity.entity_id)?;
    content_manager::update_metadata(&entity.entity_id, MetadataUpdate { thumbnail: Some(format!("https://image.tmdb.org/t/p/w780{}", season.poster_path)), backdrop: None, description: Some(season.overview.clone()), ratings: Some(season.vote_average), language: None, release_date: Some(season.air_date.clone()), title: Some(season.name.clone()) })?;

    let episode_data = get_season_details(series_id, &season.season_number).await?;

    for episode in episode_data.episodes {
        println!("  Creating episode {} ({})", episode.episode_number, episode.name);
        create_series_episode(&episode, entity.entity_id.clone())?;
    }

    Ok(())
}

pub fn handle_tags(tags: Vec<Genre>, entity_id: &str) -> Result<(), Error> {
    for genre in tags {
        let id_as_string = genre.id.to_string();

        // Try to fetch the genre as a tag if it already exists...
        let tag = match tag_manager::get_tag(&id_as_string) {
            Ok(t) => t,
            Err(e) => match e {

                Error::Database(db_error) => match db_error {
                    // or create it if it does not
                    rusqlite::Error::QueryReturnedNoRows => tag_manager::create_known_tag(id_as_string, genre.name, get_preset_colour(genre.id))?,
                    any_error => Err(any_error)?
                },

                any_error => Err(any_error)?
            }
        };

        // Apply the genre tag to the content
        tag_manager::tag_content(&tag.tag_id, entity_id)?;
    };
    Ok(())
}

pub async fn create_series_from_tmdb_id(series_id: &u64) -> Result<(), Error> {
    let entity = content_manager::create_entity(content_manager::EntityType::Series, None, None)?;
    content_manager::create_empty_metadata(&entity.entity_id)?;

    let series_meta = get_series_details(series_id).await?;

    handle_tags(series_meta.genres, &entity.entity_id)?;

    content_manager::update_metadata(&entity.entity_id, MetadataUpdate {
        backdrop: Some(format!("https://image.tmdb.org/t/p/w780{}", series_meta.backdrop_path)),
        thumbnail: Some(format!("https://image.tmdb.org/t/p/w780{}", series_meta.poster_path)),
        description: Some(series_meta.overview),
        ratings: Some(series_meta.vote_average),
        language: Some(series_meta.original_language),
        release_date: Some(series_meta.last_air_date),
        title: Some(series_meta.name)
    })?;

    for season in series_meta.seasons {
        println!("Creating season {} ({})", season.season_number, season.name);
        create_series_season(&season, &series_id, entity.entity_id.clone()).await?
    }

    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExtendedMovieResult {
    pub adult: bool,
    pub backdrop_path: Option<String>,
    pub genres:  Vec<Genre>,
    pub id: u64,
    pub original_language: String,
    pub original_title: String,
    pub overview: String,
    pub poster_path: String,
    pub release_date: String,
    pub title: String,
    pub vote_average: f64
}

pub async fn get_movie_meta(movie_id: &u64) -> Result<ExtendedMovieResult, Error> {
    let resp = get_authed_client(format!("https://api.themoviedb.org/3/movie/{}", movie_id)).await?.json::<ExtendedMovieResult>().await?;
    Ok(resp)
}

pub async fn overwrite_movie_meta(entity_id: &str, movie_id: &u64) -> Result<(), Error> {
    let meta = get_movie_meta(movie_id).await?;

    let backdrop_img = match meta.backdrop_path {
        Some(bd) => Some(format!("https://image.tmdb.org/t/p/w780{}", bd)),
        None => None
    };

    content_manager::update_metadata(entity_id, MetadataUpdate { thumbnail: Some(format!("https://image.tmdb.org/t/p/w780{}",meta.poster_path)), backdrop: backdrop_img, description: Some(meta.overview), ratings: Some(meta.vote_average), language: Some(meta.original_language), release_date: Some(meta.release_date), title: Some(meta.title) })?;

    handle_tags(meta.genres, entity_id)?;

    Ok(())
}

/// Function that returns a default colour for tags from tmdb
pub fn get_preset_colour(id: u64) -> String {
    match id {
        // Drama
        18 => "#800020",
        // Crime
        80 => "#2C3E50",
        // Comedy
        35 => "#FFD700",
        // Mystery
        9648 => "#4B0082",
        // Thriller
        53 => "#8B0000",
        // Catchall
        _ => "#800020",
    }.to_owned()
}
