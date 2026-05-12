import { Box } from "@mui/material";

import { useResolvedStyle } from "../../core/theme/useResolvedStyle";

import {
  ResponsiveStyle,
} from "../../types/page.types";

import { ButtonPrimitive } from "../primitives/ButtonPrimitive";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type RuntimeMode =
  | "editor"
  | "preview"
  | "public";

interface ButtonProps {
  label: string;
  url: string;
}

interface ButtonBlockData {
  props: ButtonProps;

  style: ResponsiveStyle;
}

interface ButtonBlockProps {
  data: ButtonBlockData;

  context?: {
    mode?: RuntimeMode;
  };

  device?: Device;
}

export const ButtonBlock = ({
  data,
  context,
  device = "desktop",
}: ButtonBlockProps) => {

  const {
    label,
    url,
  } = data.props;

  const resolvedStyle =
    useResolvedStyle(
      data.style,
      device
    );

  const containerStyles = {
    textAlign:
      resolvedStyle.textAlign ||
      "center",

    py: 1,
  };

  return (
    <Box sx={containerStyles}>
      <ButtonPrimitive
        label={label || "Button"}

        href={url || "#"}

        disabled={
          context?.mode === "editor"
        }

        style={resolvedStyle}
      />
    </Box>
  );
};