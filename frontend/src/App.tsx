import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';

import { store, RootState } from './redux/store';
import { lightTheme, darkTheme } from './theme';

import { Layout } from './components/Layout/Layout';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Sites } from './pages/Sites';
import { PageEditor } from './pages/PageEditor';
import { SiteEditor } from './pages/SiteEditor';
import { PublicSite } from './pages/PublicSite';
import { Profile } from './pages/Profile';
import { Media } from './pages/Media';
import { Settings } from './pages/Settings';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { ForgotPassword } from './pages/ForgotPassword'; 
import { ResetPassword } from './pages/ResetPassword';
import Users from './pages/Users';

import { LanguageProvider } from './context/LanguageContext';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { WaitingPage } from './pages/WaitingPage';

// 🔥 VOTRE CLIENT ID GOOGLE
const GOOGLE_CLIENT_ID = '386973697348-lm5v1bvoupl2l7t7kfqe89irlif6oo37.apps.googleusercontent.com';

// =====================
// 🔒 PROTECTED ROUTE
// =====================
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};

// =====================
// 🔒 ADMIN ROUTE
// =====================
const AdminRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'Admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

// =====================
// 🌐 APP CONTENT
// =====================
const AppContent: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Routes>
            {/* 🌍 PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/waiting-approval" element={<WaitingPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/site/:siteId" element={<PublicSite />} />

            {/* 🔒 PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout><Outlet /></Layout>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sites" element={<Sites />} />
                <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
                <Route path="/sites/:siteId/pages/new" element={<PageEditor />} />
                <Route path="/sites/:siteId/pages/:pageId/edit" element={<PageEditor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/media" element={<Media />} />
                <Route path="/settings" element={<Settings />} />

                {/* 🔥 ADMIN ONLY */}
                <Route element={<AdminRoute />}>
                  <Route path="/users" element={<Users />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

// =====================
// 🚀 APP ROOT
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