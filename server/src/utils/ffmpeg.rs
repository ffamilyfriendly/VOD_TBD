use std::process::Command;

use serde::{Deserialize, Serialize};

use crate::datatypes::error::definition::Error;
use crate::datatypes::error::definition::FFmpegErrors;

#[derive(Serialize)]
pub struct CodecInfo {
    pub video: Option<String>,
    pub audio: Option<String>
}


#[derive(Deserialize)]
struct Stream {
    index: u8,
    codec_name: String,
    codec_type: String
}

#[derive(Deserialize)]
struct RawOutput {
    streams: Vec<Stream>
}

pub fn probe_file_codec(file_path: &str) -> Result<CodecInfo, Error> {
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "error",
            "-show_entries", "stream=index,codec_name,codec_type",
            "-of", "json",
            file_path
        ]).output()?;

    if !output.status.success() {
        // return Err(ApiErrors::WrongTokenTypeProvided(t.token_type, "refresh".to_owned()).into())
        return Err(Error::FFmpeg(FFmpegErrors::GeneralError( String::from_utf8_lossy( output.stderr.as_slice() ).to_string() )));
    };

    let parsed: RawOutput = serde_json::from_slice(&output.stdout)?;

    let mut as_iter = parsed.streams.iter();

    let codec_info = CodecInfo {
        video: as_iter.find(|x| x.codec_type == "video").and_then(|vid| Some(vid.codec_name.clone())),
        audio: as_iter.find(|x| x.codec_type == "audio").and_then(|audio| Some(audio.codec_name.clone()))
    };

    Ok(codec_info)
}