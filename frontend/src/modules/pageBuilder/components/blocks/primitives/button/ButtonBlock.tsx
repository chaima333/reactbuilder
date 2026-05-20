import { Box } from "@mui/material";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";
import { BlockRendererProps } from "../../../../types/page.types";
import { ButtonPrimitive } from "../../../primitives/ButtonPrimitive";

export const ButtonBlock = ({ data, context, device = "desktop" }: BlockRendererProps) => { 
  const props = data.props as { label?: string; url?: string };
  const resolvedStyle = useResolvedStyle(data?.style as any, device);
  
  return (
    <Box sx={{ textAlign: resolvedStyle.textAlign || "center", py: 1, pointerEvents: "none" }}>
      <ButtonPrimitive
        label={props.label || "Button"}
        href={props.url || "#"}
        disabled={context?.mode === "editor"}
        style={resolvedStyle}
      />
    </Box>
  );
};