import { EventEmitter } from "events";

class CentralBus extends EventEmitter {}

export const eventBus = new CentralBus();


  //change-detector

export function detectChanges(current: any, previous: any) {
  const changes: any = {};

  if (!current || !previous) return changes;

  if (current.title !== previous.title) {
    changes.title = true;
  }

  if (current.content !== previous.content) {
    changes.content = true;
  }

  if (
    JSON.stringify(current.blocks || []) !==
    JSON.stringify(previous.blocks || [])
  ) {
    changes.blocks = true;
  }

  return changes;
}