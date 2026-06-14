import { PlatformSetting } from "../../models";

export class AdminSettingsService {
  static async getSettings() {
    const setting = await PlatformSetting.findOne({
      where: { key: "platform" }
    });

    return setting?.value || {};
  }

  static async saveSettings(value: any) {
    const existing = await PlatformSetting.findOne({
      where: { key: "platform" }
    });

    if (existing) {
      await existing.update({ value });
      return existing;
    }

    return await PlatformSetting.create({
      key: "platform",
      value,
    });
  }
}