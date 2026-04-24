import { EventEmitter } from 'events';

// نصنعو Instance وحدة ونخرجوها للناس الكل
export const eventBus = new EventEmitter();

// نزيدو هذي باش نسهلو الخدمة في الـ Plugins
export const emitSafe = (event: string, payload: any) => {
  eventBus.emit(event, payload);
};