// 📂 src/core/plugins/plugin.interface.ts

import { EventEmitter } from "events";

export interface PluginContext {
  eventBus: EventEmitter;
}

// ✅ المصدر الوحيد للمعلومة توّة
export interface ICmsPlugin {
  name: string;
  priority: number;
  mode: 'sync' | 'async';
  events: string[];
  enabled: boolean; // 🔥 زيد السطر هذا هنا باش الـ VersionPlugin يسكت
  register(ctx: PluginContext): void;
  execute(event: string, payload: any): Promise<void>;
}