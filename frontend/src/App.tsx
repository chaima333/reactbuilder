import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'; // 1. تعريب الـ MUI Theme
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';

import { store, RootState } from './redux/store';
import { lightTheme, darkTheme } from './theme';
import { Layout } from './app/Layout/Layout';

// 🔥 الـ Provider الجديد متاع الـ SaaS Builder
import { ThemeProvider as BuilderThemeProvider } from './modules/pageBuilder/core/theme/ThemeProvider';

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

import { LanguageProvider } from './app/providers/LanguageProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PageEditor } from './modules/pageBuilder/pages/PageEditor';

const GOOGLE_CLIENT_ID = '386973697348-lm5v1bvoupl2l7t7kfqe89irlif6oo37.apps.googleusercontent.com';

// =====================
// 🔒 PROTECTED ROUTES
// =====================
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// =====================
// 🌐 APP CONTENT (Tenant Aware)
// =====================
const AppContent: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  return (
    // 🎨 MUI Theme: يتحكم في الـ Dashboard والـ Buttons متاع الـ System
    <MuiThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        
        {/* 🚀 Builder Theme: يتحكم في ألوان الـ Brand (الـ Emerald Green) متاع المواقع اللي باش تتصنع */}
        <BuilderThemeProvider>
          <BrowserRouter>
            <Routes>

              {/* 🌍 PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/waiting-approval" element={<WaitingPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route path="/site/:siteId" element={<PublicSite />} />

              {/* 🔐 PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><Outlet /></Layout>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/sites" element={<Sites />} />
                  <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
                  
                  {/* 🛠️ الـ Page Editor توّة يقرأ من الـ BuilderThemeProvider */}
                  <Route 
                    path="/sites/:siteId/pages/new" 
                    element={<PageEditor mode="create" />} 
                  />
                  <Route 
                    path="/sites/:siteId/pages/:pageId/edit" 
                    element={<PageEditor mode="edit" />} 
                  />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* 👮 ADMIN ROUTES */}
                  <Route element={<AdminRoute />}>
                    <Route path="/users" element={<Users />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </BuilderThemeProvider>

      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

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