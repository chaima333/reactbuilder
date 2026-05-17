// src/modules/pageBuilder/components/inspector/controls/semantic/SpacingControl.tsx

import React from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip
} from "@mui/material";
import { Tune, Style } from "@mui/icons-material";

interface SpacingControlProps {
  label: string;
  value: unknown;
  error?: string | null;
  onChange: (value: string) => void;
}

const SPACING_TOKENS = ["xs", "sm", "md", "lg", "xl"];

export const SpacingControl = ({
  label,
  value,
  error,
  onChange
}: SpacingControlProps) => {
  const stringValue = String(value ?? "");

  // 🧠 الأوتو ديتكت: هل القيمة الحالية هي توكين سيمنتك؟
  const isToken = SPACING_TOKENS.includes(stringValue);
  
  // إذا كانت فارغة، نعطيوها التوكين الافتراضي أو نخليوها راو حسب رغبة السيستم
  const mode = isToken || stringValue === "" ? "token" : "raw";

  const handleModeChange = (_e: any, newMode: "token" | "raw" | null) => {
    if (!newMode) return;
    
    if (newMode === "token") {
      onChange("md"); // Fallback للتوكين المتوسط عند التحويل
    } else {
      onChange("24px"); // Fallback لقيمة خام عند التحويل
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      
      {/* ========================================================= */}
      {/* Header Area: Label + Mode Switcher */}
      {/* ========================================================= */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {label}
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          sx={{ height: 24, "& .MuiToggleButton-root": { px: 1, py: 0 } }}
        >
          <ToggleButton value="token" value-id="token-mode">
            <Tooltip title="Semantic Tokens">
              <Style sx={{ fontSize: 14 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="raw" value-id="raw-mode">
            <Tooltip title="Custom Raw CSS">
              <Tune sx={{ fontSize: 14 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ========================================================= */}
      {/* Dynamic Workspace based on Mode */}
      {/* ========================================================= */}
      {mode === "token" ? (
        /* 1️⃣ Token Mode: Segmented Controls (Clean & Visual) */
        <ToggleButtonGroup
          value={stringValue}
          exclusive
          onChange={(_e, newValue) => newValue && onChange(newValue)}
          size="small"
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: "0.75rem"
            }
          }}
        >
          {SPACING_TOKENS.map((token) => (
            <ToggleButton key={token} value={token}>
              {token}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ) : (
        /* 2️⃣ Raw Mode: Pure CSS Input with Validation Safe-guard */
        <TextField
          size="small"
          value={stringValue}
          error={!!error}
          helperText={error}
          placeholder="e.g., 24px, 2rem"
          fullWidth
          onChange={(e) => onChange(e.target.value)}
          inputProps={{
            style: { fontFamily: "monospace", fontSize: "0.85rem" }
          }}
        />
      )}
    </Box>
  );
};