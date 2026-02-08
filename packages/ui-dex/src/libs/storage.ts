export const Storage = {
  delete(key: string) {
    window.localStorage.removeItem(key);
  },
  getString(key: string): string | undefined {
    const value = window.localStorage.getItem(key);
    return value === null ? undefined : value;
  },
  setString(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(e);
    }
  },
  getBoolean(key: string, defaultValue: boolean = false): boolean | undefined {
    const value = window.localStorage.getItem(key);
    return value === null || value === undefined ? defaultValue : "true" === value;
  },
  setBoolean(key: string, value: boolean) {
    try {
      window.localStorage.setItem(key, value ? "true" : "false");
    } catch (e) {
      console.warn(e);
    }
  },
  getObject(key: string): object | undefined {
    try {
      const value = window.localStorage.getItem(key);
      if (!value) return;
      return JSON.parse(value);
    } catch (e) {
      console.warn(e);
    }
  },
  setObject(key: string, value: object) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(e);
    }
  },
};
