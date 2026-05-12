import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toggleTheme } from '../../redux/features/themeSlice';
import { logout } from '../../redux/features/authSlice';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../providers/LanguageProvider';

interface TopbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void; // 👈 إضافة
  isCollapsed: boolean;       // 👈 إضافة
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onToggleCollapse, isCollapsed }) => {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* زر الموبايل */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* 🟢 زر الـ Toggle للـ Desktop */}
        <IconButton
          color="inherit"
          onClick={onToggleCollapse}
          sx={{ mr: 2, display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {isCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ReactBuilder CMS
        </Typography>

        <IconButton color="inherit" onClick={() => dispatch(toggleTheme())}>
          {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <Typography>{t.profile}</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography>{t.settings}</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Typography color="error">{t.logout}</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;