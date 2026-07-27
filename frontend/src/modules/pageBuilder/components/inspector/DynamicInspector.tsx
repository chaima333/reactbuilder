// src/modules/pageBuilder/components/editor/inspectors/DynamicInspector.tsx

import React, {
  useMemo,
  useState
} from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography
} from "@mui/material";

import ExpandMoreIcon
  from "@mui/icons-material/ExpandMore";

import {
  getNestedValue,
  setNestedValue
} from "../../utils/pathUtils";

import {
  validateField
} from "../../utils/validators";

import {
  groupFieldsByCategory
} from "./utils/groupFieldsByCategory";

import type {
  Block,
  Device
} from "../../types/page.types";

import type {
  FieldDefinition,
  StyleFieldCategory
} from "../../types/field.types";

import type {
  StyleObject
} from "../../types/style.types";
import { resolveControl } from "./controls/resolveControl";

// =========================
// Props
// =========================

type Props = {

  block: Block;

  fields: FieldDefinition[];

  device: Device;

  onChange: (
    newData: Partial<Block["data"]>
  ) => void;
};

// =========================
// Category Labels
// =========================

const CATEGORY_LABELS:
  Record<
    StyleFieldCategory,
    string
  > = {

    layout: "Layout",

    spacing: "Spacing",

    typography: "Typography",

    visual: "Visual"
  };

// =========================
// Component
// =========================
const extractControlValue = (
  input: unknown
): unknown => {
  if (
    input &&
    typeof input === "object" &&
    "target" in input
  ) {
    const target =
      (input as any).target;

    if (
      target?.type === "checkbox"
    ) {
      return Boolean(
        target.checked
      );
    }

    return target?.value;
  }

  return input;
};
export const DynamicInspector = ({
  block,
  fields,
  device,
  onChange
}: Props) => {

  // =========================
  // Current Responsive Style
  // =========================

  const currentStyle:
    StyleObject =
      block.data.style?.[
        device
      ] ?? {};

  // =========================
  // Errors
  // =========================

  const [errors, setErrors] =
    useState<
      Record<
        string,
        string | null
      >
    >({});

  // =========================
  // Grouped Fields
  // =========================

  const groupedFields =
    useMemo(
      () =>
        groupFieldsByCategory(
          fields
        ),
      [fields]
    );

  // =========================
  // Field Renderer
  // =========================

  const renderField = (
    field: FieldDefinition
  ) => {

    // =========================
    // Value Resolution
    // =========================

    let value: unknown = "";

    // STYLE

    if (
      field.target === "style"
    ) {

      value =
        currentStyle[
          field.key as keyof StyleObject
        ] ?? "";
    }

    // PROPS

    else {

      value =
        getNestedValue(

          block.data.props,

          field.key

        ) ?? "";
    }

    // =========================
    // Error
    // =========================

    const fieldError =
      errors[field.key];

    // =========================
    // Change Handler
    // =========================

    const handleFieldChange = (
  input: unknown
) => {
  const rawValue =
    extractControlValue(input);

  const newValue =
    field.validation?.cssUnit &&
    typeof rawValue === "string"
      ? rawValue
          .trim()
          .replace(
            /[٪﹪％]/g,
            "%"
          )
      : rawValue;

      const error =
        validateField(

          newValue,

          field.validation
        );

      setErrors((prev) => ({

        ...prev,

        [field.key]:
          error
      }));

      // =========================
      // Props Update
      // =========================

      if (
        field.target === "props"
      ) {

        let updatedProps =
          setNestedValue(
            block.data.props || {},
            field.key,
            newValue
          );

        for (
          const dependentField
          of field.resetFields || []
        ) {
          updatedProps =
            setNestedValue(
              updatedProps,
              dependentField,
              ""
            );
        }

        onChange({
          props: updatedProps
        });

        return;
      }

      // =========================
      // Style Update
      // =========================

      onChange({

        style: {

          ...block.data.style,

          [device]: {

            ...currentStyle,

            [field.key]:
              newValue
          }
        }
      });
    };

    // =========================
    // Control Lookup
    // =========================
    const Control =
      resolveControl(field);

    if (!Control) {
      return (
        <Box
          key={field.key}
          sx={{
            border: "1px solid",
            borderColor: "warning.light",
            borderRadius: 1,
            p: 1
          }}
        >
          <Typography
            variant="caption"
            color="warning.main"
          >
            Unsupported inspector control: {field.type}
          </Typography>
        </Box>
      );
    }

    // =========================
    // Render
    // =========================

    return (

      <Control
        key={field.key}
        field={field}
        block={block}
        label={field.label}
        value={value}
        error={fieldError}

        options={
          "options" in field
            ? field.options
            : undefined
        }

        itemSchema={
          "itemSchema" in field
            ? field.itemSchema
            : undefined
        }

        multiline={
          field.type ===
          "textarea"
        }

        rows={
          field.type ===
          "textarea"
            ? 4
            : 1
        }

        onChange={
          handleFieldChange
        }
      />
    );
  };

  // =========================
  // Render
  // =========================

  return (

    <Box
      sx={{

        display: "flex",

        flexDirection: "column",

        gap: 2.5,

        p: 1
      }}
    >

      {/* ========================= */}
      {/* Props Fields */}
      {/* ========================= */}

      {groupedFields
        .uncategorized
        .length > 0 && (

        <Box
          sx={{

            display: "flex",

            flexDirection:
              "column",

            gap: 2
          }}
        >

          {groupedFields
            .uncategorized
            .map(renderField)}

        </Box>
      )}

      {/* ========================= */}
      {/* Style Categories */}
      {/* ========================= */}

      {(
        Object.keys(
          CATEGORY_LABELS
        ) as StyleFieldCategory[]
      ).map((category) => {

        const categoryFields =
          groupedFields[
            category
          ];

        if (
          categoryFields
            .length === 0
        ) {

          return null;
        }

        return (

          <Accordion
            key={category}

            disableGutters

            elevation={0}
          >

            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon />
              }
            >

              <Typography
                fontWeight={600}
              >

                {
                  CATEGORY_LABELS[
                    category
                  ]
                }

              </Typography>

            </AccordionSummary>

            <AccordionDetails>

              <Box
                sx={{

                  display: "flex",

                  flexDirection:
                    "column",

                  gap: 2
                }}
              >

                {categoryFields
                  .map(renderField)}

              </Box>

            </AccordionDetails>

          </Accordion>
        );
      })}
    </Box>
  );
};
