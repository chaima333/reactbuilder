import { EventEmitter } from "events";
import { pluginQueue } from "../../queues/plugin.queue";

class CentralBus extends EventEmitter {}


export const eventBus = {
  // دالة واحدة لبعث أي حدث للنظام بالكامل
  async emit(event: string, data: any) {
    console.log(`📡 Dispatching System Event: ${event}`);
    
    await pluginQueue.add("plugin-execution", {
      event,
      siteId: data.siteId,
      userId: data.userId,
      payload: data.payload,
      changes: data.changes || [] // هنا نستعملو الـ detectChanges اللي صنعتها
    });
  }
};


export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  // 1️⃣ دالة تنظيف الـ Blocks (ترتيب الـ Keys وتحويلها لنص ثابت)
  const normalize = (data: any) => {
    if (!data) return "[]";
    // ترتيب الـ Keys يضمن إنو المقارنة ديما صحيحة مهما كان ترتيب الـ Object
    return JSON.stringify(data, Object.keys(data).sort());
  };

  // 2️⃣ مقارنة الحقول العادية
  if (oldData.title !== newData.title) changes.push("title");
  if (oldData.content !== newData.content) changes.push("content");
  if (oldData.status !== newData.status) changes.push("status");

  // 3️⃣ مقارنة الـ Blocks بعد التنظيف
  if (normalize(oldData.blocks) !== normalize(newData.blocks)) {
    changes.push("blocks");
  }

  return changes;
};