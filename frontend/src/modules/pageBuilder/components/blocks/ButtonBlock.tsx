import { Button, Box } from '@mui/material';

// الـ Component توّة يركز كان على الـ UI
// الـ styles والـ props يجيوه "حاضرين" مالـ RenderTree
export const ButtonBlock = ({ label, url, styles, context }: any) => {
  
  // الـ styles هنا توّة هي Object CSS نقي (مثلاً: { color: 'red', padding: '10px' })
  const containerStyles = { 
    textAlign: styles.textAlign || 'center',
    py: 1 
  };

  return (
    <Box sx={containerStyles}>
      <Button 
        // الـ variant يجي مالـ props أو styles حسب الـ Registry متاعك
        variant="contained" 
        style={{
          ...styles, // نطبقوا الـ Resolved Styles مباشرة
          textTransform: 'none', 
        }}
        href={url}
        target="_blank"
        // الـ context يقلنا إحنا في الـ editor وإلا في الـ public
        disabled={context?.mode === 'editor'} 
      >
        {label || "Button"}
      </Button>
    </Box>
  );
};