// src/App.tsx

import React, {
  Suspense,
  lazy
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import {
  ThemeProvider as MuiThemeProvider
} from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";

import {
  Provider,
  useSelector
} from "react-redux";

import {
  Box,
  CircularProgress
} from "@mui/material";

import { SnackbarProvider } from "notistack";

import {
  store,
  RootState
} from "./redux/store";

import {
  lightTheme,
  darkTheme
} from "./theme";

import { Layout }
from "./app/Layout/Layout";

// Providers
import {
  ThemeProvider as BuilderThemeProvider
} from "./modules/pageBuilder/core/theme/ThemeProvider";

import {
  LanguageProvider
} from "./app/providers/LanguageProvider";

import {
  GoogleOAuthProvider
} from "@react-oauth/google";
import { useAppBootstrap } from "./modules/dashboard/hooks/useBootstrap";


// ======================================================
// LAZY PAGES
// ======================================================

const DashboardPage = lazy(
  () => import("./modules/dashboard/pages/DashboardPage")
);

const Login = lazy(
  () => import("./modules/auth/pages/Login")
    .then(m => ({ default: m.Login }))
);

const Register = lazy(
  () => import("./modules/auth/pages/Register")
    .then(m => ({ default: m.Register }))
);

const Sites = lazy(
  () => import("./modules/sites/pages/SitesPage")
    .then(m => ({ default: m.Sites }))
);

const SiteEditor = lazy(
  () => import("./modules/sites/pages/SiteEditorPage")
    .then(m => ({ default: m.SiteEditor }))
);

const PublicSite = lazy(
  () => import("./modules/sites/pages/PublicSitePage")
    .then(m => ({ default: m.PublicSite }))
);

const Profile = lazy(
  () => import("./modules/users/pages/Profile")
    .then(m => ({ default: m.Profile }))
);

const Settings = lazy(
  () => import("./modules/users/pages/Settings")
    .then(m => ({ default: m.Settings }))
);

const ForgotPassword = lazy(
  () => import("./modules/auth/pages/ForgotPassword")
    .then(m => ({ default: m.ForgotPassword }))
);

const ResetPassword = lazy(
  () => import("./modules/auth/pages/ResetPassword")
    .then(m => ({ default: m.ResetPassword }))
);

const WaitingPage = lazy(
  () => import("./modules/auth/pages/WaitingPage")
    .then(m => ({ default: m.WaitingPage }))
);

const Home = lazy(
  () => import("./app/pages/Home")
    .then(m => ({ default: m.Home }))
);

const PageEditor = lazy(
  () => import("./modules/pageBuilder/pages/PageEditor")
    .then(m => ({ default: m.PageEditor }))
);

const Users = lazy(
  () => import("./modules/users/pages/Users")
);

const Media = lazy(
  () => import("./modules/media/pages/MediaPage")
);

// ======================================================

const GOOGLE_CLIENT_ID = "xxx";

// ======================================================
// ROUTE GUARDS
// ======================================================

const ProtectedRoute = () => {

  const isAuthenticated = useSelector(
    (s: RootState) =>
      s.auth.isAuthenticated
  );

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
};

const AdminRoute = () => {

  const {
    isAuthenticated,
    user
  } = useSelector(
    (s: RootState) => s.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// ======================================================
// LOADER
// ======================================================

const AppLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// ======================================================
// APP CONTENT
// ======================================================

const AppContent: React.FC = () => {

  const themeMode = useSelector(
    (s: RootState) => s.theme.mode
  );

  useAppBootstrap();

  return (

    <MuiThemeProvider
      theme={
        themeMode === "light"
          ? lightTheme
          : darkTheme
      }
    >

      <CssBaseline />

      <SnackbarProvider maxSnack={3}>

        <BuilderThemeProvider>

          <BrowserRouter>

            <Suspense fallback={<AppLoader />}>

              <Routes>

                {/* PUBLIC */}

                <Route
                  path="/"
                  element={<Home />}
                />

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/register"
                  element={<Register />}
                />

                <Route
                  path="/waiting-approval"
                  element={<WaitingPage />}
                />

                <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                />

                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                <Route
                  path="/site/:siteId"
                  element={<PublicSite />}
                />

                <Route
                  path="/test-editor"
                  element={<PageEditor mode="edit" />}
                />

                {/* PROTECTED */}

                <Route element={<ProtectedRoute />}>

                  <Route element={<Layout />}>

                    <Route
                      path="/dashboard"
                      element={<DashboardPage />}
                    />

                    <Route
                      path="/sites"
                      element={<Sites />}
                    />

                    <Route
                      path="/sites/:siteId/edit"
                      element={<SiteEditor />}
                    />

                    <Route
                      path="/sites/:siteId/pages/new"
                      element={<PageEditor mode="create" />}
                    />

                    <Route
                      path="/sites/:siteId/pages/:pageId/edit"
                      element={<PageEditor mode="edit" />}
                    />

                    <Route
                      path="/profile"
                      element={<Profile />}
                    />

                    <Route
                      path="/media"
                      element={<Media />}
                    />

                    <Route
                      path="/settings"
                      element={<Settings />}
                    />

                    <Route element={<AdminRoute />}>

                      <Route
                        path="/users"
                        element={<Users />}
                      />

                    </Route>

                  </Route>

                </Route>

                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />

              </Routes>

            </Suspense>

          </BrowserRouter>

        </BuilderThemeProvider>

      </SnackbarProvider>

    </MuiThemeProvider>
  );
};

// ======================================================
// ROOT APP
// ======================================================

function App() {

  return (

    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

      <Provider store={store}>

        <LanguageProvider>

          <AppContent />

        </LanguageProvider>

      </Provider>

    </GoogleOAuthProvider>
  );
}

export default App;