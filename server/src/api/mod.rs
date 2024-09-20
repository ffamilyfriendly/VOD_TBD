use rocket::Route;
mod user;
mod invite;
mod content;

pub struct RouteHelper {
    pub base: String,
    pub routes: Vec<Route>
}

pub fn routes() -> Vec<RouteHelper> {
    let user = RouteHelper {
        base: "/auth/".to_owned(),
        routes: user::routes()
    };

    let invite = RouteHelper {
        base: "/invite".to_owned(),
        routes: invite::routes()
    };

    let content = RouteHelper {
        base: "/content".to_owned(),
        routes: content::routes()
    };

    vec![user, invite, content]
}