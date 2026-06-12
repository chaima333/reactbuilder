export const mockFigmaDocument = {
  id: "0:0",
  name: "Document",
  type: "DOCUMENT",
  children: [
    {
      id: "0:1",
      name: "Page 1",
      type: "CANVAS",
      children: [
        {
          id: "8:33",
          name: "Frame 1",
          type: "FRAME",

          children: [
            {
              id: "txt-1",
              type: "TEXT",
              name: "Hero Title",
              characters: "Welcome To ReactBuilder",

              style: {
                fontSize: 48,
                fontWeight: 700
              }
            },

            {
              id: "txt-2",
              type: "TEXT",
              name: "Subtitle",
              characters:
                "Imported from Figma",

              style: {
                fontSize: 18,
                fontWeight: 400
              }
            }
          ]
        }
      ]
    }
  ]
};