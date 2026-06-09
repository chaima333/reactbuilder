export interface SemanticPreset {
  type: string;
  regions: Record<
  string,
  number
>;
  responsiveRules?: {
    mobile?: Record<
      string,
      unknown
    >;
  };
}
