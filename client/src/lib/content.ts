import Client, { Err, Ok, Result } from "./client";
import { logger } from "./logger";

/* 

pub struct Source {
    pub source_id: String,
    pub url: Option<String>,
    pub content_type: String,
    pub priority: u16,
    pub size: u16,
    pub parent: String,
    pub uploaded_by: u16
}

*/

interface I_Upload {
  source_id: string;
  total_bytes: number;
  bytes_uploaded: number;
  last_push: number;
  filetype: string;
}

class Upload {
  client: Client;
  file: File;
  chunkSize: number;
  cursor: number;
  id: string;
  done: boolean;
  logger: logger;
  chunk_timings: number[];
  callback?: (
    percent_done: number,
    avg_chunk_ms: number,
    eta_ms: number
  ) => void;

  constructor(c: Client, id: string, file: File, chunkSize = 10000000) {
    this.client = c;
    this.file = file;
    this.cursor = 0;
    this.chunkSize = chunkSize;
    this.id = id;
    this.done = false;
    this.logger = new logger("UPLOAD");
    this.chunk_timings = [];
  }

  async upload_chunk(): Promise<Result<I_Upload>> {
    const byte_array = this.file.slice(
      this.cursor,
      Math.min(this.file.size, this.cursor + this.chunkSize)
    );

    if (byte_array.size === 0) {
      console.error("BUF 0");
      return Err(Error("buffer was 0"));
    }

    const request_start = Date.now();
    const res = await this.client.fetch(
      `/content/${this.id}/upload`,
      {
        method: "POST",
        data: byte_array,
      },
      true
    );

    if (res.ok) {
      this.cursor += this.chunkSize;
      this.chunk_timings.push(Date.now() - request_start);

      if (this.cursor >= this.file.size) {
        this.done = true;
      }

      if (this.callback) {
        const avg_time_ms =
          this.chunk_timings.reduce((a, b) => a + b) /
          this.chunk_timings.length;

        const chunks_left = (this.file.size - this.cursor) / this.chunkSize;

        const est_time_left = chunks_left * avg_time_ms;

        const as_percentage = Math.min(
          (this.cursor / this.file.size) * 100,
          100
        );
        this.callback(as_percentage, avg_time_ms, est_time_left);
      }
    } else return Err(res.error);

    return Ok(res.value as I_Upload);
  }

  async start() {
    const wait = (t: number) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(null), t);
      });
    };

    while (!this.done) {
      const r = await this.upload_chunk();
      if (!r.ok) {
        console.log(r);
        this.logger.err(`chunk errored. Killing upload\n${r.error}`);
        this.done = true;
        break;
      }

      wait(60);
    }
  }
}

export interface Source {
  source_id: string;
  url: string;
  content_type: string | null;
  priority: number;
  size: number;
  parent: string;
  uploaded_by: number;
  video_codec?: string;
  audio_codec?: string;
}

export enum EntityType {
  Movie,
  Series,
  SeriesEpisode,
  Folder,
}

export interface Entity {
  entity_id: string;
  parent?: string;
  entity_type: EntityType;
}

export interface MetaData {
  metadata_id: string;
  title?: string;
  thumbnail?: string;
  backdrop?: string;
  description?: string;
  ratings?: number;
  language?: string;
  release_date?: string;
}

export interface MetadataUpdate {
  thumbnail?: string;
  backdrop?: string;
  description?: string;
  ratings?: number;
  release_date?: string;
  title?: string;
  language?: string;
}

export interface Collection {
  entity: Entity;
  metadata: MetaData;
}

export interface EntitySelectOptions {
  language?: string;
  title_exact?: string;
  ratings_above?: number;
  ratings_below?: number;
}

export default class Content {
  client: Client;
  constructor(c: Client) {
    this.client = c;
  }

  async create_entity(entity_type: EntityType, parent?: string) {
    return this.client.fetch<Entity>("/content/entity", {
      method: "POST",
      data: { parent, entity_type },
    });
  }

  async create_source(parent: string, size: number, filetype: string) {
    return this.client.fetch<Source>("/content/source", {
      method: "POST",
      data: { parent, size, filetype },
    });
  }

  async get_sources(parent: string) {
    return this.client.fetch<Source[]>(`/content/${parent}/sources`, {
      method: "GET",
    });
  }

  async get_source(source_id: string) {
    return this.client.fetch<Source>(`/content/JHBOY/source/${source_id}`, {
      method: "GET",
    });
  }

  async get_metadata(entity_id: string) {
    return this.client.fetch<MetaData>(`/content/${entity_id}/metadata`, {
      method: "GET",
    });
  }

  /**
   *
   * /<parent>/collections?<data..>
   */

  async get_collections(parent: string, filters: EntitySelectOptions) {
    const params = new URLSearchParams(filters as any).toString();
    return this.client.fetch<Collection[]>(
      `/content/${parent}/collections?${params}`
    );
  }

  async update_metadata(entity_id: string, update: MetadataUpdate) {
    return this.client.fetch<number>(`/content/${entity_id}/metadata`, {
      method: "PATCH",
      data: update,
    });
  }

  async delete_source(source_id: string) {
    return this.client.fetch<number>(`/content/source/${source_id}`, {
      method: "DELETE",
    });
  }

  upload_file(source_id: string, file: File) {
    return new Upload(this.client, source_id, file);
  }
}
