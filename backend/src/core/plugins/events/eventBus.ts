import { EventEmitter } from "events";

class CentralBus extends EventEmitter {}

export const eventBus = new CentralBus();


  //change-detector

export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  // حماية من الـ Null
  if (!oldData || !newData) return ["initial_payload"];

  // 🎯 حدد قايمة الحقول اللي تهمّك بالرسمي في الـ SaaS متاعك
  const monitoredFields = ["title", "content", "status", "slug", "seoTitle", "seoDescription"];

  monitoredFields.forEach(field => {
    // نجبدو القيم ونثبتو إنها موش undefined
    const oldVal = oldData[field];
    const newVal = newData[field];

    if (oldVal !== newVal) {
      console.log(`🔍 Diff Detected in [${field}]: "${oldVal}" -> "${newVal}"`);
      changes.push(field);
    }
  });

  // 🧱 حماية الـ Blocks (Arrays)
  const oldBlocks = JSON.stringify(oldData.blocks ?? []);
  const newBlocks = JSON.stringify(newData.blocks ?? []);
  
  if (oldBlocks !== newBlocks) {
    changes.push("blocks");
  }

  return changes;
};