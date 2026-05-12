import { blockRegistry as staticRegistry } from "./blockRegistry";
import { BlockConfig } from "../types/page.types";

export const loadBlockRegistry = async (): Promise<Record<string, BlockConfig>> => {
  console.log("🚀 Editor: Using Static Block Registry.");
  
  return staticRegistry;
};