import { EventEmitter } from "events";

export type PluginContext = {
  eventBus: EventEmitter;
};

export interface Plugin {
  name: string;
  events: string[];
  priority?: number;
  enabled?: boolean;
  register(ctx: PluginContext): void;
}