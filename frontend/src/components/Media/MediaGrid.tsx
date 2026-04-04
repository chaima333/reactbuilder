import React from 'react';
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  VideoFile as VideoIcon,
  Audiotrack as AudioIcon,
  FolderZip as ArchiveIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

interface MediaGridProps {
  media: any[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onEditAlt: (id: number, alt: string) => void;
}

const getFileIcon = (type: string, url: string) => {
  if (type === 'image') {
    return <img src={`http://localhost:5000${url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  
  const ext = url.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return <PdfIcon sx={{ fontSize: 60, color: '#f40f02' }} />;
    case 'doc':
    case 'docx':
      return <DocIcon sx={{ fontSize: 60, color: '#2b579a' }} />;
    case 'mp4':
    case 'webm':
    case 'mov':
      return <VideoIcon sx={{ fontSize: 60, color: '#ff0000' }} />;
    case 'mp3':
    case 'wav':
      return <AudioIcon sx={{ fontSize: 60, color: '#1db954' }} />;
    case 'zip':
    case 'rar':
      return <ArchiveIcon sx={{ fontSize: 60, color: '#ff8c00' }} />;
    default:
      return <FileIcon sx={{ fontSize: 60, color: '#666' }} />;
  }
};

const getFileBadge = (type: string) => {
  const badges: Record<string, { label: string; color: any }> = {
    image: { label: 'Image', color: 'primary' },
    video: { label: 'Vidéo', color: 'error' },
    audio: { label: 'Audio', color: 'success' },
    document: { label: 'Document', color: 'info' },
    archive: { label: 'Archive', color: 'warning' },
  };
  return badges[type] || { label: 'Fichier', color: 'default' };
};

export const MediaGrid: React.FC<MediaGridProps> = ({ media, isLoading, onDelete, onEditAlt }) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (media.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucun fichier
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uploader votre premier fichier (images, PDF, vidéos, etc.)
        </Typography>
      </Box>
    );
  }

  return (
    <ImageList cols={4} gap={16}>
      {media.map((item) => {
        const badge = getFileBadge(item.type);
        return (
          <ImageListItem key={item.id}>
            <Box
              sx={{
                height: 200,
                bgcolor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => window.open(`http://localhost:5000${item.url}`, '_blank')}
            >
              {getFileIcon(item.type, item.url)}
            </Box>
            <ImageListItemBar
              title={item.filename.length > 30 ? item.filename.substring(0, 30) + '...' : item.filename}
              subtitle={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={badge.label} size="small" color={badge.color} />
                  <span>{Math.round(item.size / 1024)} KB</span>
                </Box>
              }
              actionIcon={
                <Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditAlt(item.id, item.alt || '')}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(item.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            />
          </ImageListItem>
        );
      })}
    </ImageList>
  );
};