use std::error::Error;
use config::{Config as Cfg, File, Environment};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    pub media_dir: String
}
#[derive(Debug, Deserialize)]
pub struct SecretsConfig {
    pub tmdb_key: String
}
#[derive(Debug, Deserialize)]
pub struct Config {
    pub storage: DatabaseConfig,
    pub secrets: SecretsConfig
}

pub fn load_config() -> Result<Config, Box<dyn Error>> {
    let settings = Cfg::builder()
    .add_source(File::with_name("config"))
    .add_source(Environment::with_prefix("APP"))
    .build()?;

    let config: Config = settings.try_deserialize()?;
    Ok(config)
}