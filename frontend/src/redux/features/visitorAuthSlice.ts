import {
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";

export interface SiteVisitor {
  id: number;
  siteId: number;
  fullName: string;
  email: string;
  status:
    | "active"
    | "pending_verification"
    | "suspended";
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
}

export interface VisitorSession {
  siteId: number;
  visitor: SiteVisitor;
  accessToken: string;
  refreshToken: string;
}

interface VisitorAuthState {
  sessions: Record<
    string,
    VisitorSession
  >;
}

const STORAGE_KEY =
  "siteVisitorSessions";

const readStoredSessions = (): Record<
  string,
  VisitorSession
> => {
  try {
    if (
      typeof window ===
      "undefined"
    ) {
      return {};
    }

    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return {};
    }

    const parsed =
      JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "VISITOR_SESSION_READ_ERROR",
      error
    );

    return {};
  }
};

const persistSessions = (
  sessions: Record<
    string,
    VisitorSession
  >
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions)
    );
  } catch (error) {
    console.error(
      "VISITOR_SESSION_SAVE_ERROR",
      error
    );
  }
};

const initialState: VisitorAuthState = {
  sessions:
    readStoredSessions()
};

const visitorAuthSlice =
  createSlice({
    name: "visitorAuth",

    initialState,

    reducers: {
      setVisitorCredentials: (
        state,
        action: PayloadAction<{
          siteId: number;
          visitor: SiteVisitor;
          accessToken: string;
          refreshToken: string;
        }>
      ) => {
        const {
          siteId,
          visitor,
          accessToken,
          refreshToken
        } = action.payload;

        state.sessions[
          String(siteId)
        ] = {
          siteId,
          visitor,
          accessToken,
          refreshToken
        };

        persistSessions(
          state.sessions
        );
      },

      updateVisitorTokens: (
        state,
        action: PayloadAction<{
          siteId: number;
          accessToken: string;
          refreshToken: string;
        }>
      ) => {
        const key =
          String(
            action.payload.siteId
          );

        const session =
          state.sessions[key];

        if (!session) {
          return;
        }

        session.accessToken =
          action.payload.accessToken;

        session.refreshToken =
          action.payload.refreshToken;

        persistSessions(
          state.sessions
        );
      },

      logoutVisitor: (
        state,
        action: PayloadAction<{
          siteId: number;
        }>
      ) => {
        delete state.sessions[
          String(
            action.payload.siteId
          )
        ];

        persistSessions(
          state.sessions
        );
      },

      clearVisitorSessions: (
        state
      ) => {
        state.sessions = {};

        persistSessions(
          state.sessions
        );
      }
    }
  });

export const {
  setVisitorCredentials,
  updateVisitorTokens,
  logoutVisitor,
  clearVisitorSessions
} =
  visitorAuthSlice.actions;

export default
visitorAuthSlice.reducer;
