#[macro_use] extern crate rocket;
pub mod managers;
pub mod api;
pub mod datatypes;
pub mod utils;


use std::u64::MAX;

use api::routes;
use managers::{db, invite_manager::{create_invite, get_invite}};

#[launch]
fn rocket() -> _ {
    db::ensure_tables().expect("Could not create tables");
    let mut rocket = rocket::build();

    match get_invite("first_time_setup") {
        Ok(_) => { },
        Err(_e) => {
            create_invite("first_time_setup", MAX/2, 1, None).expect("could not create setup invite");
        }
    }

    for route in routes() {
        rocket = rocket.mount(route.base, route.routes);
    }

    rocket
}
