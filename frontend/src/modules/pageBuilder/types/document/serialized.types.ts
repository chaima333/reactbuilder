export interface SerializedBlock {

  id: string;

  type: string;

  data: {

    props: Record<string, unknown>;

    style?: unknown;
  };

  children: SerializedBlock[];
}

export interface PageDocument {
  schemaVersion: 1;

  schemaId: "page-builder-document";

  createdWith: string;

  metadata?: {
    createdAt?: string;

    updatedAt?: string;
  };

  blocks: SerializedBlock[];
}
