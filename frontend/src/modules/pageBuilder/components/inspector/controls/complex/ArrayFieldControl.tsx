import React from "react";

import {
  Box,
  Button,
  TextField,
  Typography
} from "@mui/material";

interface ArrayFieldControlProps {

  label: string;

  value: any[];

  itemSchema: any[];

  onChange: (
    value: any[]
  ) => void;
}

export const ArrayFieldControl = ({
  label,
  value = [],
  itemSchema,
  onChange
}: ArrayFieldControlProps) => {

  const handleAdd = () => {

    const emptyItem: any = {};

    itemSchema.forEach(
      (field) => {

        emptyItem[field.key] = "";
      }
    );

    onChange([
      ...value,
      emptyItem
    ]);
  };

  const handleRemove = (
    index: number
  ) => {

    onChange(
      value.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleFieldChange = (
    index: number,
    key: string,
    fieldValue: string
  ) => {

    const updated = [...value];

    updated[index][key] =
      fieldValue;

    onChange(updated);
  };

  return (

    <Box>

      <Typography
        variant="subtitle2"
        sx={{ mb: 2 }}
      >
        {label}
      </Typography>

      {value.map(
        (item, index) => (

          <Box
            key={index}
            sx={{
              mb: 3,
              p: 2,
              border:
                "1px solid #ddd",
              borderRadius:
                "8px"
            }}
          >

            {itemSchema.map(
              (field) => (

                <TextField
                  key={field.key}

                  fullWidth

                  multiline={
                    field.type ===
                    "textarea"
                  }

                  rows={4}

                  label={
                    field.label
                  }

                  value={
                    item[field.key] || ""
                  }

                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      field.key,
                      e.target.value
                    )
                  }

                  sx={{ mb: 2 }}
                />
              )
            )}

            <Button
              color="error"
              variant="outlined"
              onClick={() =>
                handleRemove(index)
              }
            >
              Remove
            </Button>

          </Box>
        )
      )}

      <Button
        variant="contained"
        onClick={handleAdd}
      >
        Add Item
      </Button>

    </Box>
  );
};