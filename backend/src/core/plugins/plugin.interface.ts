export interface ICmsPlugin<
  Events extends Record<string, any> = any
> {
  name: string;
  priority: number;
  mode: "sync" | "async";
  events: (keyof Events)[];
  enabled: boolean;

  execute<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ): Promise<void>;
}