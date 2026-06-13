"use strict";

figma.showUI(__html__, {
  width: 420,
  height: 420
});

const hasImageFill = (node) => {
  return (
    "fills" in node &&
    Array.isArray(node.fills) &&
    node.fills.some(fill => fill.type === "IMAGE")
  );
};

const serializeNode = async (node) => {
  const base = {
    id: node.id,
    name: node.name,
    type: node.type
  };

  if ("absoluteBoundingBox" in node) {
    base.absoluteBoundingBox = node.absoluteBoundingBox;
  }

  if ("fills" in node) {
    base.fills = node.fills;
  }

  if ("strokes" in node) {
    base.strokes = node.strokes;
  }

  if ("cornerRadius" in node) {
    base.cornerRadius = node.cornerRadius;
  }

  if ("layoutMode" in node) {
    base.layoutMode = node.layoutMode;
  }

  if ("itemSpacing" in node) {
    base.itemSpacing = node.itemSpacing;
  }

  if ("paddingTop" in node) {
    base.paddingTop = node.paddingTop;
    base.paddingBottom = node.paddingBottom;
    base.paddingLeft = node.paddingLeft;
    base.paddingRight = node.paddingRight;
  }

  if (node.type === "TEXT") {
    base.characters = node.characters;
    base.style = {
      fontSize: node.fontSize,
      fontWeight: node.fontWeight,
      fontFamily:
        typeof node.fontName === "object"
          ? node.fontName.family
          : undefined,
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical,
      letterSpacing:
        typeof node.letterSpacing === "object"
          ? node.letterSpacing.value
          : 0,
      lineHeightPx:
        typeof node.lineHeight === "object" &&
        node.lineHeight.unit === "PIXELS"
          ? node.lineHeight.value
          : undefined
    };
  }

  if (hasImageFill(node)) {
    try {
      const bytes = await node.exportAsync({
        format: "PNG"
      });

      base.imageBase64 = undefined;
base.imageMimeType = undefined;
base.hasImage = true;
    } catch (error) {
      base.imageExportError =
        error instanceof Error
          ? error.message
          : "Image export failed";
    }
  }

  if ("children" in node) {
    base.children = await Promise.all(
      node.children.map(child => serializeNode(child))
    );
  }

  return base;
};

figma.ui.onmessage = async (msg) => {
  if (
    msg.type !== "EXPORT_SELECTION" &&
    msg.type !== "SEND_TO_REACTBUILDER"
  ) {
    return;
  }

  const selection = figma.currentPage.selection;

  if (!selection.length) {
    figma.ui.postMessage({
      type: "ERROR",
      message: "Select a frame first."
    });
    return;
  }

  const node = selection[0];

  if (node.type !== "FRAME") {
    figma.ui.postMessage({
      type: "ERROR",
      message: "Please select a FRAME."
    });
    return;
  }

  const payload = await serializeNode(node);

  if (msg.type === "EXPORT_SELECTION") {
    figma.ui.postMessage({
      type: "EXPORT_RESULT",
      payload
    });
    return;
  }

  if (msg.type === "SEND_TO_REACTBUILDER") {
  try {
  figma.notify("1 SEND CLICKED");

  figma.notify("2 BEFORE FETCH");

  const response = await fetch(
    "https://backend-rmfq.onrender.com/api/sites/2/pages/figma/import/raw",
    {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + msg.token
},
      body: JSON.stringify({
        source: "figma-plugin",
        payload
      })
    }
  );

  figma.notify("3 RESPONSE " + response.status);

  const result = await response.json();

  figma.notify("4 JSON OK");

  figma.ui.postMessage({
    type: "SEND_RESULT",
    payload: result
  });

  if (!response.ok) {
    figma.notify("Backend error: " + response.status);
    return;
  }

  if (
    result &&
    result.success &&
    result.data &&
    result.data.importId
  ) {
    figma.notify("5 Sent successfully");

    figma.openExternal(
      "https://frontend-three-beta-30.vercel.app/figma-import/" +
      result.data.importId
    );
  }
} catch (error) {
  figma.notify("Send failed");

  figma.ui.postMessage({
    type: "ERROR",
    message:
      error instanceof Error
        ? error.message
        : "Send failed"
  });
}
  }
};