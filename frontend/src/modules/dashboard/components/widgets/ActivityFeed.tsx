import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  Web as SiteIcon,
  Description as PageIcon,
  Person as UserIcon,
  Image as MediaIcon,
  Extension as PluginIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// 🛠️ الـ Interface توّة مطابقة للي يبعثو الـ Orchestrator
interface ActivityFeedProps {
  data: any[];
  isLoading: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'site': return <SiteIcon fontSize="small" />;
    case 'page': return <PageIcon fontSize="small" />;
    case 'user': return <UserIcon fontSize="small" />;
    case 'media': return <MediaIcon fontSize="small" />;
    case 'plugin': return <PluginIcon fontSize="small" />;
    default: return <SiteIcon fontSize="small" />;
  }
};

const getActionText = (action: string, details: any) => {
  switch (action) {
    case 'site_created':
      return `a créé le site "${details?.name || 'Nouveau site'}"`;
    case 'page_published':
      return `a publié la page "${details?.title || 'Nouvelle page'}"`;
    case 'page_created':
      return `a créé la page "${details?.title || 'Nouvelle page'}"`;
    default:
      return `a effectué l'action "${action}"`;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ data, isLoading }) => {
  
  // ⏳ حالة التحميل (Skeleton)
  if (isLoading) {
    return (
      <Box py={2}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: 'flex', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // 📭 حالة لا يوجد بيانات
  if (!data || data.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary" variant="body2">
          Aucune activité récente pour le moment.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'transparent' }}>
      {data.map((activity) => (
        <ListItem key={activity.id} alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
          <ListItemAvatar>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(0, 196, 73, 0.1)', // أخضر خفيف شفاف
                color: '#00C449' // الأخضر متاع الـ Logo
              }}
            >
              {getIcon(activity.entityType)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body2" component="div" sx={{ color: '#0D0D0D', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 700 }}>{activity.user?.name || 'Utilisateur'}</span>{' '}
                {getActionText(activity.action, activity.details)}
              </Typography>
            }
            secondary={
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};