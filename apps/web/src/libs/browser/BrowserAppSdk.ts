import { IAppSdk } from "@liberfi/core";
import { BrowserStorage } from "./BrowserStorage";
import EventEmitter from "eventemitter3";

export class BrowserAppSdk implements IAppSdk {
  storage = new BrowserStorage();
  events = new EventEmitter<string>();

  openPage = async (url: string, options?: { title?: string; target?: string }) => {
    if (options?.target === "modal") {
      this.events.emit("webview:open", {
        method: "webview:open",
        params: {
          url,
          title: options.title ?? url,
        },
      });
    } else {
      window.open(url, options?.target ?? "_blank");
    }
  };

  hapticNotification = (_type: "error" | "success" | "warning") => {};

  copyToClipboard = async (_text: string, _notification?: string) => {};
}

export const browserAppSdk = new BrowserAppSdk();
