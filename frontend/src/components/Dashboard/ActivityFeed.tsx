import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
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

interface ActivityFeedProps {
  activities: any[];
}

const getIcon = (type: string) => {
  switch (type) {
    case 'site':
      return <SiteIcon />;
    case 'page':
      return <PageIcon />;
    case 'user':
      return <UserIcon />;
    case 'media':
      return <MediaIcon />;
    case 'plugin':
      return <PluginIcon />;
    default:
      return <SiteIcon />;
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

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          Aucune activité récente
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {activities.map((activity) => (
        <ListItem key={activity.id} alignItems="flex-start" sx={{ px: 0 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              {getIcon(activity.entityType)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body2" component="span">
                <strong>{activity.user?.name || 'Utilisateur'}</strong>{' '}
                {getActionText(activity.action, activity.details)}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
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