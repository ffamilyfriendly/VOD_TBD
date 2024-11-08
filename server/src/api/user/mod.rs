use rocket::Route;
mod auth;
mod management;

pub fn routes() -> Vec<Route>  {
    routes![
        auth::login, auth::register, auth::refresh, auth::delete, auth::get_current_user,
    ]
}

pub fn manage_users_routes() -> Vec<Route> {
    routes![
        management::get_all_users, management::update_password, management::update_user
    ]
}