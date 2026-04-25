// 📂 src/core/plugins/plugin.types.ts
export interface ICmsPlugin {
  name: string;
  mode: 'sync' | 'async'; // 🔥 زيدها هنا
  events: string[];
  priority: number;
  enabled?: boolean;
  register(context: any): void;
  execute(event: string, payload: any): Promise<void>;
}