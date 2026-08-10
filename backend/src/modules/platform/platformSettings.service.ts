import { PlatformSetting } from "../../models";

export type PublicPlatformSettings = {
  platformName: string;
  mediaPlugin: boolean;
  seoPlugin: boolean;
  versionPlugin: boolean;
  figmaPlugin: boolean;
  aiEnabled: boolean;
  globalAssistantEnabled: boolean;
  builderAiEnabled: boolean;
  maintenanceMode: boolean;
};

const defaultPublicSettings: PublicPlatformSettings = {
  platformName: "ReactBuilder",
  mediaPlugin: true,
  seoPlugin: true,
  versionPlugin: true,
  figmaPlugin: true,
  aiEnabled: true,
  globalAssistantEnabled: true,
  builderAiEnabled: true,
  maintenanceMode: false,
};

export class PlatformSettingsService {
  static async getPublicSettings(): Promise<PublicPlatformSettings> {
    const setting = await PlatformSetting.findOne({
      where: { key: "platform" },
    });

    const value = setting?.value || {};
    const aiSetting = await PlatformSetting.findOne({
      where: { key: "platform_ai" },
    });
    const aiValue = aiSetting?.value || {};

    return {
      platformName: value.platformName ?? defaultPublicSettings.platformName,
      mediaPlugin: value.mediaPlugin ?? defaultPublicSettings.mediaPlugin,
      seoPlugin: value.seoPlugin ?? defaultPublicSettings.seoPlugin,
      versionPlugin: value.versionPlugin ?? defaultPublicSettings.versionPlugin,
      figmaPlugin: value.figmaPlugin ?? defaultPublicSettings.figmaPlugin,
      aiEnabled: aiValue.enabled ?? value.aiEnabled ?? defaultPublicSettings.aiEnabled,
      globalAssistantEnabled: aiValue.globalAssistantEnabled ?? defaultPublicSettings.globalAssistantEnabled,
      builderAiEnabled: aiValue.builderAiEnabled ?? defaultPublicSettings.builderAiEnabled,
      maintenanceMode: value.maintenanceMode ?? defaultPublicSettings.maintenanceMode,
    };
  }
}
