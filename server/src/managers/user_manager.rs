use super::db;
use crate::datatypes::error::definition::{ Error, UserManagerErrors };

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};


// CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, password TEXT NOT NULL, flags INTEGER NOT NULL DEFAULT 0)
pub enum UserPermissions {
    Administrator = 1 << 0,
    GenerateInvite = 1 << 1,
    PrivateContent = 1 << 2,
    ManageContent = 1 << 3
}

pub struct PermissionsResolver {
    pub int_rep: u8
}

impl PermissionsResolver {
    pub fn has(&self, p: &UserPermissions) -> bool {
        let to_raw_ptr: *const UserPermissions = p;
        let as_u16 = to_raw_ptr as u8;
        let admin_as_u16 = UserPermissions::Administrator as u8;
        (self.int_rep & as_u16) == as_u16 || (self.int_rep & admin_as_u16) == admin_as_u16
    }

    // thanks null :)
    pub fn any(&self, p: &[UserPermissions]) -> bool {
        p.iter().any(|flag| self.has(flag))
    }
}

pub struct User {
    pub id:         u16,
    pub email:      String,
    pub name:       String,
    pub password:   String,
    pub flags:      PermissionsResolver
}

/// gets a user with a specified ID. Will throw NotFound if no user was found
pub fn get_user(user_email: &str) -> Result<User, Error> {
    let db = db::get_connection()?;

    let mut stmt = db.prepare("SELECT * FROM users WHERE email = ?")?;
    match stmt.query_row([user_email], |f| { 
        Ok(User { 
            id:         f.get(0)?,
            email:      f.get(1)?,
            name:       f.get(2)?,
            password:   f.get(3)?,
            flags:      PermissionsResolver { int_rep: f.get(4)? }
         })
     }) {
        Ok(d) => Ok(d),
        Err(e) => {
            if e == rusqlite::Error::QueryReturnedNoRows {
                return Err(UserManagerErrors::NotFound(user_email.to_string()).into())
            }
            Err(e.into())
        }
     }
}

/// Takes a plaintext password and returns a hashed password. Poof 🪄
pub fn hash_password(password: &str) -> Result<String, argon2::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.to_string().as_bytes(), &salt).expect("oops");
    Ok(password_hash.to_string())
}

/// Takes a plaintext password and a hashed password and returns true if they match
pub fn compare_password(plain_password: &str, hashed_password: &str) -> bool {
    let parsed_hash = PasswordHash::new(&hashed_password).expect("fucky wucky");
    Argon2::default().verify_password(plain_password.to_string().as_bytes(), &parsed_hash).is_ok()
}

/// Inserts a user to the database. The password should already be hashed when put into this function
pub fn insert_user(name: &str, email: &str, password: &str, flags: u8) -> Result<User, Error> {

    // TODO: move restraints into some central place lol. Maybe config file?
    if name.len() > 50 {
        return Err(UserManagerErrors::ValidationError.into())
    }

    let db = db::get_connection()?;
    db.execute("INSERT INTO users (name, password, flags, email) VALUES (?1, ?2, ?3, ?4)", ( name, password, flags, email ))?;
    
    Ok(
        User {
            id:         db.last_insert_rowid() as u16,
            email:      email.to_string(),
            name:       name.to_string(),
            password:   password.to_string(),
            flags:      PermissionsResolver { int_rep: flags }
        }
    )
}

/// Deletes the specified user. Will return a usize 1 if a user was found and deleted and 0 is no user was deleted due to not existing
pub fn delete_user(id: u16) -> Result<usize, Error> {
    let db = db::get_connection()?;
    match db.execute("DELETE FROM users WHERE id = ?", [id]) {
        Ok(size) => Ok(size),
        Err(e) => Err(e.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_user() {
        let result = insert_user("Bob Test", "bob@testing.app", "hunter1", 0).expect("could not create test user");
        println!("Test user created!");

        let get_user = get_user(&result.email).expect("could not get test user");
        assert_eq!(result.id, get_user.id);

        let deleted = delete_user(result.id).expect("could not delete test user");

        assert_eq!(deleted, 1);
    }

    #[test]
    fn test_hashing() {
        let psw = "hunter1";
        let hashed = hash_password(psw).expect("could not hash password");
        assert!(compare_password(psw, &hashed))
    }
}