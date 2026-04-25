import { ICmsPlugin } from "./plugin.types";
import crypto from 'crypto';
export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;
    // نضمنوا إنو الـ priority المسجلة هي بيدها اللي في الـ instance
    this.plugins.set(plugin.name, { instance: plugin, priority: plugin.priority || priority, enabled });
    console.log(`🔌 [Registry]: ${plugin.name} registered`);
  }

  init(context: any) {
    if (this.isInitialized) return;

    console.log("🛠️ [Registry]: Initializing Plugins Context...");
    this.plugins.forEach(({ instance, enabled }) => {
      if (enabled && typeof instance.register === 'function') {
        instance.register(context);
      }
    });

    this.isInitialized = true;
  }
  getPlugin(name: string): ICmsPlugin | undefined {
    const entry = this.plugins.get(name);
    
    return entry ? entry.instance : undefined;
  }

  async emit(event: string, payload: any, source: string) {
    const eventId = crypto.randomUUID();
    console.log(`📡 [Bus] Event: ${event} | From: ${source} | ID: ${eventId}`);
    
    const enrichedPayload = { 
      ...payload, 
      _meta: { eventId, source, timestamp: Date.now() } 
    };
    
    await this.orchestrate(event, enrichedPayload);
  }


private processedEvents = new Set<string>(); // 🛡️ Idempotency Store (للتبسيط توّة)

private async orchestrate(event: string, payload: any) {
  const eventId = payload._meta.eventId;

  // 1️⃣ Idempotency Check
  if (this.processedEvents.has(eventId)) {
    console.warn(`⚠️ [Idempotency] Event ${eventId} already processed. Skipping.`);
    return;
  }

  const activePlugins = Array.from(this.plugins.values())
    .filter(p => p.enabled && p.instance.events.includes(event))
    .sort((a, b) => b.priority - a.priority);

  for (const { instance } of activePlugins) {
    const start = Date.now();
    try {
      // 2️⃣ Execution with Timeout (5 seconds)
      await this.runWithTimeout(instance.execute(event, payload), 5000);
      
      console.log(`[Trace] 🏁 ${instance.name} Done | ${Date.now() - start}ms`);
    } catch (err: any) {
      console.error(`💥 [Failure] ${instance.name}: ${err.message}`);
      
      // 3️⃣ Failure Strategy (Retry or Abort)
      if (instance.isCritical) {
        throw new Error(`CRITICAL_PLUGIN_FAILURE: ${instance.name}`);
      }
    }
  }

  // 4️⃣ Mark as Processed
  this.processedEvents.add(eventId);
}

private runWithTimeout(promise: Promise<any>, ms: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
  ]);
}
  getListeners(): string[] {
    // نرجعو فقط قائمة الأسامي (Keys) متاع الـ Plugins اللي مسجلين عندنا
    return Array.from(this.plugins.keys());
  }

  
}

export const cmsRegistry = PluginRegistry.getInstance();