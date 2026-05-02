// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';

import { store, RootState } from './redux/store';
import { lightTheme, darkTheme } from './theme';
import { Layout } from './app/Layout/Layout';

// Providers
import { ThemeProvider as BuilderThemeProvider } from './modules/pageBuilder/core/theme/ThemeProvider';
import { LanguageProvider } from './app/providers/LanguageProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { useAppBootstrap  } from './modules/dashboard/hooks/useBootstrap';


// Pages
import { Dashboard } from './modules/dashboard';
import { Login } from './modules/auth/pages/Login';
import { Sites } from './modules/sites/pages/SitesPage';
import { SiteEditor } from './modules/sites/pages/SiteEditorPage';
import { PublicSite } from './modules/sites/pages/PublicSitePage';
import { Profile } from './modules/users/pages/Profile';
import Media from './modules/media/pages/MediaPage';
import { Settings } from './modules/users/pages/Settings';
import { Register } from './modules/auth/pages/Register';
import { Home } from './app/pages/Home';
import { ForgotPassword } from './modules/auth/pages/ForgotPassword';
import { ResetPassword } from './modules/auth/pages/ResetPassword';
import Users from './modules/users/pages/Users';
import { WaitingPage } from './modules/auth/pages/WaitingPage';
import { PageEditor } from './modules/pageBuilder/pages/PageEditor';

const GOOGLE_CLIENT_ID = 'xxx';

// =====================
// ROUTES GUARDS
// =====================
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

// =====================
// APP CONTENT
// =====================
const AppContent: React.FC = () => {
  
  const themeMode = useSelector((s: RootState) => s.theme.mode);
    useAppBootstrap ();

  return (
    <MuiThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BuilderThemeProvider>
          <BrowserRouter>
            <Routes>

              {/* 🌍 PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/waiting-approval" element={<WaitingPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/site/:siteId" element={<PublicSite />} />
              <Route path="/test-editor" element={<PageEditor mode="edit" />} />

              {/* 🔐 PROTECTED */}
              <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/sites" element={<Sites />} />
                  <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
                  <Route path="/sites/:siteId/pages/new" element={<PageEditor mode="create" />} />
                  <Route path="/sites/:siteId/pages/:pageId/edit" element={<PageEditor mode="edit" />} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route element={<AdminRoute />}>
                    <Route path="/users" element={<Users />} />
                  </Route>

                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </BuilderThemeProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

// =====================
// ROOT APP
// =====================
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