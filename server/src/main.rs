#[macro_use] extern crate rocket;
#[macro_use] mod macros;
pub mod managers;
pub mod api;
pub mod datatypes;
pub mod utils;


use std::{str::FromStr, u64::MAX};

use api::routes;
use managers::{db, invite_manager::{create_invite, get_invite}};
use rocket_cors::{AllowedHeaders, AllowedMethods, AllowedOrigins};

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

    let allowed_methods: AllowedMethods = ["Get", "Post", "Delete", "Options", "Patch", "Put"]
    .iter()
    .map(|s| FromStr::from_str(s).unwrap())
    .collect();

    let cors = rocket_cors::CorsOptions {
        allowed_origins: AllowedOrigins::all(),
        allowed_methods: allowed_methods,
        allowed_headers: AllowedHeaders::some(&["token", "Accept"]),
        max_age: Some(86400),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors().unwrap();

    rocket = rocket.attach(cors);

    rocket
}
