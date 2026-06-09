import { Button } from "@mui/material";

interface ButtonPrimitiveProps {
  label: string;
  href?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const ButtonPrimitive = ({
  label,
  href,
  disabled,
  style,
}: ButtonPrimitiveProps) => {
  return (
    <Button
      variant="contained"
      href={disabled ? undefined : href}
      disabled={disabled}
      sx={{
        textTransform: "none",
        pointerEvents: disabled ? "none" : "auto",
        ...style,
      }}
    >
      {label || "Button"}
    </Button>
  );
};