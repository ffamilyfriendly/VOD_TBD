use rusqlite::{Connection, Result};

pub fn get_connection() -> Result<Connection> {
    Connection::open("./database.db")
}

pub fn ensure_tables() -> Result<(), rusqlite::Error> {
    let con = get_connection()?;

    con.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, flags INTEGER NOT NULL DEFAULT 0, invite_used TEXT NOT NULL, FOREIGN KEY(invite_used) REFERENCES invites(id))", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, uses INTEGER NOT NULL, expires INTEGER NOT NULL, creator_uid INTEGER, FOREIGN KEY(creator_uid) REFERENCES users(id))", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS push_urls (user_id INTEGER PRIMARY KEY, url TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))", ())?;
    Ok(())
}