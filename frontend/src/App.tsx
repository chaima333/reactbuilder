import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { PendingUsers } from './pages/PendingUsers';

// Composant pour protéger les routes admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (userRole !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  console.log('AppContent - isAuthenticated:', isAuthenticated);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Routes>
            {/* Routes publiques (pas de Layout) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/s/:subdomain" element={<PublicSite />} />
            
            {/* Routes admin protégées */}
            <Route 
              path="/pending-users" 
              element={
                <AdminRoute>
                  <Layout>
                    <PendingUsers />
                  </Layout>
                </AdminRoute>
              } 
            />
            
            {/* Routes protégées (avec Layout) */}
            <Route
              path="/*"
              element={
                isAuthenticated ? (
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/sites" element={<Sites />} />
                      <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
                      <Route path="/sites/:siteId/pages/new" element={<PageEditor />} />
                      <Route path="/sites/:siteId/pages/:pageId/edit" element={<PageEditor />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/media" element={<Media />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

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