import React from "react";

import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";

import { blockRegistry }
from "../../core/blockRegistry";

import {
  BlockType,
} from "../../types/page.types";

interface Props {
  block: any;

  device:
    | "desktop"
    | "tablet"
    | "mobile";

  onChange:
    (data: any) => void;
}

export const InspectorPanel:
React.FC<Props> = ({
  block,
  device,
  onChange,
}) => {

  if (!block) {
    return (
      <Box
        p={3}
        textAlign="center"
      >
        <Typography
          color="text.secondary"
        >
          Sélectionnez un bloc pour l'éditer
        </Typography>
      </Box>
    );
  }

  const config =
    blockRegistry[
      block.type as BlockType
    ];

  const fields =
    config?.fields || [];

  // ===================================
  // GET EFFECTIVE VALUE
  // ===================================

  const getEffectiveValue =
    (field: any) => {

    // =========================
    // PROPS
    // =========================

    if (
      field.target ===
      "props"
    ) {

      return field.key
        .split(".")
        .reduce(
          (
            acc: any,
            part: string
          ) =>
            acc && acc[part],

          block.data?.props
        ) ?? "";
    }

    // =========================
    // STYLE
    // =========================

    // responsive field
    if (
      field.responsive
    ) {

      return (
        block.data?.style?.[
          device
        ]?.[field.key] ??

        block.data?.style
          ?.desktop?.[
            field.key
          ] ??

        ""
      );
    }

    // canonical desktop field
    return (
      block.data?.style
        ?.desktop?.[
          field.key
        ] ?? ""
    );
  };

  // ===================================
  // HANDLE CHANGE
  // ===================================

  const handleFieldChange =
    (
      field: any,
      value: any
    ) => {

    // deep clone
    const newData =
      JSON.parse(
        JSON.stringify(
          block.data
        )
      );

    // =========================
    // PROPS
    // =========================

    if (
      field.target ===
      "props"
    ) {

      const keys =
        field.key.split(".");

      let current =
        newData.props;

      for (
        let i = 0;
        i <
        keys.length - 1;
        i++
      ) {

        if (
          !current[
            keys[i]
          ]
        ) {

          current[
            keys[i]
          ] = {};
        }

        current =
          current[
            keys[i]
          ];
      }

      current[
        keys[
          keys.length - 1
        ]
      ] = value;

      onChange(newData);

      return;
    }

    // =========================
    // STYLE
    // =========================

    const deviceKey =
      field.responsive
        ? device
        : "desktop";

    if (
      !newData.style
    ) {

      newData.style = {};
    }

    if (
      !newData.style[
        deviceKey
      ]
    ) {

      newData.style[
        deviceKey
      ] = {};
    }

    newData.style[
      deviceKey
    ][field.key] = value;

    onChange(newData);
  };

  return (
    <Box p={2}>

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <Typography
        variant="subtitle1"
        fontWeight="800"
        sx={{
          mb: 0.5
        }}
      >
        {
          config?.label ||
          "Block Settings"
        }
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color:
            "primary.main",

          fontWeight:
            "bold",

          display:
            "block",

          mb: 2,
        }}
      >
        MODE:
        {" "}
        {
          device.toUpperCase()
        }

        {" "}

        {
          device ===
          "desktop"

            ? "🖥️"

            : device ===
              "tablet"

              ? "💻"

              : "📱"
        }
      </Typography>

      <Divider
        sx={{
          mb: 3
        }}
      />

      {/* ========================= */}
      {/* FIELDS */}
      {/* ========================= */}

      <Box
        sx={{
          display: "flex",

          flexDirection:
            "column",

          gap: 2.5,
        }}
      >

        {fields.map(
          (field: any) => (

          <TextField
            key={field.key}

            label={
              field.label
            }

            select={
              field.type ===
              "select"
            }

            type={
              field.type ===
              "color"

                ? "color"

                : "text"
            }

            fullWidth

            size="small"

            value={
              getEffectiveValue(
                field
              )
            }

            onChange={(
              e
            ) =>
              handleFieldChange(
                field,
                e.target.value
              )
            }

            InputLabelProps={
              field.type ===
              "color"

                ? {
                    shrink: true
                  }

                : undefined
            }
          >

            {field.type ===
              "select" &&

              field.options?.map(
                (
                  opt: any
                ) => (

                <MenuItem
                  key={
                    opt.value ||
                    opt
                  }

                  value={
                    opt.value ||
                    opt
                  }
                >
                  {
                    opt.label ||
                    opt
                  }
                </MenuItem>
              ))}
          </TextField>
        ))}
      </Box>
    </Box>
  );
};