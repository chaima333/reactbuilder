import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  alpha,
  useTheme,
  Divider,
  Tooltip,
} from '@mui/material';

import {
  Restore as RestoreIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  Widgets as BlocksIcon,
  CheckCircle as CurrentIcon,
  Terminal as EngineIcon,
} from '@mui/icons-material';

import { PageVersion } from '../../../../redux/services/pages.api';

/* ==========================================================================
   1. CONTRACTS & INTERFACES
   ========================================================================== */

/**
 * Metadata contract for version identification
 */
interface VersionMetadata {
  blockCount?: number;
  size?: string;
  editorVersion?: string;
  snapshotLabel?: string;
}

interface VersionHistoryProps {
  versions: PageVersion[];
  currentVersionId?: string;
  onRestore: (id: string) => void;
  isLoading: boolean;
}




/* ==========================================================================
   2. COMPONENT: VERSION HISTORY
   ========================================================================== */
const countBlocks = (
 blocks:any[]
):number => {

 let total = 0;

 const walk = (
  arr:any[]
 ) => {

   arr.forEach(block => {

     total++;

     if (
       block.children?.length
     ) {

       walk(block.children);

     }
   });
 };

 walk(blocks || []);

 return total;
};
export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionId,
  onRestore,
  isLoading,
}) => {
  const theme = useTheme();

  /* --- LOADING STATE --- */
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
        <CircularProgress size={32} thickness={5} />
      </Box>
    );
  }

  /* --- EMPTY STATE --- */
  const isEmpty = versions.length === 0;

  return (
    <Box sx={{ p: 2 }}>
      
      {/* --- HEADER --- */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1.5, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex' 
          }}
        >
          <HistoryIcon color="primary" fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Historique
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Snapshots et points de restauration
          </Typography>
        </Box>
      </Stack>

      {isEmpty && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            border: `2px dashed ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Aucune version enregistrée pour le moment.
          </Typography>
        </Paper>
      )}

      {/* --- VERSION LIST --- */}
      <Stack spacing={2}>
        {versions.map((v) => {
        const metadata = ((v as any).metadata || {}) as VersionMetadata;
          const isCurrent = String(v.id) === String(currentVersionId);

          return (
            <Paper
              key={v.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: isCurrent ? theme.palette.primary.main : theme.palette.divider,
                bgcolor: isCurrent ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: theme.palette.primary.light,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
                  transform: 'translateY(-2px)'
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                
                {/* VERSION DETAILS */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {metadata.snapshotLabel || `Révision #${v.versionNumber || v.id.toString().slice(-4)}`}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label="Actuelle"
                        size="small"
                        color="primary"
                        icon={<CurrentIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {new Date(v.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Typography>

                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <BlocksIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {countBlocks(v.blocks)} blocks
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <StorageIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {metadata.size || '0 KB'}
                      </Typography>
                    </Stack>

                    {metadata.editorVersion && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EngineIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          v{metadata.editorVersion}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>

                {/* RESTORE ACTION */}
                {!isCurrent && (
                  <Tooltip title="Restaurer cette version" placement="left">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir restaurer cette version ?')) {
                          onRestore(String(v.id));
                        }
                      }}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '10px' }}>
                    UUID: {v.id}
                 </Typography>
                 {isCurrent && (
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, fontSize: '10px' }}>
                      SYNCHRONISÉ
                    </Typography>
                 )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};
