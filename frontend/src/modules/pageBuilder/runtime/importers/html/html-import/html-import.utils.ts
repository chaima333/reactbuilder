export interface ImportHtmlContext {
  baseUrl?: string;
  matchers?: Record<string, any>;
}

export interface ImportHtmlResult {
  blocks: SerializedBlock[];
  warnings: ImportWarning[];
  matcherHits: ImportMatcherHit[];
  designTokens?: any;
  layoutDensity?: any;
}

export interface ImportWarning {
  type: string;
  message: string;
  path?: string;
}

export interface ImportMatcherHit {
  matcher: string;
  element: HTMLElement;
  score: number;
}

export interface SerializedBlock {
  id: string;
  type: string;
  meta?: {
    semanticType?: string;
    semanticVariant?: string;
    resolverName?: string;
  };
  data?: {
    props?: Record<string, any>;
    style?: {
      desktop?: Record<string, string>;
      tablet?: Record<string, string>;
      mobile?: Record<string, string>;
    };
  };
  children?: SerializedBlock[];
}

// Constantes pour les types de blocks
export const COMPILER_BLOCK_TYPES = {
  SECTION: 'section',
  FLEX: 'flex',
  FLEX_ITEM: 'flexItem',
  GRID: 'grid',
  GRID_ITEM: 'gridItem',
  TITLE: 'title',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button'
} as const;