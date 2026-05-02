import { blockRegistry as staticRegistry } from "./blockRegistry";
import { TextBlock } from "../components/blocks/TextBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";
import { BlockConfig } from "../types/page.types";

const componentMap: Record<string, any> = {
  TitleBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
};

export const loadBlockRegistry = async () => {
  try {
    const res = await fetch("https://backend-rmfq.onrender.com/api/blocks/registry");
    if (!res.ok) throw new Error("Backend not responding");

    const dynamicBlocks = await res.json();

    const merged: Record<string, BlockConfig> = { ...staticRegistry };

    dynamicBlocks.forEach((b: any) => {
      merged[b.type] = {
        component: componentMap[b.componentName],

        label: b.label || b.type,

        isContainer: b.isContainer ?? false,

        allowedChildren: b.allowedChildren ?? [],

        fields: b.fields ?? [],

        defaultData: {
          props: b.defaultData?.props ?? {},
          style: b.defaultData?.style ?? { desktop: {} },
        }
      };
    });

    return merged;
  } catch (err) {
    console.warn("⚠️ Registry dynamic load failed, using static only.");
    return staticRegistry;
  }
};