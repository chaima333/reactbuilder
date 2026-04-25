import { EventEmitter } from "events";

class CentralBus extends EventEmitter {}

export const eventBus = new CentralBus();