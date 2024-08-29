import { I_HttpOptions, t_http_get } from "./http";

export const API_PATH = "http://127.0.0.1:8000";

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

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

if (window) {

  window.prototype.gen_hue = function generate_hue() {};
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

export default class Client {
  refreshToken?: string;
  activeToken?: string;
  constructor() {}

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

  public async fetch<T>(
    route: `/${string}`,
    options: I_HttpOptions = { method: "GET" }
  ): Promise<Result<T>> {
    const opt = options;
    if (!opt.headers) opt.headers = [];

    if (!this.activeToken) {
      const token_resp = await this.getActiveToken();

      if (!token_resp.ok) return Err(token_resp.error);

      this.activeToken = token_resp.value;
    }

    opt.headers.push(["token", this.activeToken]);

    const final_res = await t_http_get<T>(route, opt);

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
}
