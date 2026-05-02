// src/core/commands/command.bus.ts
import { Command } from "./command.types";

type Handler = (command: Command) => Promise<any>;

export class CommandBus {
  private static handlers = new Map<string, Handler>();

  static register(type: string, handler: Handler) {
    this.handlers.set(type, handler);
  }

  static async execute(command: Command) {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      throw new Error(`No handler for command: ${command.type}`);
    }

    console.log("⚡ Command:", command.type);

    return handler(command);
  }
}