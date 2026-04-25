// 📂 src/core/plugins/events/eventBus.ts
import { EventEmitter } from 'events';

class CentralBus extends EventEmitter {}

export const eventBus = new CentralBus();

// ميثود مساعدة للتأكد من الـ Listeners
export const debugBus = () => {
  return {
    events: eventBus.eventNames(),
    totalListeners: eventBus.getMaxListeners()
  };
};