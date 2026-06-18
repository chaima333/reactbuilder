import { UnifiedEvent } from "./events/contracts/unified.contract";
import {
  DashboardBlockType
} from "../../modules/dashboard/dashboard.dto";



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
      type: DashboardBlockType;
      title?: string;
      col: number;
      order?: number;
    };
  };

  // 🔥 FIXED: site-level not user-level
  getDashboardData?(
    siteId: number,
    context?: { userId?: number }
  ): Promise<any>;
}
