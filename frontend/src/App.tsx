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
import { useAppBootstrap } from "./modules/dashboard/hooks/useAppBootstrap";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import { FigmaImportBridge } from "./modules/pageBuilder/pages/figma/FigmaImportBridge";
import AdminPlugins from "./modules/admin/pages/AdminPlugins";
import AdminAIAnalytics from "./modules/admin/pages/ai-analytics";
import SitePluginMarketplacePage from "./modules/pageBuilder/plugins/SitePluginMarketplacePage";
import AcceptInvitationPage from "./modules/sites/pages/AcceptInvitationPage";
import AdminAiTelemetrySitePage from "./modules/admin/pages/ai-telemetry-site";
import CmsCollectionsPage from "./modules/cms/CmsCollectionsPage";
import CmsCollectionDetailsPage from "./modules/cms/CmsCollectionDetailsPage";
import PublicCmsEntryPage from "./modules/cms/pages/CmsEntryPage";
import FormsPage from "./modules/forms/FormsPage";
import FormDetailsPage from "./modules/forms/FormDetailsPage";

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
  () => import("./modules/pageBuilder/runtime/public/PublicSitePage")
    .then(m => ({ default: m.PublicSite }))
);

const PublicPage = lazy(
  () => import("./modules/pageBuilder/runtime/public/PublicPage")
    .then(m => ({ default: m.PublicPage }))
);

const Profile = lazy(
  () => import("./modules/users/pages/Profile")
    .then(m => ({ default: m.Profile }))
);

const Settings = lazy(
  () => import("./modules/users/pages/Settings")
    .then(m => ({ default: m.Settings }))
);

const AdminSettings = lazy(
  () => import("./modules/admin/pages/AdminSettings")
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

const About = lazy(
  () => import("./app/pages/AboutPage")
    .then(m => ({ default: m.AboutPage }))
);

const Services = lazy(
  () => import("./app/pages/ServicesPage")
    .then(m => ({ default: m.ServicesPage }))
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

const SiteMembersPage = lazy(
  () => import("./modules/sites/pages/SiteMembersPage")
);

const PartnerApplicationsPage = lazy(
  () => import("./modules/partnerApplications/PartnerApplicationsPage")
);

const PublicPartnerApplicationPage = lazy(
  () => import("./modules/partnerApplications/PublicPartnerApplicationPage")
);

const HelpCenterPage = lazy(
  () => import("./modules/platformAssistant/pages/HelpCenterPage")
);

const Contact = lazy(
  () => import("./app/pages/ContactPage").then(m => ({ default: m.ContactPage }))
);

// ======================================================

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("GOOGLE_CLIENT_ID_USED:", GOOGLE_CLIENT_ID);

// ======================================================
// ROUTE GUARDS
// ======================================================

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated
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

  if (user?.role !== "ADMIN") {
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
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/waiting-approval" element={<WaitingPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* PUBLIC SITE ROUTES - ORDER MATTERS! Most specific first */}
                
                {/* 1. CMS Entry Page (3 dynamic params) */}
                <Route 
                  path="/site/:siteId/:collectionSlug/:entrySlug" 
                  element={<PublicCmsEntryPage />} 
                />
                
                {/* 2. Page Builder Page with ID ✅ NEW */}
                <Route 
                  path="/site/:siteId/page/:pageId" 
                  element={<PublicPage />} 
                />
                
                {/* 3. Public Page (2 dynamic params: siteId + slug) */}
                {/* This handles /site/:siteId/login AND /site/:siteId/register */}
                <Route 
                  path="/site/:siteId/:slug" 
                  element={<PublicSite />} 
                />
                
                {/* 4. Alternative pattern for public pages */}
                <Route 
                  path="/p/:siteId/:slug" 
                  element={<PublicPage />} 
                />
                
                {/* 5. Public Site (1 dynamic param) */}
                <Route 
                  path="/site/:siteId" 
                  element={<PublicSite />} 
                />
                
                {/* 6. Partner Application */}
                <Route 
                  path="/partner-apply/:siteId" 
                  element={<PublicPartnerApplicationPage />} 
                />
                
                {/* 7. Test Editor */}
                <Route 
                  path="/test-editor" 
                  element={<PageEditor mode="edit" />} 
                />

                {/* PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/help" element={<HelpCenterPage />} />
                    <Route path="/figma-import/:importId" element={<FigmaImportBridge />} />
                    <Route path="/sites" element={<Sites />} />
                    <Route path="/sites/:siteId/edit" element={<SiteEditor />} />
                    <Route path="/sites/:siteId/pages/new" element={<PageEditor mode="create" />} />
                    <Route path="/sites/:siteId/pages/:pageId/edit" element={<PageEditor mode="edit" />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/sites/:siteId/media" element={<Media />} />
                    <Route path="/sites/:siteId/plugins" element={<SitePluginMarketplacePage />} />
                    <Route path="/sites/:siteId/partner-applications" element={<PartnerApplicationsPage />} />
                    <Route path="/sites/:siteId/cms" element={<CmsCollectionsPage />} />
                    <Route path="/sites/:siteId/cms/collections/:collectionSlug" element={<CmsCollectionDetailsPage />} />
                    <Route path="/sites/:siteId/forms" element={<FormsPage />} />
                    <Route path="/sites/:siteId/forms/:formId" element={<FormDetailsPage />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* ADMIN ROUTES */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/plugins" element={<AdminPlugins />} />
                      <Route path="/admin/ai-analytics" element={<AdminAIAnalytics />} />
                      <Route path="/admin/ai-analytics/sites/:siteId" element={<AdminAiTelemetrySitePage />} />
                    </Route>
                    
                    <Route path="/sites/:siteId/members" element={<SiteMembersPage />} />
                    <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
                  </Route>
                </Route>

                {/* 404 - Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
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