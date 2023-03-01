/* global fetch */
import qs from "qs";

// shim "fetch" if it isn't available
if (!global.fetch) require("isomorphic-fetch");

const defaults = {
  apiUrl: "https://api.fridgecms.com/v2",
};

type FridgeOptions = {
  apiUrl?: string;
  fridgeId?: string;
  token?: string;
};

type FridgeGetRequestOptions = Record<string, string | string[] | undefined> & {
  body?: BodyInit | null;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
};

type FridgeUpdateRequestOptions = FridgeGetRequestOptions & {
  body?: BodyInit | null;
};

export default class Fridge {
  options: FridgeOptions;
  constructor(options?: FridgeOptions) {
    this.options = { ...defaults, ...options };
  }

  static client(options?: FridgeOptions) {
    return new Fridge(options);
  }

  get<T>(url: string, options: FridgeGetRequestOptions = {}) {
    return this._request<T>("get", url, null, options);
  }

  post<T>(
    url: string,
    json: any = {},
    options: FridgeUpdateRequestOptions = {}
  ) {
    return this._request<T>("post", url, json, options);
  }

  put<T>(
    url: string,
    json: any = {},
    options: FridgeUpdateRequestOptions = {}
  ) {
    return this._request<T>("put", url, json, options);
  }

  delete(url: string, options: FridgeGetRequestOptions = {}) {
    return this._request("delete", url, null, options);
  }

  async _request<T>(
    method: string,
    path: string,
    json: any,
    options: FridgeGetRequestOptions | FridgeUpdateRequestOptions
  ): Promise<T> {
    const requestOptions: any = { headers: {}, method };

    if (this.options.token) {
      requestOptions.headers["Authorization"] = this.options.token;
    }

    if (this.options.fridgeId) {
      options.site_id = this.options.fridgeId;
    }

    if (json && (method === "post" || method === "put")) {
      requestOptions.headers["Content-Type"] = "application/json";
      requestOptions.body = JSON.stringify(json);
    }

    if (options.body) {
      requestOptions.body = options.body;
      delete options.body;
    }

    if (options.headers) {
      requestOptions.headers = {
        ...requestOptions.headers,
        ...options.headers,
      };
      delete options.headers;
    }

    if (options.credentials) {
      requestOptions.credentials = options.credentials;
      delete options.credentials;
    }

    const q = qs.stringify(options);
    const url = `${this.options.apiUrl}/${path.replace(/^\//g, "")}${
      q.length ? `?${q}` : ""
    }`;

    const res = await fetch(url, requestOptions);
    // seems easier to deal with errors without `throw`
    // await checkStatus(res)
    return res.headers.get("Content-Type")?.match(/json/)
      ? res.json()
      : res.text();
  }
}
