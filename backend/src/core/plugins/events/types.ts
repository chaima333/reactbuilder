// core/events/types.ts
export interface EventContext {
  eventId: string;
  timestamp: number;
  action: "update" | "restore" | "publish" | "create";
  userId: number;
  siteId: number;
}

export interface PageEventPayload {
  context: EventContext;
  current: any;
  previous?: any;
  changes: string[];
}