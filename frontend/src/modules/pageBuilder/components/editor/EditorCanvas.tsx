import { Box } from "@mui/material";
import { BlockRenderer } from "./BlockRenderer";

export const EditorCanvas = ({
  blocks,
  registry,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  device,
}: any) => {
  return (
    <Box sx={{ p: 4 }}>
      {blocks.map((block: any) => (
        <BlockRenderer
          key={block.id}
          block={block}
          registry={registry}
          device={device}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </Box>
  );
};