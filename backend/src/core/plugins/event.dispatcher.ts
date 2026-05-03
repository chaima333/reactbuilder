import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";
import crypto from "crypto";

// core/plugins/event.dispatcher.ts
export class EventDispatcher {
  static async dispatch(envelope: any, source = "system") {
    // التأكد من وجود المعرف الفريد في أي مكان (meta أو context)
    const eventId = envelope?.meta?.eventId || envelope?.context?.eventId;

    if (!eventId) {
      console.error("🚨 Missing eventId in envelope:", envelope);
      return;
    }

    console.log(`📡 [Dispatcher] ${envelope.type} | ${eventId} | Source: ${source}`);

    // نرسل الـ envelope كما هو بالضبط للـ Queue
    // الـ Worker سيتعامل مع job.data كـ envelope كامل
    await addToQueue("plugin-tasks", envelope);
  }
}