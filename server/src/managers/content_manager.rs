use std::io::Write;
/* 
source_id UUID PRIMARY KEY, url TEXT, type TEXT, priority INTEGER DEFAULT 1, size INTEGER, parent TEXT NOT NULL, uploaded_by INTEGER NOT NULL, FOREIGN KEY(uploaded_by) REFERENCES users(id)
*/
use std::time::{SystemTime, UNIX_EPOCH};

use std::fs::OpenOptions;
use uuid::Uuid;

use serde::Serialize;

use crate::datatypes::error::definition::Error;

use super::db::get_connection;

#[derive(Serialize)]
pub struct Source {
    pub source_id: String,
    pub url: Option<String>,
    pub content_type: String,
    pub priority: u16,
    pub size: u64,
    pub parent: String,
    pub uploaded_by: u16
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
        uploaded_by: creator
    })
}

// con.execute("CREATE TABLE IF NOT EXISTS uploads (source_id UUID PRIMARY KEY, total_bytes INTEGER NOT NULL, bytes_uploaded INTEGER DEFAULT 0, last_push INTEGER NOT NULL, FOREIGN KEY(source_id) REFERENCES sources(source_id))", ())?;

#[derive(Serialize)]
pub struct Upload {
    pub source_id: String,
    pub total_bytes: u64,
    pub bytes_uploaded: u64,
    pub last_push: u64
}

pub fn get_timestamp() -> u64 {
    let s = SystemTime::now();
    let since_epoch = s.duration_since(UNIX_EPOCH).expect("time traveler detected!");

    since_epoch.as_secs()
}

pub fn create_upload(id: &str, total_bytes: &u64) -> Result<Upload, Error> {
    let con = get_connection()?;

    let mut stmt = con.prepare("INSERT INTO uploads VALUES (?1, ?2, ?3, ?4)")?;
    stmt.raw_bind_parameter(1, id)?;
    stmt.raw_bind_parameter(2, total_bytes)?;
    stmt.raw_bind_parameter(3, 0)?;
    stmt.raw_bind_parameter(4, 0)?;

    stmt.raw_execute()?;

    Ok(Upload { source_id: id.to_owned(), total_bytes: total_bytes.to_owned(), bytes_uploaded: 0, last_push: get_timestamp() })
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

pub fn write_to_upload(id: &str, bytes: &[u8]) -> Result<Upload, Error> {
    let mut upl = get_upload(id)?;

    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(format!("./{}.mp4", id)).unwrap();

    file.write_all(bytes).unwrap();
    update_upload(id, bytes.len())?;
    upl.bytes_uploaded += bytes.len() as u64;
    Ok(upl)
}