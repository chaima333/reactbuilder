import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, IconButton } from '@mui/material';
import { DragIndicator as DragIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
  onDelete?: () => void;
  // 👇 نزيدو الـ Props هذي باش TypeScript ما يقعدش يعطي في Error
  onClick?: () => void; 
  isSelected?: boolean;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ 
  id, 
  children, 
  onDelete, 
  onClick, 
  isSelected 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    // 🎨 الـ border يتبدل لونه كي يبدأ البلوك مختار (isSelected)
    border: isSelected 
      ? '2px solid #1976d2' 
      : isDragging 
        ? '2px solid #1976d2' 
        : '1px solid #eee',
    touchAction: 'none',
    cursor: 'default',
  };

  return (
    <Paper 
      ref={setNodeRef} 
      style={style} 
      elevation={isSelected || isDragging ? 4 : 1}
      onClick={(e) => {
        // نمنع الـ click من الانتشار باش ما يعملش مشاكل
        e.stopPropagation();
        onClick?.();
      }}
    >
      
      {/* Drag Handle */}
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mt: 1 }}>
        <DragIcon color={isSelected ? "primary" : "action"} />
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Delete */}
      {!isSelected && onDelete && (
        <IconButton 
          onClick={(e) => {
            e.stopPropagation(); // باش ما يختارش البلوك وقت اللي نحبوا نـفسخوه
            onDelete();
          }} 
          color="error" 
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Paper>
  );
};