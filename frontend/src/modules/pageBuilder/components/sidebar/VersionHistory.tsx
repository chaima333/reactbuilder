// src/modules/pageBuilder/components/VersionHistory.tsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider, CircularProgress } from '@mui/material';
import { Restore as RestoreIcon, History as HistoryIcon } from '@mui/icons-material';
import { PageVersion } from '../../../../redux/services/pages.api'; // تأكد من المسار الصحيح للـ Type

interface VersionHistoryProps {
  versions: PageVersion[];
  // نردوها تقبل string أو number باش تمشي مع الـ Hook اللي خدمناه
  onRestore: (id: any) => void; 
  isLoading: boolean;
}
export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, onRestore, isLoading }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <HistoryIcon color="primary" />
        <Typography variant="h6">Historique</Typography>
      </Box>
      
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <List>
          {versions.length === 0 && <Typography variant="caption">Aucune version trouvée</Typography>}
          {versions.map((v) => (
            <React.Fragment key={v.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => onRestore(v.id)} title="Restaurer">
                    <RestoreIcon />
                  </IconButton>
                }
              >
                <ListItemText
                 primary={v.versionNumber ? `Version #${v.versionNumber}` : `Révision #${v.id}`}
                  secondary={new Date(v.createdAt).toLocaleString()}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};