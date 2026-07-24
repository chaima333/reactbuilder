import {
  Alert,
  Box,
  Button,
  Link,
  TextField,
  Typography
} from "@mui/material";

import type {
  FormEvent,
  ReactNode
} from "react";

export const VisitorAuthCard = ({
  title,
  subtitle,
  children,
  submitText,
  disabled,
  loading,
  message,
  error,
  preSubmit,
  footer,
  onSubmit,
  variant = "card",
  style
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitText: string;
  disabled: boolean;
  loading?: boolean;
  message?: string | null;
  error?: string | null;
  preSubmit?: ReactNode;
  footer?: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  variant?: "card" | "minimal" | "split";
  style?: React.CSSProperties;
}) => {
  const isMinimal =
    variant === "minimal";

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      style={style}
      sx={{
        width: "100%",
        maxWidth: isMinimal ? 520 : 460,
        mx: "auto",
        p:
          isMinimal
            ? 0
            : "var(--visitor-auth-card-padding, 32px)",
        borderRadius:
          isMinimal
            ? 0
            : "var(--visitor-auth-card-radius, 16px)",
        border:
          isMinimal
            ? "none"
            : "var(--visitor-auth-card-border, 1px solid rgba(15,23,42,0.12))",
        background:
          isMinimal
            ? "transparent"
            : "var(--visitor-auth-card-bg, var(--mui-palette-background-paper, #fff))",
        color:
          "var(--visitor-auth-text-color, inherit)",
        boxShadow:
          isMinimal
            ? "none"
            : "var(--visitor-auth-card-shadow, 0 18px 50px rgba(15,23,42,0.12))",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: "var(--visitor-auth-card-accent-content, none)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height:
            "var(--visitor-auth-card-accent-height, 0)",
          background:
            "var(--visitor-auth-card-accent-bg, transparent)"
        }
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontFamily:
            "var(--visitor-auth-heading-font-family, inherit)",
          fontSize:
            "var(--visitor-auth-title-font-size, clamp(1.75rem, 3vw, 2.5rem))",
          fontWeight:
            "var(--visitor-auth-title-font-weight, 700)",
          lineHeight: 1.1,
          letterSpacing:
            "var(--visitor-auth-title-letter-spacing, normal)",
          color:
            "var(--visitor-auth-title-color, currentColor)",
          mb: subtitle ? 1 : 3
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            color:
              "var(--visitor-auth-subtitle-color, var(--mui-palette-text-secondary, rgba(0,0,0,0.6)))",
            fontSize:
              "var(--visitor-auth-subtitle-font-size, 1rem)",
            mb: 3,
            lineHeight: 1.6
          }}
        >
          {subtitle}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gap: "var(--visitor-auth-field-gap, 16px)"
        }}
      >
        {children}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}

      {preSubmit && (
        <Box
          sx={{
            mt:
              "var(--visitor-auth-presubmit-margin-top, 18px)",
            display: "flex",
            justifyContent:
              "var(--visitor-auth-presubmit-justify, flex-end)",
            alignItems:
              "var(--visitor-auth-presubmit-align, center)",
            color:
              "var(--visitor-auth-presubmit-color, inherit)"
          }}
        >
          {preSubmit}
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled || loading}
        sx={{
          mt: "var(--visitor-auth-button-margin-top, 24px)",
          py: 1.25,
          minHeight:
            "var(--visitor-auth-button-height, 46px)",
          borderRadius:
            "var(--visitor-auth-button-radius, 4px)",
          border:
            "var(--visitor-auth-button-border, none)",
          background:
            "var(--visitor-auth-button-bg, var(--mui-palette-primary-main, #1976d2))",
          color:
            "var(--visitor-auth-button-color, #fff)",
          fontFamily:
            "var(--visitor-auth-button-font-family, inherit)",
          fontWeight:
            "var(--visitor-auth-button-font-weight, 700)",
          fontSize:
            "var(--visitor-auth-button-font-size, 0.875rem)",
          letterSpacing:
            "var(--visitor-auth-button-letter-spacing, normal)",
          textTransform:
            "var(--visitor-auth-button-text-transform, uppercase)",
          boxShadow:
            "var(--visitor-auth-button-shadow, none)",
          "&:hover": {
            background:
              "var(--visitor-auth-button-hover-bg, var(--visitor-auth-button-bg, var(--mui-palette-primary-dark, #1565c0)))",
            boxShadow:
              "var(--visitor-auth-button-hover-shadow, var(--visitor-auth-button-shadow, none))"
          },
          "&.Mui-disabled": {
            background:
              "var(--visitor-auth-button-disabled-bg, var(--visitor-auth-button-bg, rgba(0,0,0,0.12)))",
            color:
              "var(--visitor-auth-button-disabled-color, var(--visitor-auth-button-color, rgba(0,0,0,0.26)))",
            opacity:
              "var(--visitor-auth-button-disabled-opacity, 0.65)"
          }
        }}
      >
        {loading ? "Please wait..." : submitText}
      </Button>

      {footer && (
        <Box
          sx={{
            mt: "var(--visitor-auth-footer-margin-top, 16px)",
            display: "flex",
            justifyContent:
              "var(--visitor-auth-footer-justify, space-between)",
            alignItems:
              "var(--visitor-auth-footer-align, center)",
            gap:
              "var(--visitor-auth-footer-gap, 16px)",
            flexWrap: "wrap",
            color:
              "var(--visitor-auth-footer-color, inherit)"
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

export const VisitorAuthTextField = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  disabled
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <Box
    sx={{
      display: "grid",
      gap:
        "var(--visitor-auth-label-gap, 8px)"
    }}
  >
    <Typography
      component="label"
      sx={{
        display: "block",
        fontFamily:
          "var(--visitor-auth-label-font-family, inherit)",
        fontWeight:
          "var(--visitor-auth-label-font-weight, 500)",
        fontSize:
          "var(--visitor-auth-label-font-size, 0.875rem)",
        letterSpacing:
          "var(--visitor-auth-label-letter-spacing, normal)",
        textTransform:
          "var(--visitor-auth-label-text-transform, none)",
        color:
          "var(--visitor-auth-label-color, currentColor)"
      }}
    >
      {label}
    </Typography>

    <TextField
      placeholder={placeholder}
      type={type}
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value)
      }
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight:
            "var(--visitor-auth-input-height, 56px)",
          borderRadius:
            "var(--visitor-auth-input-radius, 4px)",
          background:
            "var(--visitor-auth-input-bg, transparent)",
          color:
            "var(--visitor-auth-input-color, currentColor)",
          fontFamily:
            "var(--visitor-auth-input-font-family, inherit)",
          fontSize:
            "var(--visitor-auth-input-font-size, 1rem)",
          "& fieldset": {
            border:
              "var(--visitor-auth-input-border, 1px solid rgba(0,0,0,0.23))"
          },
          "&:hover fieldset": {
            border:
              "var(--visitor-auth-input-hover-border, var(--visitor-auth-input-border, 1px solid rgba(0,0,0,0.87)))"
          },
          "&.Mui-focused fieldset": {
            border:
              "var(--visitor-auth-input-focus-border, var(--visitor-auth-input-hover-border, var(--visitor-auth-input-border, 2px solid var(--mui-palette-primary-main, #1976d2))))",
            boxShadow:
              "var(--visitor-auth-input-focus-shadow, none)"
          }
        },
        "& input": {
          color:
            "var(--visitor-auth-input-color, currentColor)",
          padding:
            "var(--visitor-auth-input-padding, 16.5px 14px)"
        },
        "& input::placeholder": {
          color:
            "var(--visitor-auth-placeholder-color, currentColor)",
          opacity:
            "var(--visitor-auth-placeholder-opacity, 0.6)"
        },
        "& input:-webkit-autofill": {
          WebkitTextFillColor:
            "var(--visitor-auth-autofill-text-color, var(--visitor-auth-input-color, currentColor))",
          WebkitBoxShadow:
            "0 0 0 1000px var(--visitor-auth-autofill-bg, var(--visitor-auth-input-bg, transparent)) inset",
          caretColor:
            "var(--visitor-auth-input-color, currentColor)"
        }
      }}
    />
  </Box>
);

export const VisitorAuthLink = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    underline="hover"
    sx={{
      fontSize: 14,
      fontWeight: 600,
      color:
        "var(--visitor-auth-link-color, var(--mui-palette-primary-main, #1976d2))"
    }}
  >
    {children}
  </Link>
);
