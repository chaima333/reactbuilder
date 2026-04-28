import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { blockRegistry } from '../../core/blockRegistry';

interface BlockLibraryProps {
  onAdd: (type: string, defaultData: any) => void; 
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAdd }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>
        COMPOSANTS
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Object.entries(blockRegistry).map(([type, config]) => (
          <Button
            key={type}
            variant="outlined"
            startIcon={config.icon}
            // نبعثوا النوع والـ Default Data للـ Hook باش يصنع البلوك
            onClick={() => onAdd(type, config.defaultData)} 
            fullWidth
            sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1 }}
          >
            {config.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};