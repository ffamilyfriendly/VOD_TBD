import Client from "./client";

interface I_Invite {
  id: string,
  uses: number,
  expires: Date,
  creator_uid?: number
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

  async create_invite(id: string, expires: Date, uses: number) {
    return this.client.fetch<I_Invite>(`/invite/create`, {
      method: "POST",
      data: { id, expires: expires.valueOf(), uses },
    });
  }
}
