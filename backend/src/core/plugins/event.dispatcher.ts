import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";

export class EventDispatcher {
  private static processed = new Set<string>();

static async dispatch(event: string, payload: any, source: string = 'system') {
    console.log(`[1] Dispatcher received: ${event}`); // هل تظهر هذه؟

    const job = await addToQueue("plugin-tasks", { 
        type: event, 
        data: payload.data || payload, 
        context: payload.context,
        meta: payload.meta,
        source 
    });

    if (job) {
        console.log(`[2] Job added to Redis with ID: ${job.id}`); // هل تظهر هذه؟
    }
}
}