import { PlatformSetting } from "../../models";

export type PublicPlatformSettings = {
  platformName: string;
  mediaPlugin: boolean;
  seoPlugin: boolean;
  versionPlugin: boolean;
  aiEnabled: boolean;
  maintenanceMode: boolean;
};

const defaultPublicSettings: PublicPlatformSettings = {
  platformName: "ReactBuilder",
  mediaPlugin: true,
  seoPlugin: true,
  versionPlugin: true,
  aiEnabled: true,
  maintenanceMode: false,
};

export class PlatformSettingsService {
  static async getPublicSettings(): Promise<PublicPlatformSettings> {
    const setting = await PlatformSetting.findOne({
      where: { key: "platform" },
    });

    const value = setting?.value || {};

    return {
      platformName: value.platformName ?? defaultPublicSettings.platformName,
      mediaPlugin: value.mediaPlugin ?? defaultPublicSettings.mediaPlugin,
      seoPlugin: value.seoPlugin ?? defaultPublicSettings.seoPlugin,
      versionPlugin: value.versionPlugin ?? defaultPublicSettings.versionPlugin,
      aiEnabled: value.aiEnabled ?? defaultPublicSettings.aiEnabled,
      maintenanceMode: value.maintenanceMode ?? defaultPublicSettings.maintenanceMode,
    };
  }
}
