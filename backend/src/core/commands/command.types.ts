// src/core/commands/command.types.ts
export interface Command {
  type: string;
  payload?: any;
  context: {
    userId: number;
    siteId?: number;
  };
}