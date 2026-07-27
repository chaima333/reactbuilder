import {
  useEffect,
  useState
} from "react";

import {
  SiteChatbotWidget
} from "./SiteChatbotWidget";

type PublicChatbotConfig = {
  enabled: boolean;
  displayName?: string;
  welcomeMessage?: string;
  fallbackMessage?: string;
  primaryColor?: string;
};

type Props = {
  siteId: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-rmfq.onrender.com/api";

export const PublicChatbotSlot = ({
  siteId
}: Props) => {
  const [config, setConfig] =
    useState<PublicChatbotConfig | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      if (!siteId) {
        setLoaded(true);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/public/sites/${siteId}/chatbot/config`
          );

        const json =
          await response.json();

        if (
          !cancelled &&
          response.ok &&
          json?.success
        ) {
          setConfig(json.data);
        }
      } catch {
        if (!cancelled) {
          setConfig({
            enabled: false
          });
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  if (
    !loaded ||
    !config?.enabled
  ) {
    return null;
  }

  return (
    <SiteChatbotWidget
      siteId={siteId}
      config={config}
    />
  );
};