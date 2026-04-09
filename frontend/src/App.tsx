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
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { LanguageProvider } from './context/LanguageContext';
import { Register } from './pages/Register';
import { Home } from './pages/Home';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userRole !== 'Admin') return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/register" element={<RegisterRedirect />} />
            <Route path="/s/:subdomain" element={<PublicSite />} />
            <Route path="/site/:siteId" element={<PublicSite />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
              <Route path="/sites/:siteId/pages/new" element={<PageEditor />} />
              <Route path="/sites/:siteId/pages/:pageId/edit" element={<PageEditor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/media" element={<Media />} />
// Dans App.tsx, modifiez la route /users
<Route
  path="/users"
  element={
    <AdminRoute>  {/* ← Seuls les admins peuvent accéder */}
      <Layout>
        <Users />
      </Layout>
    </AdminRoute>
  }
/>              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const LoginRedirect = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />;
};

const RegisterRedirect = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />;
};

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Provider>
  );
}

export default App;