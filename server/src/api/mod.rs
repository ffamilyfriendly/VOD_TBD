use rocket::Route;
mod user;

pub struct RouteHelper {
    pub base: String,
    pub routes: Vec<Route>
}

pub fn routes() -> Vec<RouteHelper> {
    let user = RouteHelper {
        base: "/auth/".to_owned(),
        routes: user::routes()
    };

    vec![user]
}