import React from "react";
import ImageIcon from "@mui/icons-material/Image";
import { ImageBlock } from "./ImageBlock";
import { imageDefaults } from "./defaults";
import { imageFields } from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const imageDefinition: BlockConfig = {
  type: "image", 
  label: "Image",
  category: "content",
  icon: React.createElement(ImageIcon),
  component: ImageBlock,
  isContainer: false,
  rules: {
    allowedParents: ["section", "hero", "flexItem"]
  },
  fields: imageFields,
  defaultData: imageDefaults
};