import React from "react";

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import {
  useDraggable,
} from "@dnd-kit/core";

import {
  blockRegistry,
} from "../../core/blockRegistry";


const LAYOUT_PRESETS = [
  {
    type: "flex",
    id: "preset-2-cols", 
    label: "2 Columns (50/50)",
    presetData: {
      style: { desktop: { gap: "20px" } },
      children: [
        { type: "flexItem", data: { style: { desktop: { flex: "1" } } } },
        { type: "flexItem", data: { style: { desktop: { flex: "1" } } } },
      ]
    }
  }
];



const DraggableBlockItem = ({ type, config, presetData, id }: any) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id || `sidebar-${type}`, // إذا فما ID متاع Preset استعملو، وإلا استعمل العادي
    data: {
      isNew: true,
      type,
      presetData, // 👈 زدنا هذي! توّة dnd-kit هز معاه الـ "قالب" كامل
    },
  });

  return (
    <Paper ref={setNodeRef} {...listeners} {...attributes} sx={{ p: 2, mb: 1, display: 'flex', gap: 1, cursor: 'grab' }}>
      {config.icon}
      <Typography variant="body2">{config.label}</Typography>
    </Paper>
  );
};

export const BlockLibrary = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* 🏗️ قسم الـ Layouts الجاهزة */}
      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Structures</Typography>
      <Box sx={{ mb: 4, mt: 1 }}>
        {LAYOUT_PRESETS.map((p) => (
          <DraggableBlockItem 
            key={p.id} 
            id={p.id} 
            type={p.type} 
            config={{ label: p.label, icon: blockRegistry.flex.icon }} 
            presetData={p.presetData} // 👈 نمررو الـ قالب هوني
          />
        ))}
      </Box>

      {/* 🧱 قسم البلوكات العادية (نفس كودك القديم) */}
      <Typography variant="overline">Composants</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
        {Object.entries(blockRegistry).map(([type, config]) => (
          type !== "flexItem" && <DraggableBlockItem key={type} type={type} config={config} />
        ))}
      </Box>
    </Box>
  );
};


