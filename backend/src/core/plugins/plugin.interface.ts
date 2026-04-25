import { EventEmitter } from "events";

export interface PluginContext {
  eventBus: EventEmitter;
}

export interface ICmsPlugin {
  name: string;
  priority: number;
  mode: 'sync' | 'async';
  events: string[];
  enabled: boolean;
  register(ctx: PluginContext): void;
  execute(event: string, payload: any): Promise<void>;
}