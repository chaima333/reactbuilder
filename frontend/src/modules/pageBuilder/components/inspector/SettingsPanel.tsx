import { Box, TextField, Typography, Button, Divider, Stack } from "@mui/material";

type Props = {
  pageTitle: string;
  setPageTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  // 👑 الحقل الجديد باش التايب سكريبت يصفقلك
  onImportHtml?: () => void; 
};

export const SettingsPanel = ({
  pageTitle,
  setPageTitle,
  slug,
  setSlug,
  onExport,
  onImport,
  onImportHtml // 👑 استقبل الـ Prop الجديدة هوني
}: Props) => {
  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold">Settings</Typography>

      <TextField
        fullWidth
        label="Page Title"
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        sx={{ mt: 2 }}
      />

      <TextField
        fullWidth
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
        JSON SCHEMA TOOLS
      </Typography>
      
      <Stack spacing={2}>
        <Button variant="outlined" fullWidth onClick={onExport}>
          Export JSON
        </Button>

        <Button variant="outlined" component="label" fullWidth>
          Import JSON
          <input 
            type="file" 
            hidden 
            accept=".json" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImport) onImport(file);
            }} 
          />
        </Button>

        {/* 👑 زر الـ Real HTML Importer الجديد نزل في مكانه المضمون! */}
        {onImportHtml && (
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onImportHtml}
            sx={{ 
              bgcolor: '#1976d2', 
              color: '#fff', 
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { bgcolor: '#115293' }
            }}
          >
            📥 IMPORT FROM HTML
          </Button>
        )}
      </Stack>
    </Box>
  );
};