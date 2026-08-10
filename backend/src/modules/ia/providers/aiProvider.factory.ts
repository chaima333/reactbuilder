import {
  AdminAiSettingsService,
  PlatformAiProvider,
  getProviderStatus
} from "../../admin/adminAiSettings.service";

export type AiProvider = {
  name: PlatformAiProvider;
  model: string;
  configured: boolean;
};

export class AiProviderFactory {
  static async getActiveAiProvider():
    Promise<AiProvider | null> {
    const settings =
      await AdminAiSettingsService.getSettings();

    if (!settings.enabled) {
      return null;
    }

    const status =
      getProviderStatus()[
        settings.provider
      ];

    if (!status.configured) {
      throw new Error(
        `${settings.provider.toUpperCase()}_API_KEY_MISSING`
      );
    }

    return {
      name:
        settings.provider,
      model:
        settings.model || status.model,
      configured:
        status.configured
    };
  }

  static getProviderAvailability() {
    return getProviderStatus();
  }
}

export const getActiveAiProvider = () =>
  AiProviderFactory.getActiveAiProvider();
