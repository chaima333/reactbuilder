import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { api } from "./api/api";

import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import siteReducer from "./features/siteSlice";
import visitorAuthReducer from "./features/visitorAuthSlice";
import { visitorAuthApi } from "./services/visitorAuth.api";
import { publicRuntimeApi } from "./services/publicRuntime.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    visitorAuth: visitorAuthReducer,
    theme: themeReducer,
    site: siteReducer,

    [api.reducerPath]: api.reducer,
    [visitorAuthApi.reducerPath]:visitorAuthApi.reducer,
    [publicRuntimeApi.reducerPath]: publicRuntimeApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      api.middleware,
      visitorAuthApi.middleware,
      publicRuntimeApi.middleware
    ),

  devTools: true,
});

setupListeners(store.dispatch);

export type RootState =
  ReturnType<typeof store.getState>;

export type AppDispatch =
  typeof store.dispatch;