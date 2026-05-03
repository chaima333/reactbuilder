import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";

export class EventDispatcher {
  private static processed = new Set<string>();

static async dispatch(event: string, payload: any, source: string = 'system') {
    console.log(`🚀 [Step 1] Dispatcher started for: ${event}`);

    try {
        const job = await addToQueue("plugin-tasks", { 
            type: event, 
            data: payload.data || payload,
            context: payload.context,
            meta: payload.meta,
            source 
        });

        // سيختفي خطأ الـ void الآن لأننا أضفنا return في ملف الـ Queue
        if (job) {
            console.log(`✅ [Step 2] Job created in Redis! ID: ${job.id}`);
        } else {
            console.error(`⚠️ [Step 2] Job was added but returned no result!`);
        }
    } catch (error) {
        console.error(`🚨 [Step 2] Connection Error:`, error);
    }

}
}