use rocket::Route;
mod invite;

pub fn routes() -> Vec<Route>  {
    routes![invite::get_invite, invite::create_invite, invite::delete_invite, invite::get_all_invites]
}