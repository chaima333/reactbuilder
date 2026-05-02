type EventItem = {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
};

class EventStore {
  private events: EventItem[] = [];

  add(event: EventItem) {
    this.events.unshift(event);

    // نخليو فقط آخر 50 event
    if (this.events.length > 50) {
      this.events = this.events.slice(0, 50);
    }
  }

  getLatest() {
    return this.events;
  }
}

export const eventStore = new EventStore();