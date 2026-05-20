import React from "react";
import GridViewIcon from "@mui/icons-material/GridView";
import { GridBlock } from "./GridBlock";
import { gridDefaults } from "./defaults";
import type { BlockConfig } from "../../../../types/page.types";

export const gridDefinition: BlockConfig = {
  type: "grid",
  label: "Grid Layout",
  category: "layout",
  icon: React.createElement(GridViewIcon),
  component: GridBlock,
  isContainer: true,
  allowedChildren: ["gridItem"],
  rules: {
    allowedParents: ["section", "flexItem"]
  },
  fields: [],
  defaultData: {
    props: {}, 
    style: {
      desktop: {
        display: "grid",
        columns: 3,
        gap: "16px"
      }
    }
  } // 
};