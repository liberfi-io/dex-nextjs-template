import { IStorage } from "@liberfi/core";

export class BrowserStorage implements IStorage {
  prefix = "liberfi";

  get = async <R>(key: string) => {
    const value = localStorage.getItem(`${this.prefix}_${key}`);
    if (!value) return null;
    const { payload } = JSON.parse(value) as { payload: R };
    return payload;
  };

  set = async <R>(key: string, payload: R) => {
    localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify({ payload }));
    return payload;
  };

  setBatch = async <V extends Record<string, unknown>>(values: V) => {
    Object.entries(values).forEach(([key, payload]) => {
      localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify({ payload }));
    });
    return values;
  };

  delete = async <R>(key: string) => {
    const payload = await this.get<R>(key);
    if (payload != null) {
      localStorage.removeItem(`${this.prefix}_${key}`);
    }
    return payload;
  };

  clear = async () => {
    localStorage.clear();
  };
}
