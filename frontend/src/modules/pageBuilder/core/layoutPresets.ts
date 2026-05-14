import { v4 as uuidv4 } from "uuid";

export const layoutPresets = {
  "two-columns": {
    label: "2 Columns (1/1)",
    type: "flex",
    data: { style: { desktop: { gap: "20px" } } },
    children: [
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
    ]
  },
  "sidebar-left": {
    label: "Sidebar Left (1/3)",
    type: "flex",
    data: { style: { desktop: { gap: "20px" } } },
    children: [
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
      { type: "flexItem", data: { style: { desktop: { flex: "3" } } }, children: [] },
    ]
  },
  "three-columns": {
    label: "3 Columns",
    type: "flex",
    data: { style: { desktop: { gap: "15px" } } },
    children: [
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
      { type: "flexItem", data: { style: { desktop: { flex: "1" } } }, children: [] },
    ]
  }
};