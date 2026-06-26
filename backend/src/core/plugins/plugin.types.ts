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

  // =========================
  // LIFECYCLE
  // =========================

  onInstall?(siteId: number): Promise<void>;

  onEnable?(siteId: number): Promise<void>;

  onDisable?(siteId: number): Promise<void>;

  onUninstall?(siteId: number): Promise<void>;

  onUpdate?(
    siteId: number,
    fromVersion: string,
    toVersion: string
  ): Promise<void>;

  meta?: {
    dashboard?: {
      type: DashboardBlockType;
      title?: string;
      col: number;
      order?: number;
    };
  };

  getDashboardData?(
    siteId: number,
    context?: { userId?: number }
  ): Promise<any>;
}
