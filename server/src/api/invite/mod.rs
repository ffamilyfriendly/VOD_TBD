use rocket::Route;
mod invite;

pub fn routes() -> Vec<Route>  {
    routes![invite::get_invite]
}