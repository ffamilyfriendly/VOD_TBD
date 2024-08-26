use rocket::Route;
mod auth;

pub fn routes() -> Vec<Route>  {
    routes![auth::login, auth::register, auth::refresh, auth::delete]
}