use std::io::Write;
use std::process::Command;
/* 
source_id UUID PRIMARY KEY, url TEXT, type TEXT, priority INTEGER DEFAULT 1, size INTEGER, parent TEXT NOT NULL, uploaded_by INTEGER NOT NULL, FOREIGN KEY(uploaded_by) REFERENCES users(id)
*/
use std::time::{SystemTime, UNIX_EPOCH};

use std::fs::OpenOptions;
use rusqlite::ToSql;
use uuid::Uuid;

use serde::{Deserialize, Serialize};

use crate::datatypes::error::definition::Error;
use crate::utils::ffmpeg;

use super::db::get_connection;

// "CREATE TABLE IF NOT EXISTS entity (entity_id UUID PRIMARY KEY, parent UUID REFERENCES entity(entity_id) ON DELETE SET NULL, entity_type TEXT NOT NULL)"

#[derive(Serialize, Deserialize, Clone)]
pub enum EntityType {
    Movie,
    Series,
    SeriesEpisode,
    Folder,
    UNKNOWN
}

impl From<u8> for EntityType {
    fn from(value: u8) -> Self {
        match value {
            0 => EntityType::Movie,
            1 => EntityType::Series,
            2 => EntityType::SeriesEpisode,
            3 => EntityType::Folder,
            _ => EntityType::UNKNOWN
        }
    }
}

#[derive(Serialize)]
pub struct Entity {
    pub entity_id: String,
    pub parent: Option<String>,
    pub entity_type: EntityType
}

pub fn create_entity(entity_type: EntityType, parent: Option<String>) -> Result<Entity, Error> {
    let id = Uuid::new_v4();
    let con = get_connection()?;
    let mut stmt = con.prepare("INSERT INTO entity (entity_id, parent, entity_type) VALUES (?1, ?2, ?3)")?;
    stmt.raw_bind_parameter(1, id.to_string())?;
    stmt.raw_bind_parameter(2, &parent)?;
    stmt.raw_bind_parameter(3, entity_type.clone() as u8)?;

    stmt.raw_execute()?;

    Ok(Entity {
        entity_id: id.to_string(),
        parent: parent,
        entity_type: entity_type
    })
}

#[derive(Serialize, Clone)]
pub struct Source {
    pub source_id: String,
    pub url: Option<String>,
    pub content_type: String,
    pub priority: u16,
    pub size: u64,
    pub parent: String,
    pub uploaded_by: u16,
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>
}

pub fn create_source(parent: String, size: u64, creator: u16) -> Result<Source, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("INSERT INTO sources (source_id, size, parent, uploaded_by) VALUES (?1, ?2, ?3, ?4)")?;
    let id = Uuid::new_v4();
    
    

    stmt.raw_bind_parameter(1, id.to_string())?;
    stmt.raw_bind_parameter(2, size)?;
    stmt.raw_bind_parameter(3, &parent)?;
    stmt.raw_bind_parameter(4, creator)?;

    stmt.raw_execute()?;
    
    Ok(Source {
        source_id: id.to_string(),
        url: None,
        content_type: "".to_owned(),
        priority: 1,
        size: size,
        parent: parent,
        uploaded_by: creator,
        audio_codec: None,
        video_codec: None
    })
}

pub fn get_sources(parent: &str) -> Result<Vec<Source>, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("SELECT * FROM sources WHERE parent = ?")?;
    // source_id UUID PRIMARY KEY, url TEXT, type TEXT, priority INTEGER DEFAULT 1, size INTEGER, parent TEXT NOT NULL, uploaded_by INTEGER NOT NULL, FOREIGN KEY(uploaded_by) REFERENCES users(id)
    let val = stmt.query_map([parent], |r| {
        Ok(Source {
            source_id: r.get(0)?,
            url: r.get(1)?,
            content_type: r.get(2).unwrap_or_default(),
            priority: r.get(3)?,
            size: r.get(4)?,
            parent: r.get(5)?,
            uploaded_by: r.get(6)?,
            video_codec: r.get(7)?,
            audio_codec: r.get(8)?,
        })
    })?;

    let mut sources: Vec<Source> = Vec::new();

    for row in val {
        match row {
            Ok(src) => sources.push(src),
            Err(e) => eprintln!("error reading source: {:?}", e)
        }
    }

    Ok(sources)
}

#[derive(Serialize, Clone)]
pub struct MetaData {
    pub metadata_id: String,
    pub thumbnail: String,
    pub backdrop: String,
    pub description: String,
    pub ratings: f64,
    pub language: String,
    pub release_date: String
}

#[derive(Deserialize, Clone)]
pub struct MetadataUpdate {
    pub thumbnail: Option<String>,
    pub backdrop: Option<String>,
    pub description: Option<String>,
    pub ratings: Option<f64>,
    pub language: Option<String>,
    pub release_date: Option<String>
}

/// Creates a empty metadata entry with the chosen ID
/// 
/// # Returns
/// a usize with value 1 or an error
pub fn create_empty_metadata(id: &str) -> Result<usize, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("INSERT INTO metadata (metadata_id) VALUES (?1)")?;

    Ok(stmt.execute([id])?)
}

pub fn get_metadata(id: &str) -> Result<MetaData, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("SELECT * FROM metadata WHERE metadata_id = ?")?;

    let result = stmt.query_row([id], |f| {
        Ok(MetaData {
            metadata_id: f.get(1)?,
            thumbnail: f.get(2)?,
            backdrop: f.get(3)?,
            description: f.get(4)?,
            ratings: f.get(5)?,
            language: f.get(7)?,
            release_date: f.get(8)?
        })
    })?;

    Ok(result)
}

/// Updates the selected metadata with the chosen values.
/// a value of None on any property will leave that property unchanged
pub fn update_metadata(id: &str, update: MetadataUpdate) -> Result<usize, Error> {
    let con = get_connection()?;
    let mut query = "UPDATE metadata SET ".to_owned();
    let mut params: Vec<&dyn ToSql> = vec![];

    if let Some(thumbnail) = &update.thumbnail {
        query += "thumbnail = ?,";
        params.push(thumbnail);
    }

    if let Some(backdrop) = &update.backdrop {
        query += "backdrop = ?,";
        params.push(backdrop);
    };

    if let Some(description) = &update.description {
        query += "description = ?,";
        params.push(description);
    }

    if let Some(ratings) = &update.ratings {
        query += "ratings = ?,";
        params.push(ratings);
    }

    if let Some(language) = &update.language {
        query += "language = ?,";
        params.push(language);
    }

    if let Some(release_date) = &update.release_date {
        query += "release_date = ?,";
        params.push(release_date);
    }

    query.pop();

    query += "WHERE metadata_id = ?";
    params.push(&id);

    let mut stmt = con.prepare(&query)?;
    Ok(stmt.execute(rusqlite::params_from_iter(params))?)   
}

// con.execute("CREATE TABLE IF NOT EXISTS uploads (source_id UUID PRIMARY KEY, total_bytes INTEGER NOT NULL, bytes_uploaded INTEGER DEFAULT 0, last_push INTEGER NOT NULL, FOREIGN KEY(source_id) REFERENCES sources(source_id))", ())?;

#[derive(Serialize)]
pub struct Upload {
    pub source_id: String,
    pub total_bytes: u64,
    pub bytes_uploaded: u64,
    pub last_push: u64,
    pub filetype: String
}

pub fn get_timestamp() -> u64 {
    let s = SystemTime::now();
    let since_epoch = s.duration_since(UNIX_EPOCH).expect("time traveler detected!");

    since_epoch.as_secs()
}

pub fn create_upload(id: &str, total_bytes: &u64, filetype: String) -> Result<Upload, Error> {
    let con = get_connection()?;

    let mut stmt = con.prepare("INSERT INTO uploads VALUES (?1, ?2, ?3, ?4, ?5)")?;
    stmt.raw_bind_parameter(1, id)?;
    stmt.raw_bind_parameter(2, total_bytes)?;
    stmt.raw_bind_parameter(3, 0)?;
    stmt.raw_bind_parameter(4, 0)?;
    stmt.raw_bind_parameter(5, &filetype)?;

    stmt.raw_execute()?;

    Ok(Upload { source_id: id.to_owned(), total_bytes: total_bytes.to_owned(), bytes_uploaded: 0, last_push: get_timestamp(), filetype })
}

pub fn get_upload(id: &str) -> Result<Upload, Error> {
    let con = get_connection()?;

    let mut stmt = con.prepare("SELECT * FROM uploads WHERE source_id = ?")?;
    
    match stmt.query_row([id], |f| { 
        Ok(Upload { 
            source_id:         f.get(0)?,
            total_bytes:      f.get(1)?,
            bytes_uploaded:       f.get(2)?,
            last_push:   f.get(3)?,
            filetype: f.get(4)?
         })
     }) {
        Ok(d) => Ok(d),
        Err(e) => {
            Err(e.into())
        }
     }
}

pub fn update_upload(id: &str, len: usize) -> Result<usize, Error> {
    let con = get_connection()?;
    let mut stmt = con.prepare("UPDATE uploads SET bytes_uploaded = bytes_uploaded + ? WHERE source_id = ?")?;
    stmt.raw_bind_parameter(1, len)?;
    stmt.raw_bind_parameter(2, id)?;

    Ok(stmt.raw_execute()?)
}

pub struct SourceUpdate {
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>,
    pub file_type: Option<String>
}

/// Updates the selected source with the chosen values.
/// a value of None on any property will leave that property unchanged
pub fn update_source(id: &str, update: SourceUpdate) -> Result<usize, Error> {
    let con = get_connection()?;
    let mut query = "UPDATE sources SET ".to_owned();
    let mut params: Vec<&dyn ToSql> = vec![];

    if let Some(video_codec) = &update.video_codec {
        query += "video_codec = ?,";
        params.push(video_codec);
    }

    if let Some(audio_codec) = &update.audio_codec {
        query += "audio_codec = ?,";
        params.push(audio_codec);
    };

    if let Some(file_type) = &update.file_type {
        query += "type = ?,";
        params.push(file_type);
    }

    query.pop();

    query += "WHERE source_id = ?";
    params.push(&id);

    let mut stmt = con.prepare(&query)?;
    Ok(stmt.execute(rusqlite::params_from_iter(params))?)   
}

/// Deletes a source
/// 
/// # Arguments
/// * `id` - the id of the source to delete
/// 
/// # Returns
/// a usize with a value of 1 if deleted, otherwise 0 if nothing was deleted (source does not exist)
pub fn delete_source(id: &str) -> Result<usize, Error> {
    let con = get_connection()?;

    let mut stmt = con.prepare("DELETE FROM sources WHERE source_id = ?")?;

    Ok(stmt.execute([id])?)
}


/// Takes an upload ID and a slice of bytes and appends it to the specified file
/// 
/// # Arguments
/// * `id` - the upload (source) id
/// * `bytes` - a slice of bytes to write to the file
/// 
/// # Returns
/// a Result containing a Upload struct representing the upload
pub fn write_to_upload(id: &str, bytes: &[u8]) -> Result<Upload, Error> {
    let mut upl = get_upload(id)?;

    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(format!("./{}.{}", id, &upl.filetype))?;

    file.write_all(bytes)?;
    update_upload(id, bytes.len())?;
    upl.bytes_uploaded += bytes.len() as u64;

    if upl.bytes_uploaded >= upl.total_bytes {
        let probed = ffmpeg::probe_file_codec(&format!("./{}.{}", id, &upl.filetype))?;
        // TODO: update the source "video_codec" and "audio_codec" with the probed codecs

        println!("video: {:?}\naudio: {:?}", probed.video, probed.audio);
        update_source(&upl.source_id, SourceUpdate { video_codec: probed.video, audio_codec: probed.audio, file_type: Some(upl.filetype.clone()) })?;
    }

    Ok(upl)
}