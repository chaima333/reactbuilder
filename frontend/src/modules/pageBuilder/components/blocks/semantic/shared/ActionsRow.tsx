// src/modules/pageBuilder/components/blocks/semantic/shared/ActionsRow.tsx

import React from "react";

import {
  Box
} from "@mui/material";

import {
  ButtonPrimitive
} from "../../../primitives/ButtonPrimitive";

interface ActionItem {

  label: string;

  url?: string;
}

interface ActionsRowProps {

  actions: ActionItem[];

  device?:
    | "desktop"
    | "tablet"
    | "mobile";
}

export const ActionsRow = ({
  actions
}: ActionsRowProps) => {

  if (!actions?.length)
    return null;

  return (

    <Box
      sx={{

        display:
          "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        gap:
          2,

        flexWrap:
          "wrap",

        mt:
          4
      }}
    >

      {actions.map(
        (action, index) => (

          <ButtonPrimitive
            key={index}

            label={
              action.label
            }

            href={
              action.url || "#"
            }
          />
        )
      )}

    </Box>
  );
};