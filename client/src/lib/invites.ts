import Client from "./client";

export interface I_Invite {
  id: string,
  uses: number,
  expires: number|Date,
  creator_uid?: number,
  creator_username?: string
}

export class Invite implements I_Invite {
  id: string;
  uses: number;
  expires: Date;
  creator_uid?: number | undefined;
  creator_username?: string | undefined;

  constructor(init: I_Invite) {
    this.id = init.id
    this.uses = init.uses
    this.creator_uid = init.creator_uid
    this.creator_username = init.creator_username

    const as_num = Number(init.expires)

    this.expires = new Date(as_num * 1000)
  }
}

export default class Invites {
  client: Client;
  constructor(c: Client) {
    this.client = c;
  }

  async delete_invite(invite_id: string) {
    return this.client.fetch<number>(`/invite/${invite_id}`, {
      method: "DELETE",
    });
  }

  async get_invite(invite_id: string) {
    return this.client.fetch<I_Invite>(`/invite/${invite_id}`, {
      method: "GET",
    });
  }

  async get_all_invites() {
    return this.client.fetch<I_Invite[]>(`/invite/all`, {
      method: "GET",
    });
  }

  async create_invite(id: string, expires: number, uses: number) {
    return this.client.fetch<I_Invite>(`/invite/create`, {
      method: "POST",
      data: { id, expires: expires, uses },
    });
  }
}
