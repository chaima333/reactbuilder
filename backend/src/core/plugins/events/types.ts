export interface EventContext {
  eventId: string;     // UUID للـ tracing
  timestamp: number;
  action: 'update' | 'restore' | 'publish' | 'slug_change';
  userId: number;
  siteId: number;
}

export interface PageEventPayload {
  context: {
    eventId: string;
    timestamp: number;
    action: 'update' | 'restore' | 'publish' | 'delete';
    userId: number;
    siteId: number;
  };

  current: any;
  previous?: any;
  changes?: string[];
  flags?: {
    shouldVersion?: boolean;
    shouldSEO?: boolean;
  };
}