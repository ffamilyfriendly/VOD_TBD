import { API_PATH, Err, Ok, Result } from "./client";

export interface I_HttpOptions {
  data?: Object;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: [string, string][];
}

interface I_FetchBody {
  method: string;
  body?: string;
  headers?: [string, string][];
}

interface I_BaseApiResponse {
  ok: boolean;
  code: number;
}

interface I_SuccessResponse<T> extends I_BaseApiResponse {
  ok: true;
  data: T;
}

interface I_ErrorResponse extends I_BaseApiResponse {
  ok: false;
  data: {
    message: string;
  };
}

type ApiResponse<T> = I_SuccessResponse<T> | I_ErrorResponse;

function http_get(
  route: `/${string}`,
  options: I_HttpOptions = { method: "GET" }
): Promise<Result<Response>> {
  return new Promise((resolve, reject) => {
    const fetch_options: I_FetchBody = { method: options.method };

    if (options.data) fetch_options.body = JSON.stringify(options.data);
    if (options.headers) fetch_options.headers = options.headers;

    fetch(`${API_PATH}${route}`, fetch_options)
      .then((r) => {
        return resolve({ ok: true, value: r });
      })
      .catch((e) => {
        return resolve({ ok: false, error: e });
      });
  });
}

export async function t_http_get<T>(
  route: `/${string}`,
  options: I_HttpOptions = { method: "GET" }
): Promise<Result<ApiResponse<T>>> {
  const r = await http_get(route, options);
  if (r.ok) {
    return Ok(await r.value.json());
  } else {
    return Err(r.error);
  }
}
