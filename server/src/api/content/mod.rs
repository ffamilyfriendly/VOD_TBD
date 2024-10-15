use rocket::Route;
mod upload;
mod get;

pub fn routes() -> Vec<Route>  {
    routes![upload::create_source, upload::upload_data, upload::create_entity, get::get_sources, get::get_source, get::get_entity, get::get_metadata, get::get_collection, get::get_collections, upload::delete_source, upload::edit_metadata]
}