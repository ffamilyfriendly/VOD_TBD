use rusqlite::{Connection, Result};

pub fn get_connection() -> Result<Connection> {
    Connection::open("./database.db")
}

pub fn ensure_tables() -> Result<(), rusqlite::Error> {
    let con = get_connection()?;

    con.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, flags INTEGER NOT NULL DEFAULT 0, invite_used TEXT NOT NULL, FOREIGN KEY(invite_used) REFERENCES invites(id))", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, uses INTEGER NOT NULL, expires INTEGER NOT NULL, creator_uid INTEGER, FOREIGN KEY(creator_uid) REFERENCES users(id))", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS push_urls (user_id INTEGER PRIMARY KEY, url TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))", ())?;

    // Entity
    con.execute("CREATE TABLE IF NOT EXISTS entity (entity_id UUID PRIMARY KEY, parent UUID REFERENCES entity(entity_id) ON DELETE SET NULL, entity_type INTEGER NOT NULL)", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS metadata (metadata_id UUID PRIMARY KEY REFERENCES entity(entity_id) ON DELETE CASCADE, thumbnail TEXT, backdrop TEXT, description TEXT, ratings INTEGER, language TEXT, release_date DATE)", ())?;
    
    // tags
    con.execute("CREATE TABLE IF NOT EXISTS tags (tag_id UUID PRIMARY KEY, title TEXT, colour TEXT)", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS tags_assoc (tag_id UUID REFERENCES tags(tag_id), entity_id UUID REFERENCES entity(entity_id), UNIQUE(tag_id, entity_id))", ())?;

    // Source / upload
    con.execute("CREATE TABLE IF NOT EXISTS sources (source_id UUID PRIMARY KEY, url TEXT, type TEXT, priority INTEGER DEFAULT 1, size INTEGER, parent TEXT NOT NULL, uploaded_by INTEGER NOT NULL, FOREIGN KEY(uploaded_by) REFERENCES users(id))", ())?;
    con.execute("CREATE TABLE IF NOT EXISTS uploads (source_id UUID PRIMARY KEY, total_bytes INTEGER NOT NULL, bytes_uploaded INTEGER DEFAULT 0, last_push INTEGER NOT NULL, FOREIGN KEY(source_id) REFERENCES sources(source_id))", ())?;
    Ok(())
}