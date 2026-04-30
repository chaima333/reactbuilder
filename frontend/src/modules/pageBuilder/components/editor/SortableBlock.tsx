import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, IconButton, Stack, Tooltip } from '@mui/material';
import { 
  ContentCopy, 
  ControlPointDuplicate, 
  ContentPaste, 
  DragIndicator,
  Delete
} from '@mui/icons-material';

export const SortableBlock = ({ 
  id, 
  children, 
  isSelected, 
  onClick, 
  hoverData, 
  setHoverData,
  // 🔥 الـ Actions الجدد
  onDuplicate,
  onCopy,
  onPaste,
  onDelete 
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const position = e.clientY < middleY ? "before" : "after";
    setHoverData({ overId: id, position });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as 'relative',
    marginBottom: '8px',
  };

  return (
    <Box 
      ref={setNodeRef} 
      style={style} 
      onMouseMove={handleMouseMove} 
      onClick={(e) => {
        e.stopPropagation(); // منع الـ selection متاع الـ parent
        onClick();
      }}
      sx={{
        '&:hover .block-actions': { opacity: 1 } // إظهار الأزرار عند الـ hover (اختياري)
      }}
    >
      {/* 🔵 Drop Indicator (الخيط الأزرق) */}
      {hoverData?.overId === id && !isDragging && (
        <Box sx={{
          position: "absolute",
          left: 0, right: 0, height: "3px", bgcolor: "#1976d2", zIndex: 10,
          top: hoverData.position === "before" ? -4 : "auto",
          bottom: hoverData.position === "after" ? -4 : "auto",
          borderRadius: "2px",
        }} />
      )}

      {/* 🛠️ Floating Toolbar: يظهر فوق البلوك المختار بالظبط */}
      {isSelected && !isDragging && (
        <Stack 
          direction="row" 
          spacing={0.5}
          className="block-actions"
          sx={{
            position: 'absolute',
            top: -35,
            right: 0,
            bgcolor: '#1976d2',
            borderRadius: '4px 4px 0 0',
            p: '2px 4px',
            zIndex: 20,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Tooltip title="Duplicate"><IconButton size="small" onClick={() => onDuplicate(id)} sx={{ color: 'white', p: 0.5 }}><ControlPointDuplicate fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Copy"><IconButton size="small" onClick={() => onCopy(id)} sx={{ color: 'white', p: 0.5 }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Paste After"><IconButton size="small" onClick={() => onPaste(id)} sx={{ color: 'white', p: 0.5 }}><ContentPaste fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => onDelete(id)} sx={{ color: 'white', p: 0.5, '&:hover': { color: '#ffcdd2' } }}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )}
      
      <Paper 
        elevation={isSelected ? 3 : 1} 
        sx={{ 
          p: 2, 
          cursor: 'default',
          border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': { border: !isSelected ? '2px solid #e0e0e0' : '2px solid #1976d2' }
        }}
      >
        {/* 🖐️ Drag Handle (النقاط اللي نجروا منهم) */}
        <Box 
          {...attributes} 
          {...listeners} 
          sx={{ 
            cursor: 'grab', 
            width: 'fit-content', 
            mb: 1, 
            color: '#999',
            '&:hover': { color: '#1976d2' }
          }}
        >
          <DragIndicator fontSize="small" />
        </Box>

        {children}
      </Paper>
    </Box>
  );
};