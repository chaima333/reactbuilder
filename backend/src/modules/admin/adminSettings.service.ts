import crypto from "crypto";
import { PlatformSetting } from "../../models";

export class AdminSettingsService {
  static async getSettings() {
    const setting = await PlatformSetting.findOne({
      where: { key: "platform" },
    });

    return setting?.value || {};
  }

  static async saveSettings(value: any) {
    const existing = await PlatformSetting.findOne({
      where: { key: "platform" },
    });

    if (existing) {
      await existing.update({ value });
      return existing.value;
    }

    const created = await PlatformSetting.create({
      key: "platform",
      value,
    });

    return created.value;
  }

  static async generateApiKey() {
    const current = await this.getSettings();

    const rawKey = `rb_${crypto.randomBytes(32).toString("hex")}`;

    const apiKeyHash = crypto
      .createHash("sha256")
      .update(rawKey)
      .digest("hex");

    const apiKeyPreview = `${rawKey.slice(0, 8)}...${rawKey.slice(-4)}`;

    const updated = {
      ...current,
      apiKeyHash,
      apiKeyPreview,
      apiKeyGeneratedAt: new Date().toISOString(),
    };

    await this.saveSettings(updated);

    return {
      apiKey: rawKey,
      apiKeyPreview,
      apiKeyGeneratedAt: updated.apiKeyGeneratedAt,
    };
  }
}