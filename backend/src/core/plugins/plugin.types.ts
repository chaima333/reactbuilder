import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event"; // استورد النوع الموحد

export interface ICmsPlugin {
  name: string;
  mode: "sync" | "async";
  priority: number;
  isCritical?: boolean;
  events: string[];
  enabled: boolean;

  register?(context: any): void;

  
  execute(event: UnifiedEvent): Promise<void>;

  meta?: {
    dashboard?: {
      type: string;
      col: number;
      order?: number;
    };
  };

  getDashboardData?(userId: number): Promise<any>;
}