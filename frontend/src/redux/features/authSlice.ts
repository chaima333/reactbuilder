import {
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface CredentialsPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Returns localStorage only when running inside a browser.
 *
 * Vitest and other Node environments do not always define
 * window or localStorage.
 */
const getSafeStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error(
      "Unable to access localStorage:",
      error
    );

    return null;
  }
};

const getSafeStorageItem = (
  key: string
): string | null => {
  const storage = getSafeStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch (error) {
    console.error(
      `Error reading ${key} from localStorage:`,
      error
    );

    return null;
  }
};

const setSafeStorageItem = (
  key: string,
  value: string
): void => {
  const storage = getSafeStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, value);
  } catch (error) {
    console.error(
      `Error writing ${key} to localStorage:`,
      error
    );
  }
};

const removeSafeStorageItem = (
  key: string
): void => {
  const storage = getSafeStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(
      `Error removing ${key} from localStorage:`,
      error
    );
  }
};

const getStoredUser = (): User | null => {
  const storedUser =
    getSafeStorageItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(storedUser) as User;

    if (
      !parsedUser ||
      typeof parsedUser !== "object" ||
      typeof parsedUser.id !== "number" ||
      typeof parsedUser.email !== "string"
    ) {
      return null;
    }

    return parsedUser;
  } catch (error) {
    console.error(
      "Error parsing user from localStorage:",
      error
    );

    return null;
  }
};

const storedAccessToken =
  getSafeStorageItem("accessToken");

const storedRefreshToken =
  getSafeStorageItem("refreshToken");

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: Boolean(
    storedAccessToken
  ),
  loading: false
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<CredentialsPayload>
    ) => {
      const {
        user,
        accessToken,
        refreshToken
      } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.loading = false;

      setSafeStorageItem(
        "accessToken",
        accessToken
      );

      setSafeStorageItem(
        "refreshToken",
        refreshToken
      );

      setSafeStorageItem(
        "user",
        JSON.stringify(user)
      );
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;

      removeSafeStorageItem(
        "accessToken"
      );

      removeSafeStorageItem(
        "refreshToken"
      );

      removeSafeStorageItem(
        "user"
      );
    },

    setLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setCredentials,
  logout,
  setLoading
} = authSlice.actions;

export default authSlice.reducer;