export type Block = {
  id: string;
  type: "text" | "image" | "button" | "title" | "gallery" | "video";

  data: {
    props: Record<string, any>;
    style: Record<string, any>;
  };

  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    isAiGenerated?: boolean;
  };
};

export interface PageData {
  id: number;
  siteId: number;
  title: string;
  blocks: Block[];
}