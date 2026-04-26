import { EventEmitter } from "events";

class CentralBus extends EventEmitter {}

export const eventBus = new CentralBus();


  //change-detector

export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  if (!oldData || !newData) return ["full"];

  if (oldData.title !== newData.title) changes.push("title");
  if (oldData.content !== newData.content) changes.push("content");
  if (oldData.status !== newData.status) changes.push("status");

  if (
    JSON.stringify(oldData.blocks ?? []) !==
    JSON.stringify(newData.blocks ?? [])
  ) {
    changes.push("blocks");
  }

  return changes;
};