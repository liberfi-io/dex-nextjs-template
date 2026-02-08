import EventEmitter from "eventemitter3";
import { IStorage, MemoryStorage } from "./storage";

export interface INativeButton {
  on: (event: "click", listener: () => void) => void;
  off: (event: "click", listener: () => void) => void;
  show(): void;
  hide(): void;
}

export interface IBiometry {
  requestAccess: () => Promise<boolean>;
  auth: (reason?: string) => Promise<{
    status: "authorized" | "failed" | string;
    token?: string;
  }>;
  updateToken: (newToken: string) => Promise<string>;
  openSetting: () => void;
}

export interface IAppSdk<EventTypes extends EventEmitter.ValidEventTypes = string> {
  events: EventEmitter<EventTypes>;
  storage: IStorage;
  backButton?: INativeButton;
  settingsButton?: INativeButton;
  biometry?: IBiometry;
  openPage: (url: string, options?: { title?: string; target?: string }) => Promise<void>;
  hapticNotification: (type: "error" | "success" | "warning") => void;
  copyToClipboard: (text: string, notification?: string) => Promise<void>;
}

export class MockAppSdk implements IAppSdk {
  events = new EventEmitter<string>();
  storage = new MemoryStorage();
  openPage = async (_url: string, _options?: { title?: string; target?: string }) => {};
  hapticNotification = (_type: "error" | "success" | "warning") => {};
  copyToClipboard = async (_text: string, _notification?: string) => {};
}
