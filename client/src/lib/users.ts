import Client from "./client";

export interface I_User {
  id: number,
  email: string,
  name: string,
  flags: number,
  used_invite: string
}

interface I_UserUpdate {
    flag?: number,
    email?: string
}

interface I_PasswordUpdate {
    current_password?: string,
    new_password: string
}

export default class UserManager {
  client: Client;
  constructor(c: Client) {
    this.client = c;
  }


  async get_all_users() {
    return this.client.fetch<I_User[]>("/user/all", {
        method: "GET"
    })
  }

  async update_user(id: number, update: I_UserUpdate) {
    return this.client.fetch<number>(`/user/${id}`, {
        method: "PATCH",
        data: update
    })
  }

  async update_password(id: number, update: I_PasswordUpdate) {
    return this.client.fetch<number>(`/user/${id}/password`, {
        method: "PATCH",
        data: update
    })
  }

  async delete_user(id: number) {
    return this.client.fetch<number>(`/auth/user/${id}`, {
        method: "DELETE"
    })
  }
}
