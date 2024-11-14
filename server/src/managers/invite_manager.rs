use rocket::http::ext::IntoCollection;
use rusqlite::{named_params, types::Null};
use serde::{Deserialize, Serialize};

use crate::{datatypes::error::definition::{ Error, InviteManagerErrors }, utils::jwt::get_timestamp};

use super::db::get_connection;

// invites (id TEXT PRIMARY KEY, uses INTEGER NOT NULL, expires DATE NOT NULL, creator_uid INTEGER, FOREIGN KEY(creator_uid) REFERENCES users(id)
#[derive(Serialize, Deserialize)]
pub struct Invite {
    pub id: String,
    pub uses: u16,
    pub expires: u64,
    pub creator_uid: Option<u16>,
    pub creator_username: Option<String>
}

impl Invite {
    /// Will return if the invite has expired
    pub fn has_expired(&self) -> bool {
        get_timestamp(0) > self.expires
    }

    /// Will return if the invite still has uses left
    pub fn has_depleted(&self) -> bool {
        self.uses < 1
    }

    /// Will return wheter or not the invite is valid
    pub fn is_valid(&self) -> bool {
        !self.has_expired() && !self.has_depleted()
    }

    /// Will return true if the invite is valid or an appropriate error if not
    pub fn is_valid_err(&self) -> Result<bool, InviteManagerErrors> {
        if self.has_expired() {
            return Err(InviteManagerErrors::Expired)
        }
        if self.has_depleted() {
            return Err(InviteManagerErrors::Deplated)
        }
        Ok(true)
    }
}

pub fn create_invite(id: &str, expires: u64, uses: u16, creator: Option<u16>) -> Result<Invite, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("INSERT INTO invites VALUES (?1, ?2, ?3, ?4)")?;
    
    stmt.raw_bind_parameter(1, id)?;
    stmt.raw_bind_parameter(2, uses)?;
    stmt.raw_bind_parameter(3, expires)?;
    match creator {
        Some(c)     =>     stmt.raw_bind_parameter(4, c)?,
        None             =>     stmt.raw_bind_parameter(4, Null)?,
    }
    stmt.raw_execute()?;
    
    Ok(Invite {
        id: id.to_string(),
        expires,
        uses,
        creator_uid: creator,
        creator_username: None
    })
}

pub fn update_invite(id: &str, expires: Option<u64>, uses: Option<u16>) -> Result<usize, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("UPDATE invites SET expires = coalesce(:expires, expires), uses = coalesce(:uses, uses) WHERE id = :id")?;
    Ok(stmt.execute(named_params! { ":id": id, ":expires": expires, ":uses": uses })?)
}

/// Will remove 1 from the invites "uses" col
pub fn subtract_from_invite(id: &str) -> Result<usize, Error> {
    let con = get_connection()?;
    Ok(con.execute("UPDATE invites SET uses = uses - 1 WHERE id = ?", [id])?)
}

pub fn get_invite(id: &str) -> Result<Invite, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("SELECT *, (SELECT name FROM users WHERE id = invites.creator_uid) AS creator_username FROM invites WHERE id = ?")?;
    
    match stmt.query_row([id], |f| { 
        Ok(Invite { 
            id:         f.get(0)?,
            uses:      f.get(1)?,
            expires:       f.get(2)?,
            creator_uid:   f.get(3)?,
            creator_username: f.get(4)?
         })
     }) {
        Ok(d) => Ok(d),
        Err(e) => {
            if e == rusqlite::Error::QueryReturnedNoRows {
                return Err(InviteManagerErrors::NotFound(id.to_string()).into())
            }
            Err(e.into())
        }
     }
}

pub fn get_all_invites() -> Result<Vec<Invite>, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("SELECT *, (SELECT name FROM users WHERE id = invites.creator_uid) AS creator_username FROM invites")?;
    let res = stmt.query_map([], |row| {
        Ok(Invite {
            id: row.get(0)?,
            uses: row.get(1)?,
            expires: row.get(2)?,
            creator_uid: row.get(3)?,
            creator_username: row.get(4)?
        })
    })?.filter(|row| row.is_ok()).map(|row| row.unwrap()).collect();
    
    Ok(res)
}

pub fn delete_invite(id: &str) -> Result<usize, Error> {
    let con = get_connection()?;
    Ok(con.execute("DELETE FROM invites WHERE id = ?", [id])?)
}