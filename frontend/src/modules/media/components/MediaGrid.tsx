import React from 'react';

import {
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
  VideoFile as VideoIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

interface MediaGridProps {
  media: any[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onEditAlt: (id: number, alt: string) => void;
}

const getFileIcon = (
  type: string,
  url: string
) => {

  if (type === 'image') {

    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        style={{
          width: '100%',
          height: '100px',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {

          console.error(
            "❌ IMAGE LOAD ERROR:",
            url
          );

          e.currentTarget.src =
            "https://via.placeholder.com/400x220?text=Image+Error";
        }}
      />
    );
  }

  const ext =
    url.split('.').pop()?.toLowerCase();

  switch (ext) {

    case 'pdf':
      return (
        <Box
          sx={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <PdfIcon
            sx={{
              fontSize: 70,
              color: '#f40f02'
            }}
          />
        </Box>
      );

    case 'mp4':
    case 'webm':
      return (
        <Box
          sx={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <VideoIcon
            sx={{
              fontSize: 70,
              color: '#ff0000'
            }}
          />
        </Box>
      );

    default:
      return (
        <Box
          sx={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FileIcon
            sx={{
              fontSize: 70,
              color: '#666'
            }}
          />
        </Box>
      );
  }
};

const getFileBadge = (
  type: string
) => {

  const badges: Record<
    string,
    { label: string; color: any }
  > = {

    image: {
      label: 'Image',
      color: 'primary'
    },

    video: {
      label: 'Vidéo',
      color: 'error'
    },

    audio: {
      label: 'Audio',
      color: 'success'
    },

    file: {
      label: 'Fichier',
      color: 'default'
    },
  };

  return (
    badges[type] || {
      label: 'Fichier',
      color: 'default'
    }
  );
};

export const MediaGrid:
React.FC<MediaGridProps> = ({
  media,
  isLoading,
  onDelete,
  onEditAlt
}) => {

  console.log(
    "📦 MEDIA DATA:",
    media
  );

  if (isLoading) {

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!media || media.length === 0) {

    return (
      <Box
        textAlign="center"
        py={8}
      >
        <Typography
          variant="h6"
          color="text.secondary"
        >
          Aucun fichier trouvé
        </Typography>
      </Box>
    );
  }

  return (

    <Box
      sx={{
        display: 'grid',

        gridTemplateColumns:
          'repeat(auto-fill, minmax(280px, 1fr))',

        gap: 3,

        width: '100%'
      }}
    >

      {media.map((item) => {

        console.log(
          "🖼️ ITEM:",
          item
        );

        const badge =
          getFileBadge(item.type);

        return (

          <Box
  key={item.id}
  sx={{
    border: '1px solid #eee',

    borderRadius: 3,

    overflow: 'hidden',

    backgroundColor: '#fff',

    boxShadow:
      '0 2px 10px rgba(0,0,0,0.05)',

    transition:
      'all 0.2s ease',

    display: 'flex',
    flexDirection: 'column',

    '&:hover': {
      transform:
        'translateY(-4px)',

      boxShadow:
        '0 8px 25px rgba(0,0,0,0.12)'
    }
  }}
>

  {/* PREVIEW */}

  <Box
    sx={{
      width: '100%',

      height: 220,

      overflow: 'hidden',

      backgroundColor:
        '#f5f5f5',

      cursor: 'pointer',

      position: 'relative',

      display: 'flex',

      alignItems: 'center',

      justifyContent: 'center',

      '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block'
      }
    }}

    onClick={() =>
      window.open(
        item.url,
        '_blank'
      )
    }
  >

    {getFileIcon(
      item.type,
      item.url
    )}

  </Box>

  {/* FOOTER */}

  <Box
    sx={{
      p: 2,

      display: 'flex',
      flexDirection: 'column',
      gap: 1,

      flexGrow: 1
    }}
  >

    <Typography
      variant="subtitle2"

      sx={{
        fontWeight: 600,

        overflow: 'hidden',

        textOverflow: 'ellipsis',

        whiteSpace: 'nowrap'
      }}
    >
      {
        item.originalName ||
        "Fichier sans nom"
      }
    </Typography>

    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >

      <Box
        display="flex"
        alignItems="center"
        gap={1}
      >

        <Chip
          label={badge.label}

          size="small"

          color={badge.color}

          sx={{
            fontSize:
              '0.65rem'
          }}
        />

        <Typography
          variant="caption"

          color="text.secondary"
        >
          {Math.round(
            item.size / 1024
          )} KB
        </Typography>

      </Box>

      <Box
        display="flex"
        gap={0.5}
      >

        <IconButton
          size="small"

          onClick={(e) => {

            e.stopPropagation();

            onEditAlt(
              item.id,
              item.alt || ''
            );
          }}
        >
          <EditIcon
            fontSize="small"
          />
        </IconButton>

        <IconButton
          size="small"

          onClick={(e) => {

            e.stopPropagation();

            onDelete(item.id);
          }}
        >
          <DeleteIcon
            fontSize="small"
            sx={{
              color: '#ff5252'
            }}
          />
        </IconButton>

      </Box>

    </Box>

  </Box>

</Box>
        );
      })}
    </Box>
  );
};