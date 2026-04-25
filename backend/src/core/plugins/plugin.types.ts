// 📂 src/core/plugins/plugin.types.ts (تأكد من المسار)

export interface ICmsPlugin {
  name: string;
  mode: 'sync' | 'async';
  priority: number;
  isCritical: boolean; // <--- لازم تكون مكتوبة هكّا بالظبط
  events: string[];
  enabled: boolean;
  register?(context: any): void;
  execute(event: string, payload: any): Promise<void>;
}