export interface EventContext {
  eventId: string;     // UUID للـ tracing
  timestamp: number;
  action: 'update' | 'restore' | 'publish' | 'slug_change';
  userId: number;
  siteId: number;
}

export interface PageEventPayload {
  context: EventContext;
  current: any;       // الداتا الجديدة
  previous?: any;    // الداتا قبل التعديل (مهمة للـ Versioning)
  changes?: string[]; // شنوة اللي تبدل بالظبط
}