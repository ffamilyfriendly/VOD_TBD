use rocket::Route;
mod upload;
mod get;
mod tmdb;
mod tagging;

pub fn routes() -> Vec<Route>  {
    routes![
        // Content rest
        upload::create_source, upload::upload_data, upload::create_entity, upload::delete_source, upload::edit_metadata,
        // content GETs
        get::get_sources, get::get_source, get::get_entity, get::get_metadata, get::get_collection, get::get_collections, 
        // TMDB
        tmdb::create_from_series_id,
        // Tags
        tagging::get_content_tags, tagging::add_tag_to_content, tagging::remove_tag_from_content, tagging::add_tag, tagging::delete_tag, tagging::query_tags
    ]
}