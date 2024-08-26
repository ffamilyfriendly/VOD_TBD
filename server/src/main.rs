#[macro_use] extern crate rocket;
pub mod managers;
pub mod api;


use api::routes;
use managers::db;
#[get("/")]
fn index() -> &'static str {
    "db::aids()"
}



#[launch]
fn rocket() -> _ {
    db::ensure_tables().expect("Could not create tables");
    let mut rocket = rocket::build();

    for route in routes() {
        rocket = rocket.mount(route.base, route.routes);
    }

    rocket
}
