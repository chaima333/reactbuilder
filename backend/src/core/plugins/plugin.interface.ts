/*export interface ICmsPlugin<
  Events extends Record<string, any> = any
> {
  name: string;
  priority: number;
  mode: "sync" | "async";
  events: (keyof Events)[];
  enabled: boolean;

  execute<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ): Promise<void>;
}*/

import { UnifiedEvent }
from "./events/contracts/unified.contract";

export interface ICmsPlugin {

  name: string;

  priority: number;

  mode:
    "sync" | "async";

  events: string[];

  enabled: boolean;

  meta?: any;

  isCritical?: boolean;

  execute(
    event: UnifiedEvent
  ): Promise<void>;

  getDashboardData?(
    siteId: number
  ): Promise<any>;
}