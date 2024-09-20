use rocket::Route;
mod upload;

pub fn routes() -> Vec<Route>  {
    routes![upload::create_source, upload::upload_data]
}