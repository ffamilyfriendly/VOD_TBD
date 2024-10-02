"use client";
import Content from "./content";
import { I_HttpOptions, t_http_get } from "./http";
import { logger } from "./logger";

export const API_PATH = "http://127.0.0.1:8000";

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Unwrap<T>(res: Result<T>): T {
  if (res.ok) {
    return res.value;
  } else throw new Error(`FAILED TO UNWRAP`);
}

export function Ok<T>(obj: T): Result<T> {
  return { ok: true, value: obj };
}

export function Err<T extends Error, Y>(err: T): Result<Y> {
  return { ok: false, error: err };
}

function decodeToken<T extends { exp: number }>(token: string): Result<T> {
  const claim = token.split(".")[1];
  const claimDecoded = JSON.parse(atob(claim)) as T;
  if (claimDecoded.exp < Date.now() / 1000) {
    return Err(Error("token has expired"));
  } else {
    try {
      return Ok(JSON.parse(atob(claim)));
    } catch (e) {
      if (e instanceof Error) {
        return Err(e);
      } else return Err(Error("Unexpected error UwU"));
    }
  }
}

export enum UserPermissions {
  Administrator = 1 << 0,
  ManageUsers = 1 << 1,
  ManageContent = 1 << 2,
  ManageEncoding = 1 << 3,
}

export function user_has_permission(u: I_User, permission: UserPermissions) {
  const is_admin =
    (u.flags & UserPermissions.Administrator) == UserPermissions.Administrator;
  return is_admin || (u.flags & permission) == permission;
}

interface I_User {
  id: number;
  email: string;
  name: string;
  // Really should redact this from the api lol
  password: string;
  flags: number;
  used_invite: string;
}

function validateToken<T extends { exp: number }>(token: string): Result<T> {
  const chunks = token.split(".");

  if (chunks.length !== 3)
    return Err(
      new Error("Token malformed. Must include 3 parts separeted by '.'")
    );

  try {
    const decoded = JSON.parse(atob(chunks[1])) as T;

    if (decoded.exp < Date.now() / 1000) {
      return Err(new Error("token has expired"));
    }

    return Ok(decoded);
  } catch (err) {
    if (err instanceof Error) {
      return Err(err);
    } else {
      return Err(new Error("could not decode token claims"));
    }
  }
}

export default class Client {
  _refreshToken?: string;
  content: Content;

  set refreshToken(val: string) {
    this.logger.log(`refreshToken set.`);
    this._refreshToken = val;
    localStorage.setItem("VOD_TOKEN", val);
  }

  get refreshToken() {
    return this._refreshToken ?? "";
  }

  activeToken?: string;
  user?: I_User;
  logger = new logger("Client");

  constructor() {
    this.content = new Content(this);
    const saved_token = localStorage.getItem("VOD_TOKEN");

    if (saved_token) {
      this.logger.log("Refresh token found!");

      const decoded_token = validateToken<{
        sub: string;
        exp: number;
        token_type: string;
      }>(saved_token);

      if (decoded_token.ok) {
        this.logger.log("token OK!");
        this._refreshToken = saved_token;
        this.updateSelf();
      } else {
        this.logger.err(
          `Saved refresh token was faulty.\n${decoded_token.error}`
        );
      }
    } else {
      this.logger.log("No refresh token found.");
    }
  }

  public async getActiveToken(): Promise<Result<string>> {
    if (!this.refreshToken) return Err(Error("no refresh token"));
    const token_status = decodeToken(this.refreshToken);

    // This will likely happen if the refresh token has invalid form (will never happen) or has expired (will happen).
    // in both these cases we need the user to log in again.
    if (!token_status.ok) return Err(token_status.error);

    const r = await t_http_get<string>("/auth/refresh", {
      method: "POST",
      data: { token: this.refreshToken },
    });

    if (r.ok) {
      if (r.value.ok) {
        return Ok(r.value.data);
      } else {
        return Err(Error(r.value.data.message));
      }
    } else {
      return Err(r.error);
    }
  }

  private async ensure_token(): Promise<Result<null>> {
    if (!this.activeToken || !validateToken(this.activeToken).ok) {
      this.logger.log("No active token found. Trying to get one...");
      const token_resp = await this.getActiveToken();

      if (!token_resp.ok) return Err(token_resp.error);

      this.logger.log("Token aqquired!");
      this.activeToken = token_resp.value;
    }

    return Ok(null);
  }

  public async raw_fetch(
    route: `/${string}`,
    data: Document | XMLHttpRequestBodyInit | null,
    options: I_HttpOptions = { method: "GET" }
  ): Promise<Result<XMLHttpRequest>> {
    try {
      const opt = options;
      if (!opt.headers) opt.headers = [];
      let token_resp = await this.ensure_token();

      if (!token_resp.ok) {
        return Err(token_resp.error);
      }

      const xhttp = new XMLHttpRequest();
      xhttp.open(options.method, `${API_PATH}${route}`, true);
      xhttp.setRequestHeader("token", this.activeToken as string);

      xhttp.send(data);

      return Ok(xhttp);
    } catch (e) {
      return Err(e instanceof Error ? e : Error("something went wrong"));
    }
  }

  public async fetch<T>(
    route: `/${string}`,
    options: I_HttpOptions = { method: "GET" },
    raw_data = false
  ): Promise<Result<T>> {
    const opt = options;
    if (!opt.headers) opt.headers = [];

    let token_resp = await this.ensure_token();

    if (!token_resp.ok) {
      return Err(token_resp.error);
    }

    opt.headers.push(["token", this.activeToken as string]);

    const final_res = await t_http_get<T>(route, opt, raw_data);

    if (final_res.ok) {
      if (final_res.value.ok) {
        return Ok(final_res.value.data);
      } else {
        return Err(Error(final_res.value.data.message));
      }
    } else return Err(final_res.error);
  }

  public getUser(): Promise<Result<I_User>> {
    return this.fetch<I_User>("/auth/user/@me");
  }

  public async updateSelf() {
    const res = await this.getUser();

    if (res.ok) {
      this.user = res.value;
    } else {
      this.logger.warn(`Could not update client user info.\n${res.error}`);
    }
  }

  public async login(email: string, password: string): Promise<Result<string>> {
    const r = await t_http_get<string>("/auth/login", {
      method: "POST",
      data: { email, password },
    });

    if (r.ok) {
      if (r.value.ok) {
        this.refreshToken = r.value.data;
        return Ok(r.value.data);
      } else {
        return Err(Error(r.value.data.message));
      }
    } else {
      return Err(r.error);
    }
  }

  public async register(
    email: string,
    name: string,
    password: string,
    invite: string
  ): Promise<Result<string>> {
    const r = await t_http_get<string>("/auth/register", {
      method: "POST",
      data: { email, password, name, invite },
    });

    if (r.ok) {
      if (r.value.ok) {
        this.refreshToken = r.value.data;
        return Ok(r.value.data);
      } else {
        return Err(Error(r.value.data.message));
      }
    } else {
      return Err(r.error);
    }
  }
}
