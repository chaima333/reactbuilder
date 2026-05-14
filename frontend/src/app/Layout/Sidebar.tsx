import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Web as SitesIcon,
  Image as MediaIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle, isCollapsed }) => { 
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin = userRole === 'Admin';
 const currentSite = useSelector(
  (state: RootState) => state.site.currentSite
);

const currentSiteId = currentSite?.id;

  const drawerWidth = isCollapsed ? 70 : 260;

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', adminOnly: false },
    { text: 'Mes Sites', icon: <SitesIcon />, path: '/sites', adminOnly: false },
    { text: 'Utilisateurs', icon: <UsersIcon />, path: '/users', adminOnly: true }, 
    {text: 'Médiathèque',icon: <MediaIcon />,path: currentSiteId  ? `/sites/${currentSiteId}/media` : '/sites',adminOnly: false},
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings', adminOnly: false },
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  const drawerContent = (
    <Box sx={{ overflow: 'hidden', height: '100%' }}>
      <Toolbar sx={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            display: isCollapsed ? 'none' : 'block',
            whiteSpace: 'nowrap'
          }}
        >
          ReactBuilder
        </Typography>
        {isCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>RB</Typography>
        )}
      </Toolbar>
      
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={isCollapsed ? item.text : ""} placement="right">
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: isCollapsed ? 0 : 1,
                    transition: 'opacity 0.2s ease'
                  }} 
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;