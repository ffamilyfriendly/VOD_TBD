use rusqlite::Row;
use serde::Serialize;
use uuid::Uuid;

use crate::datatypes::error::definition::Error;

use super::db;

#[derive(Serialize)]
pub struct Tag {
    pub tag_id: String,
    pub title: String,
    pub colour: String
}

impl TryFrom<&Row<'_>> for Tag {
    type Error = rusqlite::Error;
    fn try_from(value: &Row<'_>) -> Result<Self, Self::Error> {
        Ok(Tag {
            tag_id: value.get(0)?,
            title: value.get(1)?,
            colour: value.get(2)?
        })
    }
}

/// Creates a tag!
/// 
/// Creates a tag with a selected title and colour. The Tag will be assigned a generated uuid
pub fn create_tag(title: String, colour: String) -> Result<Tag, Error> {
    let id = Uuid::new_v4();
    Ok(create_known_tag(id.to_string(), title, colour)?)
}

/// creates a tag with a application specified id
/// 
/// This function exists to allow creations of tags with a specific tag_id contrary to create_tag which creates a random UUid.
/// This is useful, especially, when used with external APIs (like tmdb) where tags already have an ID
pub fn create_known_tag(tag_id: String, title: String, colour: String) -> Result<Tag, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("INSERT INTO tags VALUES(?,?,?)")?;
    stmt.execute([&tag_id, &title, &colour])?;
    Ok(Tag { tag_id, title, colour })
}

/// Deletes a tag globally
/// 
/// completely removes a tag from existance. *poof*, it is gonezo. No more. 
/// (I should remember to change the db structure so tag deletions cascades lol)
pub fn delete_tag(tag_id: &str) -> Result<usize, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("DELETE FROM tags WHERE tag_id = ?")?;

    Ok(stmt.execute([tag_id])?)
}

// Create assoc
// CREATE TABLE IF NOT EXISTS tags_assoc (tag_id UUID REFERENCES tags(tag_id), entity_id UUID REFERENCES entity(entity_id), UNIQUE(tag_id, entity_id))

/// Apply a tag to a specified entity
pub fn tag_content(tag_id: &str, entity_id: &str) -> Result<usize, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("INSERT INTO tags_assoc VALUES(?,?)")?;

    Ok(stmt.execute([tag_id, entity_id])?)
}

/// Removes a specified tag from an entity
pub fn untag_content(tag_id: &str, entity_id: &str) -> Result<usize, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("DELETE FROM tags_assoc WHERE tag_id = ? AND entity_id = ?")?;

    Ok(stmt.execute([tag_id, entity_id])?)
}

/// Returns all tags that exist on an entity
pub fn get_tags_on_entity(entity_id: &str) -> Result<Vec<Tag>, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("SELECT t.tag_id, t.title, t.colour FROM tags_assoc AS ta JOIN tags AS t on t.tag_id = ta.tag_id WHERE ta.entity_id = ?")?;
    let tags = stmt.query_map([entity_id], |row| Tag::try_from(row))?.collect::<Result<Vec<Tag>, _>>()?;

    Ok(tags)
}

/// Returns all tags in the database
pub fn get_all_tags() -> Result<Vec<Tag>, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("SELECT * FROM tags")?;
    let tags = stmt.query_map([], |row| Tag::try_from(row))?.collect::<Result<Vec<Tag>,_>>()?;
    Ok(tags)
}

pub fn get_tags_with_title(title: &str) -> Result<Vec<Tag>, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("SELECT * FROM tags WHERE title LIKE '%' || ? || '%'")?;
    let tags = row_to_vec!(stmt, [title], Tag);
    Ok(tags)
}

/// Returns a specified tag
pub fn get_tag(tag_id: &str) -> Result<Tag, Error> {
    let con = db::get_connection()?;
    let mut stmt = con.prepare("SELECT * FROM tags WHERE tag_id = ?")?;
    Ok(stmt.query_row([tag_id], |row| Tag::try_from(row))?)
}


