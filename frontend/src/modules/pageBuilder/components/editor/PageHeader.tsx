import { 
  ToggleButton, 
  ToggleButtonGroup, 
  Stack, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';

import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Visibility, 
  Save, 
  Undo, 
  Redo,
  Edit,
  Publish
} from '@mui/icons-material';

interface PageHeaderProps {

  title: string;

  device:
    "desktop" |
    "tablet" |
    "mobile";

  onDeviceChange:
    (
      device:
        "desktop" |
        "tablet" |
        "mobile"
    ) => void;

  onPreview: () => void;

  isPreview: boolean;

  onSave: () => void;

  onPublish: () => void;
  hasPageId: boolean;
  loading: boolean;

  canUndo: boolean;

  canRedo: boolean;

  onUndo: () => void;

  onRedo: () => void;
}

export const PageHeader = ({ 

  title, 

  device, 

  onDeviceChange, 

  onPreview, 

  isPreview, 

  onSave,

  onPublish,

  loading,

  hasPageId,

  canUndo,

  canRedo,

  onUndo,

  onRedo

}: PageHeaderProps) => {

  return (

    <Stack 

      direction="row" 

      justifyContent="space-between" 

      alignItems="center" 

      sx={{ 

        p: "8px 16px",

        borderBottom:
          '1px solid #e0e0e0',

        bgcolor: '#fff',

        height: '56px'
      }}
    >

      {/* 🏷️ TITLE */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
      >

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: '#333'
          }}
        >
          {title || "Untitled Page"}
        </Typography>

        {loading && (

          <CircularProgress
            size={16}
            sx={{
              color: '#666'
            }}
          />
        )}
      </Stack>

      {/* 📱 DEVICES + HISTORY */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
      >

        <ToggleButtonGroup

          value={device}

          exclusive

          onChange={(_, val) =>

            val &&
            onDeviceChange(val)
          }

          size="small"

          sx={{
            height: '32px'
          }}
        >

          <ToggleButton value="desktop">
            <Monitor fontSize="small" />
          </ToggleButton>

          <ToggleButton value="tablet">
            <Tablet fontSize="small" />
          </ToggleButton>

          <ToggleButton value="mobile">
            <Smartphone fontSize="small" />
          </ToggleButton>

        </ToggleButtonGroup>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            height: '24px',
            alignSelf: 'center'
          }}
        />

        {/* UNDO / REDO */}

        <Stack
          direction="row"
          spacing={0.5}
        >

          <Tooltip title="Undo (Ctrl+Z)">
            <span>

              <IconButton

                onClick={onUndo}

                disabled={!canUndo}

                size="small"
              >
                <Undo fontSize="small" />
              </IconButton>

            </span>
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Y)">
            <span>

              <IconButton

                onClick={onRedo}

                disabled={!canRedo}

                size="small"
              >
                <Redo fontSize="small" />
              </IconButton>

            </span>
          </Tooltip>

        </Stack>
      </Stack>

      {/* 🚀 ACTIONS */}

      <Stack
        direction="row"
        spacing={1.5}
      >

        {/* PREVIEW */}

        <Button 

          size="small"

          onClick={onPreview}

          variant="outlined"

          color="inherit"

          startIcon={

            isPreview

              ? <Edit fontSize="small" />

              : <Visibility fontSize="small" />
          }

          sx={{

            textTransform: 'none',

            borderRadius: '6px'
          }}
        >

          {isPreview

            ? "Back to Editor"

            : "Preview"}
        </Button>

        {/* SAVE */}

        <Button 

          size="small"

          variant="contained"

          onClick={onSave}

          disabled={loading}

          startIcon={
            <Save fontSize="small" />
          }

          sx={{ 

            textTransform: 'none',

            borderRadius: '6px',

            boxShadow: 'none',

            '&:hover': {

              boxShadow: 'none'
            }
          }}
        >

          {loading

            ? "Saving..."

            : "Save Changes"}
        </Button>

        {/* PUBLISH */}

        <Button

          size="small"

          variant="contained"

          color="success"

          onClick={onPublish}
           
          disabled={!hasPageId}

          startIcon={
            <Publish fontSize="small" />
          }

          sx={{

            textTransform: 'none',

            borderRadius: '6px',

            boxShadow: 'none',

            '&:hover': {

              boxShadow: 'none'
            }
          }}
        >

          Publish

        </Button>

      </Stack>
    </Stack>
  );
};