export type BlockType =
  | "text"
  | "image"
  | "button"
  | "title"
  | "gallery"
  | "video"
  | "section"; // 🔥 ما تنساش تزيد الـ section كـ نوع

// 1. نعرّفو الـ Column كـ Object فيه الـ Blocks متاعو
export interface Column {
  id: string;
  blocks: Block[]; // هنا TypeScript باش يفهم col.blocks
  width?: string | number; // باش تنجم تعمل Resize مبعد
}

export type Block = {
  id: string;
  type: BlockType;
  data: {
    props: Record<string, any>;
    style: Record<string, any>;
  };
  // 2. الـ children توّة يولي Array متاع Columns
  children?: Column[]; 
};

export interface PageData {
  id: number;
  siteId: number;
  title: string;
  blocks: Block[];
}