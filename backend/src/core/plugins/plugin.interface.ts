import { EventEmitter } from "events";

export interface PluginContext {
  eventBus: EventEmitter;
}

export interface Plugin {
  name: string;
  priority?: number;
  enabled?: boolean;
  events: string[]; // 🔥 زيد السطر هذا هنا باش يتنحى الـ Error
  register(ctx: PluginContext): void;
  // زدنا هذي للـ Worker مستقبلاً
  execute?: (event: string, payload: any) => Promise<void>; 
}