import { blockRegistry as staticRegistry } from "./blockRegistry";
import { TextBlock } from "../components/blocks/TextBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";

// 1. الماب هذي هي اللي تربط "اسم الـ Component" بالـ Code الحقيقي
const componentMap: Record<string, any> = {
  TitleBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  // أي Block جديد تزيدو مستقبلاً، تزيدو هنا بركة
};

export const loadBlockRegistry = async () => {
  try {
    const res = await fetch("https://backend-rmfq.onrender.com/api/blocks/registry");
    if (!res.ok) throw new Error("Backend not responding");
    
    const dynamicBlocks = await res.json(); 

    // نبدؤوا بالـ Static اللي عندك أصلاً
    const merged = { ...staticRegistry };

    // نزيدو عليهم اللي جاي مالـ Backend
    dynamicBlocks.forEach((b: any) => {
      merged[b.type] = {
        component: componentMap[b.componentName], 
        label: b.label || b.type,
        defaultData: b.defaultData
      };
    });

    return merged;
  } catch (err) {
    console.warn("⚠️ Registry dynamic load failed, using static only.");
    return staticRegistry;
  }
};