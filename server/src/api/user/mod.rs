use rocket::Route;
mod login;

pub fn routes() -> Vec<Route>  {
    routes![login::login]
}