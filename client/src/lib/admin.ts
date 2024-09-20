import Client from "./client";

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

class Upload {
  client: Client;
  file: File;
  chunkSize: number;
  cursor: number;
  id: string;
  done: boolean;
  constructor(c: Client, id: string, file: File, chunkSize = 10000000) {
    this.client = c;
    this.file = file;
    this.cursor = 0;
    this.chunkSize = chunkSize;
    this.id = id;
    this.done = false;
  }

  async upload_chunk() {
    const byte_array = this.file.slice(
      this.cursor,
      Math.min(this.file.size, this.cursor + this.chunkSize)
    );

    if (byte_array.size === 0) {
      console.error("BUF 0");
      return 0;
    }

    console.log(byte_array.size);

    const res = await this.client.fetch(
      `/content/upload/${this.id}`,
      {
        method: "POST",
        data: byte_array,
      },
      true
    );

    if (res.ok) {
      this.cursor += this.chunkSize;

      if (this.cursor > this.file.size) {
        this.done = true;
      }
      console.log(`[${this.cursor}/${this.file.size}]`);
      console.log("YIPPIE :D");
      console.log(res.value);
    }

    return res;
  }

  async start() {
    const wait = (t: number) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(null), t);
      });
    };

    while (!this.done) {
      await this.upload_chunk();
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
}

export default class Admin {
  client: Client;
  constructor(c: Client) {
    this.client = c;
  }

  async create_source(parent: string, size: number) {
    return this.client.fetch<Source>("/content/create", {
      method: "POST",
      data: { parent, size },
    });
  }

  upload_file(source_id: string, file: File) {
    return new Upload(this.client, source_id, file);
  }
}
