// 📂 src/plugins/plugin.types.ts
export interface ICmsPlugin {
  name: string;
  events: string[]; // 👈 ردها مصفوفة (Array)
  handle?(payload: any): Promise<void> | void;
  execute?(event: string, payload: any): Promise<void>;
  register(context: any): void; // 👈 زيد هذي باش الـ Registry ينجم يناديها
}