import React from "react";
import {Drawer,List,ListItem, ListItemButton, ListItemIcon,ListItemText,Toolbar, Box, Typography,Divider,useTheme,} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Web as SitesIcon,
  Image as MediaIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
  AutoAwesome as AIIcon,
  Extension as ExtensionIcon,
  Handshake as PartnerIcon,
  HelpOutline as HelpIcon,
  Storage as CmsIcon,
  DynamicForm as FormsIcon,
} from "@mui/icons-material";
import {
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  useSelector
} from "react-redux";
import {
  RootState
} from "../../redux/store";
import {
  useGetPlatformSettingsQuery,
  type PlatformSettings,
} from "../../redux/services/platform.api";

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isCollapsed: boolean;
}

type PluginKey = keyof Pick<
  PlatformSettings,
  "mediaPlugin" | "seoPlugin" | "versionPlugin" | "aiEnabled"
>;

type SidebarItem = {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  pluginKey?: PluginKey;
  siteAdminOnly?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onDrawerToggle,
  isCollapsed,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const currentSite = useSelector((state: RootState) => state.site.currentSite);
  const { data: platformSettings, isLoading } = useGetPlatformSettingsQuery();

  const isGlobalAdmin = userRole === "ADMIN";
  const currentSiteId = currentSite?.id;
  const drawerWidth = isCollapsed ? 72 : 256;

  const getCurrentSiteRole = () => {
    const site = currentSite as any;
    return (
      site?.role ||
      site?.memberRole ||
      site?.siteRole ||
      site?.membership?.role ||
      "VIEWER"
    );
  };

  const currentSiteRole = getCurrentSiteRole();

  const canSeeSiteSettings =
    !!currentSiteId &&
    (
      isGlobalAdmin ||
      currentSiteRole === "OWNER" ||
      currentSiteRole === "ADMIN"
    );

  const coreItems: SidebarItem[] = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Mes Sites",
      icon: <SitesIcon />,
      path: "/sites",
    },
    {
  text: "Help Center",
  icon: <HelpIcon />,
  path: "/help",
},
  ];

const workspaceItems: SidebarItem[] = [
  {
    text: "CMS",
    icon: <CmsIcon />,
    path: currentSiteId
      ? `/sites/${currentSiteId}/cms`
      : "/sites",
    siteAdminOnly: true,
  },
  {
    text: "Forms",
    icon: <FormsIcon />,
    path: currentSiteId
      ? `/sites/${currentSiteId}/forms`
      : "/sites",
    siteAdminOnly: true,
  },
  {
    text: "Médiathèque",
    icon: <MediaIcon />,
    path: currentSiteId ? `/sites/${currentSiteId}/media` : "/sites",
    pluginKey: "mediaPlugin",
  },
  {
    text: "Marketplace",
    icon: <ExtensionIcon />,
    path: currentSiteId ? `/sites/${currentSiteId}/plugins` : "/sites",
  },
  {
    text: "Demandes partenaires",
    icon: <PartnerIcon />,
    path: currentSiteId
      ? `/sites/${currentSiteId}/partner-applications`
      : "/sites",
    siteAdminOnly: true,
  },
];

  const bottomItems: SidebarItem[] = [
    {
      text: "Paramètres",
      icon: <SettingsIcon />,
      path: "/settings",
      siteAdminOnly: true,
    },
  ];

  const adminItems: SidebarItem[] = [
    {
      text: "Super Admin",
      icon: <AdminIcon />,
      path: "/admin",
      adminOnly: true,
    },
    {
      text: "AI Analytics",
      icon: <AIIcon />,
      path: "/admin/ai-analytics",
      adminOnly: true,
    },
    {
      text: "Utilisateurs",
      icon: <UsersIcon />,
      path: "/users",
      adminOnly: true,
    },
    {
      text: "Paramètres admin",
      icon: <SettingsIcon />,
      path: "/admin/settings",
      adminOnly: true,
    },
  ];

  const canShowItem = (item: SidebarItem): boolean => {
    if (item.adminOnly && !isGlobalAdmin) return false;
    if (item.siteAdminOnly && !canSeeSiteSettings) return false;
    if (isLoading && item.pluginKey) return false;
    if (item.pluginKey && platformSettings && platformSettings[item.pluginKey] === false) return false;
    return true;
  };

  const isActive = (path: string): boolean => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname === path;
  };

  const renderSectionTitle = (title: string) => {
    if (isCollapsed) return null;
    return (
      <Typography
        variant="caption"
        sx={{
          px: 3,
          py: 1.5,
          display: "block",
          fontWeight: 700,
          color: theme.palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          fontSize: "0.7rem",
        }}
      >
        {title}
      </Typography>
    );
  };

  const renderItems = (items: SidebarItem[]) =>
    items
      .filter(canShowItem)
      .map((item) => (
        <ListItem
          key={item.text}
          disablePadding
          sx={{
            display: "block",
            mb: 0.5,
            px: 1.5,
          }}
        >
          <ListItemButton
            selected={isActive(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              minHeight: 44,
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 0 : 2.5,
              py: 1,
              borderRadius: 2.5,
              color: isActive(item.path) 
                ? theme.palette.text.primary 
                : theme.palette.text.secondary,
              bgcolor: isActive(item.path) 
                ? theme.palette.action.selected 
                : "transparent",
              transition: "all 0.15s ease",

              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },

              "& .MuiListItemIcon-root": {
                color: isActive(item.path) 
                  ? theme.palette.primary.main 
                  : theme.palette.text.disabled,
                minWidth: 0,
                mr: isCollapsed ? 0 : 2.5,
                justifyContent: "center",
                transition: "color 0.15s ease",
              },

              "&:hover .MuiListItemIcon-root": {
                color: theme.palette.primary.main,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed ? 0 : 2.5,
                justifyContent: "center",
                color: isActive(item.path) 
                  ? theme.palette.primary.main 
                  : theme.palette.text.disabled,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: isActive(item.path) ? 600 : 500,
                letterSpacing: "0.01em",
                color: isActive(item.path) 
                  ? theme.palette.text.primary 
                  : theme.palette.text.secondary,
              }}
              sx={{
                opacity: isCollapsed ? 0 : 1,
                transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItemButton>
        </ListItem>
      ));

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        bgcolor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: isCollapsed ? "center" : "flex-start",
          px: isCollapsed ? 0 : 2.5,
          minHeight: 72,
        }}
      >
        {!isCollapsed ? (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                whiteSpace: "nowrap",
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
              }}
            >
              ReactBuilder
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: "0.65rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isGlobalAdmin ? "Super Admin" : "Workspace"}
            </Typography>
          </Box>
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              fontSize: "1.2rem",
              letterSpacing: "-0.02em",
            }}
          >
            RB
          </Typography>
        )}
      </Toolbar>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
        }}
      >
        <List sx={{ px: 0, pt: 1 }}>
          {renderSectionTitle("Workspace")}
          {renderItems(coreItems)}
          {renderItems(workspaceItems)}

          {isGlobalAdmin && (
            <>
              <Divider sx={{ my: 1.5 }} />
              {renderSectionTitle("Administration")}
              {renderItems(adminItems)}
            </>
          )}
        </List>
      </Box>

      <Divider />

      <List sx={{ px: 0, py: 1 }}>
        {renderItems(bottomItems)}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        transition: "width 0.2s ease",
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 256,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            transition: "width 0.2s ease",
            overflowX: "hidden",
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
