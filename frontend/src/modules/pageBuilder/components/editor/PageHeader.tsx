import { 
  ToggleButton, 
  ToggleButtonGroup, 
  Stack, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip,
  Divider,
  CircularProgress,
  Box
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
  Publish,
  Code
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
  errors: any[];
  onExport?: () => void; 
  onImport?: (file: File) => void;
  onImportHtml?: () => void;
}

export const PageHeader = ({ 
 title, device, onDeviceChange, onPreview, isPreview, onSave,
 onPublish,loading,hasPageId,canUndo,canRedo,onUndo,
 onRedo,errors = [],onExport,onImport,
}: PageHeaderProps) => {
const hasErrors = errors.length > 0;
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
        spacing={1} // نقصت شوية في الـ spacing باش نلقاو بلاصة
        alignItems="center"
      >
        {/* 📥 IMPORT BUTTON */}
        <Tooltip title="Import Page JSON">
          <IconButton component="label" size="small" color="primary">
            <Edit sx={{ transform: 'rotate(180deg)', fontSize: 20 }} /> {/* أيقونة تعبيرية */}
            <input 
              type="file" 
              hidden 
              accept=".json" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onImport) onImport(file);
                e.target.value = ''; // يصفر الـ input
              }} 
            />
          </IconButton>
        </Tooltip>

        {/* 📤 EXPORT BUTTON */}
        <Tooltip title="Export Page JSON">
          <IconButton size="small" color="primary" onClick={onExport}>
             <Save sx={{ fontSize: 20 }} /> {/* أو أيقونة Download */}
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ height: '24px', mx: 0.5 }} />

        {/* PREVIEW */}
        <Button 
          size="small"
          onClick={onPreview}
          variant="outlined"
          color="inherit"
          startIcon={isPreview ? <Edit fontSize="small" /> : <Visibility fontSize="small" />}
          sx={{ textTransform: 'none', borderRadius: '6px' }}
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>

        {/* SAVE CHANGES */}
        <Button 
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={loading}
          startIcon={<Save fontSize="small" />}
          sx={{ 
            textTransform: 'none', borderRadius: '6px', boxShadow: 'none',
            bgcolor: '#f5f5f5', color: '#333',
            '&:hover': { bgcolor: '#eeeeee', boxShadow: 'none' }
          }}
        >
          {loading ? "..." : "Save"}
        </Button>

        {/* PUBLISH */}
        <Tooltip title={errors.length > 0 ? `Fix ${errors.length} errors` : "Publish"}>
          <span>
            <Button
              size="small"
              variant="contained"
              color={errors.length > 0 ? "error" : "success"}
              onClick={onPublish}
              disabled={!hasPageId || errors.length > 0 || loading}
              startIcon={<Publish fontSize="small" />}
              sx={{ textTransform: 'none', borderRadius: '6px', boxShadow: 'none' }}
            >
              Publish
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
};