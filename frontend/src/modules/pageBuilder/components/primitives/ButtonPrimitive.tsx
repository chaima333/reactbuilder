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
      // نلغيو الـ href فقط في الـ Editor باش ما يخرجناش م الصفحة
      href={disabled ? undefined : href}
      disabled={disabled}
      sx={{
        textTransform: "none",
        // نضمنوا إنو الـ Button ما يقتلش الـ Click باش توصل للـ Renderer
        pointerEvents: disabled ? "none" : "auto",
        ...style,
      }}
    >
      {label || "Button"}
    </Button>
  );
};