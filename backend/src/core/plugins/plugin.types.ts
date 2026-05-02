// 📂 src/core/plugins/plugin.types.ts (تأكد من المسار)

export interface ICmsPlugin {
  name: string;
  mode: "sync" | "async";
  priority: number;
  isCritical?: boolean;
  events: string[];
  enabled: boolean;

  register?(context: any): void;

  execute(
    event: string,
    payload: any,
    context: any
  ): Promise<void>;

  meta?: {
    dashboard?: {
      type: string;
      col: number;
      order?: number;
    };
  };

  getDashboardData?(userId: number): Promise<any>;
}