import React from "react";
import {
  createRoot
} from "react-dom/client";
import {
  Provider
} from "react-redux";
import {
  configureStore
} from "@reduxjs/toolkit";
import {
  BrowserRouter
} from "react-router-dom";

import visitorAuthReducer from "../../../redux/features/visitorAuthSlice";
import {
  visitorAuthApi
} from "../../../redux/services/visitorAuth.api";
import {
  VisitorLoginBlock
} from "../components/blocks/data/visitorLogin/VisitorLoginBlock";
import {
  VisitorRegisterBlock
} from "../components/blocks/data/visitorRegister/VisitorRegisterBlock";
import {
  RuntimeProvider
} from "../runtime/context/RuntimeProvider";

type ExportRuntimeConfig = {
  siteId?: number;
  apiBaseUrl?: string;
  enabledCapabilities?: string[];
};

type ExportBlockPayload = {
  block: any;
  pageId?: number | string | null;
};

declare global {
  interface Window {
    __RB_EXPORT_RUNTIME_CONFIG__?: ExportRuntimeConfig;
  }
}

const components = {
  visitorLogin: VisitorLoginBlock,
  visitorRegister: VisitorRegisterBlock
} as const;

const createVisitorAuthStore = () =>
  configureStore({
    reducer: {
      visitorAuth: visitorAuthReducer,
      [visitorAuthApi.reducerPath]:
        visitorAuthApi.reducer
    },
    middleware: (
      getDefaultMiddleware
    ) =>
      getDefaultMiddleware({
        serializableCheck: false
      }).concat(
        visitorAuthApi.middleware
      ),
    devTools: false
  });

const parsePayload = (
  mount: Element
): ExportBlockPayload | null => {
  const script =
    mount.querySelector(
      'script[type="application/json"][data-rb-export-block]'
    );

  if (!script?.textContent) {
    return null;
  }

  try {
    return JSON.parse(
      script.textContent
    ) as ExportBlockPayload;
  } catch (error) {
    console.error(
      "RB_EXPORT_BLOCK_PARSE_ERROR",
      error
    );
    return null;
  }
};

const getDevice = () => {
  if (
    window.matchMedia(
      "(max-width: 600px)"
    ).matches
  ) {
    return "mobile" as const;
  }

  if (
    window.matchMedia(
      "(max-width: 1024px)"
    ).matches
  ) {
    return "tablet" as const;
  }

  return "desktop" as const;
};

const mountVisitorAuthBlock = (
  mount: Element
) => {
  const config =
    window.__RB_EXPORT_RUNTIME_CONFIG__ || {};

  if (
    !config.enabledCapabilities?.includes(
      "visitorAuth"
    )
  ) {
    return;
  }

  const payload =
    parsePayload(mount);

  const block =
    payload?.block;

  const blockType =
    block?.type as keyof typeof components;

  const Component =
    components[blockType];

  if (!Component) {
    return;
  }

  const siteId =
    Number(config.siteId);

  if (
    !Number.isFinite(siteId) ||
    siteId <= 0
  ) {
    console.error(
      "RB_EXPORT_RUNTIME_SITE_ID_MISSING"
    );
    return;
  }

  const container =
    document.createElement("div");

  mount.replaceChildren(container);

  const store =
    createVisitorAuthStore();

  createRoot(container).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <RuntimeProvider
            value={{
              mode: "export",
              device: getDevice(),
              siteId,
              pageId:
                payload?.pageId || null
            }}
          >
            <Component
              block={block}
              data={block.data}
              device={getDevice()}
            />
          </RuntimeProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
};

const boot = () => {
  document
    .querySelectorAll(
      "[data-rb-export-runtime-block]"
    )
    .forEach(
      mountVisitorAuthBlock
    );
};

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    boot,
    {
      once: true
    }
  );
} else {
  boot();
}
